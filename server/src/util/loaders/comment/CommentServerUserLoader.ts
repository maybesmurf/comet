import { EntityManager } from '@mikro-orm/postgresql'
import { Comment, ServerUser } from '@/entity'
import DataLoader from 'dataloader'
import {logger} from "@/util";

export const commentServerUserLoader = (em: EntityManager, userId: string) => {
  const loader = new DataLoader<string, ServerUser>(
    async (commentIds: string[]) => {
      logger('commentServerUserLoader', commentIds)
      loader.clearAll()
      const comments = await em.find(Comment, commentIds, ['post.server'])
      const serverIds = comments.map(c => c.post.server.id)
      const serverUsers = await em.find(
        ServerUser,
        {
          server: serverIds,
          user: userId
        },
        ['user', 'role']
      )
      const map: Record<string, ServerUser> = {}
      commentIds.forEach(commentId => {
        const comment = comments.find(c => c.id === commentId)
        map[commentId] = serverUsers.find(
          su => su.server === comment.post.server
        )
      })
      return commentIds.map(commentId => map[commentId])
    }
  )
  return loader
}
