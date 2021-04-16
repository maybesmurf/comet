import { ArgsType, Field, ID, Int, ObjectType, Publisher } from 'type-graphql'
import { Max, Min } from 'class-validator'
import { Channel, Group, Message, User } from '@/entity'
import { Context } from '@/types'
import { FilterQuery, QueryOrder } from '@mikro-orm/core'

@ArgsType()
export class GetMessagesArgs {
  @Field(() => ID, { nullable: true })
  channelId?: string

  @Field(() => ID, { nullable: true })
  groupId?: string

  @Field(() => ID, { nullable: true })
  userId?: string

  @Field({ defaultValue: false })
  pinned: boolean = false

  @Field({ nullable: true })
  initialTime: Date

  @Field(() => Int, { defaultValue: 100 })
  @Min(1)
  @Max(100)
  pageSize: number = 100

  @Field(() => Int, { defaultValue: 0 })
  @Min(0)
  page: number = 0
}

@ObjectType()
export class GetMessagesResponse {
  @Field()
  hasMore: boolean

  @Field(() => [Message])
  messages: Message[]
}

export async function getMessages(
  { em, user, liveQueryStore }: Context,
  {
    channelId,
    groupId,
    userId,
    pinned,
    initialTime,
    pageSize,
    page
  }: GetMessagesArgs
): Promise<GetMessagesResponse[]> {
  const channel = channelId ? await em.findOneOrFail(Channel, channelId) : null
  const group = groupId ? await em.findOneOrFail(Group, groupId) : null
  const toUser = userId ? await em.findOneOrFail(User, userId) : null

  if (!channel && !group && !toUser)
    throw new Error('error.message.missingArgs')

  const where: FilterQuery<Message> = {
    isDeleted: false
  }
  if (pinned) where.isPinned = true
  if (channel) {
    where.channel = channel
  } else if (group) {
    where.group = group
  } else if (toUser) {
    const [myData, theirData] = await user.getFriendData(em, userId)
    myData.showChat = true
    await em.persistAndFlush([myData, theirData])
    liveQueryStore.invalidate(`User:${toUser.id}`)

    where['$or'] = [
      { author: user, toUser },
      { author: toUser, toUser: user }
    ]
  }

  if (initialTime) {
    where.createdAt = {
      $lte: initialTime
    }
  }

  const messages = (
    await em.find(
      Message,
      where,
      ['author'],
      { createdAt: QueryOrder.DESC },
      pageSize + 1, // get one extra to determine hasMore
      page * pageSize
    )
  ).reverse()

  const hasMore = messages.length > pageSize
  return [
    {
      hasMore,
      messages: hasMore ? messages.slice(1, messages.length) : messages
    } as GetMessagesResponse
  ]
}