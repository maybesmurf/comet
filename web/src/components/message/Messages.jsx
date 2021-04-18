import { useCallback, useRef, useState, useEffect } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { useNewMessageNotification } from '@/components/message/useNewMessageNotification'
import { usePrependedMessagesCount } from '@/components/message/usePrependedMessagesCount'
import Message from '@/components/message/Message'
import { useMessages } from '@/components/message/useMessages'
import MessageInput from '@/components/message/input/MessageInput'
import { useShouldForceScrollToBottom } from '@/components/message/useShouldForceScrollToBottom'
import MessagesStart from '@/components/message/MessagesStart'
import { usePrevious } from 'react-use'
import { useMutation } from 'urql'
import { useLocation } from 'react-router-dom'
import {
  useReadChannelMutation,
  useReadDmMutation,
  useReadGroupMutation
} from '@/graphql/hooks'

const PREPEND_OFFSET = 10 ** 7

export default function Messages({ channel, user, group }) {
  const [_viewDmRes, viewDm] = useReadDmMutation()
  const [_viewGroupRes, viewGroup] = useReadGroupMutation()
  const [_viewChannelRes, viewChannel] = useReadChannelMutation()
  const [initialTime, setInitialTime] = useState(() => new Date())

  const { pathname } = useLocation()
  useEffect(() => setInitialTime(new Date()), [pathname])

  const virtuoso = useRef(null)

  const [messages, fetching, fetchMore, hasMore] = useMessages({
    channel,
    user,
    group,
    initialTime
  })

  const [length, setLength] = useState(messages?.length || 0)
  const prevLength = usePrevious(length)
  useEffect(() => {
    setLength(messages?.length || 0)
    if (prevLength === 0) virtuoso.current.scrollBy({ top: PREPEND_OFFSET })

    if (channel) viewChannel({ channelId: channel.id })
    if (group) viewGroup({ groupId: group.id })
    if (user) viewDm({ userId: user.id })
  }, [messages?.length])

  const {
    atBottom,
    newMessagesNotification,
    setNewMessagesNotification
  } = useNewMessageNotification(messages)

  const numItemsPrepended = usePrependedMessagesCount(messages)
  const shouldForceScrollToBottom = useShouldForceScrollToBottom(messages)

  const messageRenderer = useCallback(
    (messageList, virtuosoIndex) => {
      const messageIndex = virtuosoIndex + numItemsPrepended - PREPEND_OFFSET

      const message = messageList[messageIndex]
      const prevMessage =
        messageIndex > 0 ? messageList[messageIndex - 1] : null

      if (!message) return <div style={{ height: '1px' }} /> // returning null or zero height breaks the virtuoso

      return (
        <Message
          message={message}
          showUser={
            messageIndex === 0 ||
            (prevMessage && prevMessage.author.id !== message.author.id)
          }
        />
      )
    },
    [numItemsPrepended]
  )

  return (
    <>
      <div className="relative flex-1 overflow-x-hidden overflow-y-auto dark:bg-gray-750 w-full h-full">
        <Virtuoso
          className="scrollbar"
          alignToBottom
          atBottomStateChange={isAtBottom => {
            atBottom.current = isAtBottom
            if (isAtBottom && newMessagesNotification) {
              setNewMessagesNotification(false)
            }
          }}
          components={{
            Header: () => (
              <MessagesStart
                user={user}
                group={group}
                channel={channel}
                show={!hasMore}
              />
            ),
            Footer: () => <div className="h-5.5" />
          }}
          firstItemIndex={PREPEND_OFFSET - numItemsPrepended}
          followOutput={isAtBottom => {
            if (shouldForceScrollToBottom()) {
              return 'auto'
            }
            // a message from another user has been received - don't scroll to bottom unless already there
            return isAtBottom ? 'auto' : false
          }}
          initialTopMostItemIndex={
            messages && messages.length > 0 ? messages.length - 1 : 0
          }
          itemContent={i => messageRenderer(messages, i)}
          overscan={0}
          ref={virtuoso}
          startReached={() => {
            if (!fetching && hasMore) fetchMore()
          }}
          style={{ overflowX: 'hidden' }}
          totalCount={messages?.length || 0}
        />
      </div>
      <MessageInput channel={channel} user={user} group={group} />
    </>
  )
}
