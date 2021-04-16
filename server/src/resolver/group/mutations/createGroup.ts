import { Context } from '@/types'
import { Field, InputType } from 'type-graphql'
import { Group, User } from '@/entity'
import { ArrayMaxSize } from 'class-validator'

@InputType()
export class CreateGroupInput {
  @Field(() => [String])
  @ArrayMaxSize(9)
  usernames: string[]
}

export async function createGroup(
  { em, user, liveQueryStore }: Context,
  { usernames }: CreateGroupInput
): Promise<Group> {
  if (usernames.length > 9) throw new Error('error.group.maxSize')
  const users = [user]
  for (const username of usernames) {
    users.push(await em.findOneOrFail(User, { username }))
  }
  const group = em.create(Group, {
    users,
    owner: user
  })
  await em.persistAndFlush(group)
  liveQueryStore.invalidate(users.map(user => `User:${user.id}`))
  return group
}