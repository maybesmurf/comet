import React from 'react'

export default function PostText({ post, showFullText = false }) {
  if (!post.textContent) return null

  return (
    <div
      dangerouslySetInnerHTML={{ __html: post.textContent }}
      className={`prose prose-sm dark:prose-dark max-w-none ${
        !showFullText && 'line-clamp-3'
      }`}
    />
  )
}
