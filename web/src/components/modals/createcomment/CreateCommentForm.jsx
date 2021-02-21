import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
// import Editor from '@/components/editor/Editor'
import IconSpinner from '@/components/ui/icons/IconSpinner'
import { useCommentStore } from '@/lib/stores/useCommentStore'
import { useMutation } from 'urql'
import { SUBMIT_COMMENT_MUTATION } from '@/lib/mutations'

const postBtn =
  'disabled:opacity-50 rounded-full h-8 px-6 label inline-flex items-center justify-center bg-blue-600 cursor-pointer transition transform hover:scale-105 focus:outline-none'

export default function CreateCommentForm({
  post,
  parentComment,
  commentVariables
}) {
  const { setCreateComment } = useCommentStore()

  const [textContent, setTextContent] = useState('')

  const [submitMutation] = useMutation(SUBMIT_COMMENT_MUTATION)

  const { handleSubmit } = useForm()

  const onSubmit = () => {
    const variables = {
      postId: post.id,
      textContent
    }

    if (parentComment) variables.parentCommentId = parentComment.id

    if (!variables.textContent) return
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-6 lg:rounded-2xl bg-white dark:bg-gray-800 space-y-4"
    >
      <div className="label text-tertiary">
        Replying to{' '}
        <span className="text-accent">
          @
          {parentComment ? parentComment.author.username : post.author.username}
        </span>
      </div>

      <div className="header-2 text-secondary pb-2">New Comment</div>

      {parentComment && (
        <div
          dangerouslySetInnerHTML={{ __html: parentComment.textContent }}
          className="prose prose-sm dark:prose-dark p-3 border rounded border-gray-200 dark:border-gray-700 max-h-32 overflow-y-auto min-w-full"
        />
      )}

      {/*<Editor value={textContent} setValue={setTextContent} />*/}

      <div>
        <div className="flex">
          <button
            type="submit"
            disabled={submitCommentMutation.isLoading || !textContent}
            className={`ml-auto ${postBtn}`}
          >
            {submitCommentMutation.isLoading && (
              <div className="mr-3">
                <IconSpinner />
              </div>
            )}
            Done
          </button>
        </div>

        <div className="tip text-tertiary mt-4 text-right">
          Read the{' '}
          <a
            to="https://github.com/cometx-io/about/blob/master/CONTENT.md"
            rel="noopener noreferrer"
            target="_blank"
            className="text-accent cursor-pointer hover:underline"
          >
            Content Policy
          </a>{' '}
          before commenting
        </div>
      </div>
    </form>
  )
}