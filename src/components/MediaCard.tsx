'use client'

import { useState } from 'react'
import { Post } from '@/types'

interface MediaCardProps {
  post: Post
  onClick: (post: Post) => void
  onDelete?: (id: string) => void
  isAdmin?: boolean
}

export default function MediaCard({ post, onClick, onDelete, isAdmin }: MediaCardProps) {
  const [hovered, setHovered] = useState(false)

  const showDetails = hovered

  return (
    <div
      className="relative break-inside-avoid mb-4 rounded-2xl overflow-hidden bg-black/40 backdrop-blur-sm cursor-pointer group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(post)}
    >
      {post.type === 'image' || post.type === 'gif' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.url}
          alt={post.title ?? ''}
          className="w-full block object-cover"
          loading="lazy"
        />
      ) : post.type === 'video' ? (
        <video
          src={post.url}
          className="w-full block"
          muted
          loop
          playsInline
          autoPlay={hovered}
        />
      ) : post.type === 'youtube' ? (
        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://img.youtube.com/vi/${post.public_id}/hqdefault.jpg`}
            alt={post.title ?? ''}
            className="w-full block object-cover"
            loading="lazy"
          />
          <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${hovered ? 'opacity-100' : 'opacity-70'}`}>
            <div className="bg-red-600 rounded-full w-12 h-12 flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white fill-current ml-0.5" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-32 bg-neutral-800">
          <AudioIcon />
          <span className="ml-2 text-sm text-neutral-400 truncate max-w-[60%]">
            {post.title ?? 'Audio'}
          </span>
        </div>
      )}

      {showDetails && (
        <>
          {/* Full card dim */}
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          {/* Details panel */}
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
            {post.title && (
              <p className="text-white text-sm font-medium truncate">{post.title}</p>
            )}
            <p className="text-neutral-300 text-xs mt-0.5" suppressHydrationWarning>
              {formatDate(post.created_at)}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {post.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-white/20 text-white rounded-full px-2 py-0.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {isAdmin && onDelete && (
            <button
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(post.id)
              }}
            >
              ✕
            </button>
          )}
        </>
      )}
    </div>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const day = String(d.getDate()).padStart(2, '0')
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const offsetMin = -d.getTimezoneOffset()
  const sign = offsetMin >= 0 ? '+' : '-'
  const absH = String(Math.floor(Math.abs(offsetMin) / 60))
  const tz = `GMT${sign}${absH}`
  return `${day} ${month} ${year} ${hh}:${mm} ${tz}`
}

function AudioIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8 text-neutral-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
      />
    </svg>
  )
}
