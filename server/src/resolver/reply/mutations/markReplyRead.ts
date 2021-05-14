import { Field, ID, InputType, Publisher } from 'type-graphql'
import { ChangePayload, ChangeType } from '@/resolver/subscriptions'
import { Context } from '@/types'
import { Reply, User } from '@/entity'

@InputType()
export class MarkReplyReadInput {
  @Field(() => ID)
  replyId: string
}

export async function markReplyRead(
  { em, userId }: Context,
  { replyId }: MarkReplyReadInput,
  notifyReplyChanged: Publisher<ChangePayload>
): Promise<Reply> {
  const reply = await em.findOneOrFail(Reply, replyId, [
    'user',
    'comment.author.user',
    'comment.author.roles',
    'comment.post.server',
    'comment.parentComment.author.user',
    'comment.parentComment.author.roles'
  ])
  if (reply.user !== em.getReference(User, userId))
    throw new Error('Not your reply')
  if (reply.isRead) throw new Error('Already marked read')
  reply.isRead = true
  await em.persistAndFlush(reply)
  await notifyReplyChanged({ id: replyId, type: ChangeType.Updated })
  return reply
}
