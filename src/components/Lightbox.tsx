'use client'

import { useEffect, useCallback, useRef } from 'react'
import { Post } from '@/types'

interface LightboxProps {
  post: Post
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
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

export default function Lightbox({ post, onClose, onPrev, onNext }: LightboxProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    },
    [onClose, onPrev, onNext]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [handleKey])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white text-3xl leading-none hover:text-neutral-300"
        onClick={onClose}
      >
        ×
      </button>

      {/* Prev */}
      {onPrev && (
        <button
          className="absolute left-4 text-white text-4xl leading-none hover:text-neutral-300 select-none"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
        >
          ‹
        </button>
      )}

      {/* Next */}
      {onNext && (
        <button
          className="absolute right-4 text-white text-4xl leading-none hover:text-neutral-300 select-none"
          onClick={(e) => { e.stopPropagation(); onNext() }}
        >
          ›
        </button>
      )}

      {/* Content */}
      <div
        className="max-w-5xl max-h-[90vh] w-full flex flex-col items-center gap-3 px-16"
        onClick={(e) => e.stopPropagation()}
      >
        {post.type === 'image' || post.type === 'gif' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.url}
            alt={post.title ?? ''}
            className="max-h-[80vh] max-w-full rounded-xl object-contain"
          />
        ) : post.type === 'video' ? (
          <video
            ref={videoRef}
            src={post.url}
            className="max-h-[80vh] max-w-full rounded-xl"
            controls
            autoPlay
            onLoadedMetadata={() => {
              if (videoRef.current && videoRef.current.duration < 30) {
                videoRef.current.loop = true
              }
            }}
          />
        ) : post.type === 'youtube' ? (
          <div className="w-full aspect-video rounded-xl overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${post.public_id}?autoplay=1`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full bg-neutral-900 rounded-xl p-8 flex flex-col items-center gap-4">
            <audio src={post.url} controls className="w-full" autoPlay />
          </div>
        )}

        <div className="text-center">
          {post.title && <p className="text-white font-semibold text-lg">{post.title}</p>}
          {post.description && (
            <p className="text-neutral-400 text-sm mt-1">{post.description}</p>
          )}
          <p className="text-neutral-500 text-xs mt-1" suppressHydrationWarning>
            {formatDate(post.created_at)}
          </p>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-white/10 text-white rounded-full px-3 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
