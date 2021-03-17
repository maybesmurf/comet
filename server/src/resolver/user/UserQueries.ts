import {
  Arg,
  Authorized,
  Ctx,
  FieldResolver,
  ID,
  Query,
  Resolver,
  Root
} from 'type-graphql'
import { Context } from '@/types'
import { FriendData, Group, User } from '@/entity'
import { GroupDmUnion } from '@/resolver/user/types/GroupDmUnion'
import { QueryOrder } from '@mikro-orm/core'

@Resolver(() => User)
export class UserQueries {
  @Query(() => User, {
    nullable: true,
    description: 'Returns the currently logged in user, or null'
  })
  async getCurrentUser(@Ctx() { user, em }: Context) {
    if (!user) {
      return null
    }

    if (user.isBanned)
      throw new Error(`Banned${user.banReason ? `: ${user.banReason}` : ''}`)

    user.lastLogin = new Date()
    await em.persistAndFlush(user)
    return user
  }

  @Authorized()
  @Query(() => [GroupDmUnion], {
    description:
      'Get list of groups and DMs, sorted by latest activity (updatedAt)'
  })
  async getGroupsAndDms(
    @Ctx() { user, em }: Context
  ): Promise<Array<typeof GroupDmUnion>> {
    const dms = await em.find(
      FriendData,
      { user, showChat: true },
      ['toUser'],
      { lastMessageAt: QueryOrder.DESC }
    )

    await em.populate(user, ['groups'])
    const groups = user.groups.getItems()
    const arr: (Group | FriendData)[] = [].concat(groups).concat(dms)
    return arr
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
      .map(i => {
        if (i instanceof Group) return i
        else if (i instanceof FriendData) return i.toUser
      })
  }

  @FieldResolver(() => Boolean)
  async isCurrentUser(
    @Root() user: User,
    @Ctx() { user: currentUser }: Context
  ) {
    return currentUser && user.id === currentUser.id
  }

  @Authorized()
  @Query(() => User)
  async getUser(
    @Ctx() { em }: Context,
    @Arg('userId', () => ID) userId: string
  ) {
    return em.findOneOrFail(User, userId)
  }
}