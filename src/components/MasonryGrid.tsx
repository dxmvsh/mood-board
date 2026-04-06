'use client'

import { Post } from '@/types'
import MediaCard from './MediaCard'

interface MasonryGridProps {
  posts: Post[]
  onCardClick: (post: Post) => void
  onDelete?: (id: string) => void
  isAdmin?: boolean
}

export default function MasonryGrid({ posts, onCardClick, onDelete, isAdmin }: MasonryGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-neutral-500">
        <p>No posts yet.</p>
      </div>
    )
  }

  return (
    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 px-4 py-6">
      {posts.map((post) => (
        <MediaCard
          key={post.id}
          post={post}
          onClick={onCardClick}
          onDelete={onDelete}
          isAdmin={isAdmin}
        />
      ))}
    </div>
  )
}
