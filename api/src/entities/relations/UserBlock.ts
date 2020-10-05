import { Field, ID, ObjectType } from 'type-graphql'
import { CreateDateColumn, Entity, ManyToOne, PrimaryColumn } from 'typeorm'
import { Lazy } from '@/Lazy'
import { User } from '@/entities/User'

@ObjectType()
@Entity()
export class UserBlock {
  @ManyToOne(() => User, user => user.blockTo)
  from: Lazy<User>

  @Field(() => ID)
  @PrimaryColumn('bigint')
  fromId: number

  @ManyToOne(() => User, user => user.blockFrom)
  to: Lazy<User>

  @Field(() => ID)
  @PrimaryColumn('bigint')
  toId: number

  @Field()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date
}
