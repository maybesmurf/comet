import { EntityManager } from '@mikro-orm/postgresql'
import { Message, ServerUser } from '@/entity'
import DataLoader from 'dataloader'

export const messageServerUserLoader = (em: EntityManager, userId: string) => {
  const loader = new DataLoader<string, ServerUser>(
    async (messageIds: string[]) => {
      loader.clearAll()
      const messages = await em.find(Message, messageIds, ['channel.server'])
      const serverIds = messages
        .filter(m => !!m.channel)
        .map(m => m.channel.server.id)
      const serverUsers = await em.find(
        ServerUser,
        {
          server: serverIds,
          user: userId
        },
        ['user', 'role']
      )
      const map: Record<string, ServerUser> = {}
      messageIds.forEach(messageId => {
        const message = messages.find(c => c.id === messageId)
        map[messageId] = message.channel
          ? serverUsers.find(su => su.server === message.channel.server)
          : null
      })
      return messageIds.map(messageId => map[messageId])
    }
  )
  return loader
}