import { Field, ID, InputType, Publisher } from 'type-graphql'
import { Length } from 'class-validator'
import { Context } from '@/types'
import {
  Comment,
  CommentVote,
  Post,
  Reply,
  ServerPermission,
  ServerUser,
  User
} from '@/entity'
import { handleText } from '@/util'
import { ChangePayload, ChangeType } from '@/resolver/subscriptions'

@InputType()
export class CreateCommentInput {
  @Field()
  @Length(1, 100000, {
    message: 'Text must be between 1 and 100000 characters'
  })
  text: string

  @Field(() => ID)
  postId: string

  @Field(() => ID, { nullable: true })
  parentCommentId?: string
}

export async function createComment(
  { em, userId }: Context,
  { text, postId, parentCommentId }: CreateCommentInput,
  notifyCommentChanged: Publisher<ChangePayload>,
  notifyReplyChanged: Publisher<ChangePayload>
): Promise<Comment> {
  text = text.replace(/<[^/>][^>]*><\/[^>]+>/, '')
  if (!text) throw new Error('error.comment.empty')

  const post = await em.findOneOrFail(Post, postId, ['author'])
  const user = await em.findOneOrFail(User, userId)

  const parentComment = parentCommentId
    ? await em.findOneOrFail(Comment, parentCommentId, ['author'])
    : null

  text = handleText(text)

  const comment = em.create(Comment, {
    text: text,
    parentComment,
    post,
    author: user,
    voteCount: 1
  })
  comment.isVoted = true
  const vote = em.create(CommentVote, { comment, user })
  post.commentCount++
  await em.persistAndFlush([comment, post, vote])

  let reply: Reply
  if (parentComment) {
    if (parentComment.author !== user) {
      reply = em.create(Reply, {
        comment,
        user: parentComment.author
      })
    }
  } else {
    await em.populate(post, ['author'])
    if (post.author !== user) {
      reply = em.create(Reply, {
        comment,
        user: post.author
      })
    }
  }
  await notifyCommentChanged({ id: comment.id, type: ChangeType.Added })
  if (reply) {
    await em.persistAndFlush(reply)
    await notifyReplyChanged({ id: reply.id, type: ChangeType.Added })
  }
  return comment
}