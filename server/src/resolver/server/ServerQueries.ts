import {
  Arg,
  Args,
  Authorized,
  Ctx,
  ID,
  Query,
  Resolver,
  UseMiddleware
} from 'type-graphql'
import { Channel, Server, ServerUserJoin } from '@/entity'
import {
  ChannelUsersResponse,
  GetServersArgs,
  GetServersResponse,
  GetServersSort
} from '@/resolver/server'
import { QueryOrder } from '@mikro-orm/core'
import { Context } from '@/types'
import { ServerPermission } from '@/types/ServerPermission'
import { ChannelPermission } from '@/types/ChannelPermission'
import { CheckChannelPermission } from '@/util'
import { CheckJoinedServer } from '@/util/auth/middlewares/CheckJoinedServer'

@Resolver(() => Server)
export class ServerQueries {
  @Authorized()
  @Query(() => GetServersResponse)
  async getServers(
    @Args()
    { sort, category, page, pageSize }: GetServersArgs,
    @Ctx() { user, em }: Context
  ) {
    let where = {}
    let orderBy = {}

    if (sort === GetServersSort.FEATURED) {
      where = { featured: true }
      orderBy = { featuredPosition: QueryOrder.ASC }
    } else if (category) {
      where = { category: category }
      orderBy = { name: QueryOrder.ASC }
    }

    if (sort === GetServersSort.NEW) {
      orderBy = { createdAt: QueryOrder.DESC }
    } else if (sort === GetServersSort.TOP) {
      orderBy = { userCount: QueryOrder.DESC }
    } else if (sort === GetServersSort.AZ) {
      orderBy = { name: QueryOrder.ASC }
    }

    const servers = await em.find(
      Server,
      where,
      [],
      orderBy,
      pageSize,
      page * pageSize
    )

    return {
      servers,
      page,
      nextPage: page >= 0 && servers.length >= pageSize ? page + 1 : null
    } as GetServersResponse
  }

  @Authorized()
  @Query(() => [Server])
  async getJoinedServers(@Ctx() { user, em }: Context) {
    await em.populate(user, ['serverJoins.server'])
    const joins = user.serverJoins
    return joins.getItems().map(join => join.server)
  }

  @CheckChannelPermission(
    ChannelPermission.ViewChannel,
    ServerPermission.ViewChannels
  )
  @Query(() => [ChannelUsersResponse])
  async getChannelUsers(
    @Ctx() { em }: Context,
    @Arg('channelId', () => ID) channelId: string
  ) {
    const channel = await em.findOneOrFail(Channel, channelId, ['server.roles'])
    const joins = await em.find(ServerUserJoin, { server: channel.server }, [
      'user',
      'roles'
    ])

    const result = []

    for (const role of channel.server.roles
      .getItems()
      .filter(role =>
        role.hasPermission(ServerPermission.DisplayRoleSeparately)
      )) {
      result.push({
        role: role.name,
        users: joins
          .filter(join => join.roles.getItems()[0] === role)
          .map(join => join.user)
      } as ChannelUsersResponse)
    }

    result.push({
      role: 'Online',
      users: joins
        .filter(
          join =>
            join.user.isOnline &&
            join.roles
              .getItems()
              .filter(role =>
                role.hasPermission(ServerPermission.DisplayRoleSeparately)
              ).length === 0
        )
        .map(join => join.user)
    } as ChannelUsersResponse)

    result.push({
      role: 'Offline',
      users: joins.filter(join => !join.user.isOnline).map(join => join.user)
    } as ChannelUsersResponse)

    return result
  }

  @CheckJoinedServer()
  @Query(() => [ServerPermission])
  async getServerPermissions(
    @Ctx() { user, em }: Context,
    @Arg('serverId', () => ID) serverId: string
  ) {
    const server = await em.findOneOrFail(Server, serverId, ['owner'])
    const perms = new Set<ServerPermission>()
    if (user.isAdmin) perms.add(ServerPermission.GlobalAdmin)
    if (server.owner === user) {
      perms.add(ServerPermission.ServerOwner)
      perms.add(ServerPermission.ServerAdmin)
    }
    const join = await em.findOneOrFail(ServerUserJoin, { user, server }, [
      'roles'
    ])
    const userRoles = join.roles.getItems()
    userRoles.forEach(role => role.permissions.forEach(perm => perms.add(perm)))
    return [...perms]
  }
}