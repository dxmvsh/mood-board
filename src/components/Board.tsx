'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import MasonryGrid from '@/components/MasonryGrid'
import Lightbox from '@/components/Lightbox'
import { Post } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ScrollHeader from './ScrollHeader'

interface BoardProps {
  initialPosts: Post[]
  initialIsAdmin: boolean
}

export default function Board({ initialPosts, initialIsAdmin }: BoardProps) {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [lightboxPost, setLightboxPost] = useState<Post | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<string | null>(null)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const lastScrollY = useRef(0)
  const isAdmin = initialIsAdmin

  useEffect(() => {
    let ready = false
    const timer = setTimeout(() => {
      lastScrollY.current = window.scrollY
      ready = true
    }, 500)

    // Mac trackpad / mouse wheel
    function onWheel(e: WheelEvent) {
      if (!ready) return
      if (e.deltaY < 0) setFiltersVisible(true)
      else if (e.deltaY > 0) setFiltersVisible(false)
    }

    // Desktop scroll fallback — skip on touch devices to avoid fighting touch handlers
    function onScroll() {
      if (!ready || 'ontouchstart' in window) return
      const current = window.scrollY
      if (current < lastScrollY.current - 5) setFiltersVisible(true)
      else if (current > lastScrollY.current + 5) setFiltersVisible(false)
      lastScrollY.current = current
    }

    // Touch — detect swipe direction on finger lift, ignore taps
    let touchStartY = 0
    let hasShownOnThisTouch = false
    function onTouchStart(e: TouchEvent) {
      touchStartY = e.touches[0].clientY
      hasShownOnThisTouch = false
    }
    function onTouchEnd(e: TouchEvent) {
      if (!ready || hasShownOnThisTouch) return
      const delta = e.changedTouches[0].clientY - touchStartY
      if (delta > 20) {
        setFiltersVisible(true)
        hasShownOnThisTouch = true
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  const allTags = Object.entries(
    posts.flatMap((p) => p.tags ?? []).reduce<Record<string, number>>((acc, tag) => {
      acc[tag] = (acc[tag] ?? 0) + 1
      return acc
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)

  const availableTypes = (['image', 'gif', 'video', 'youtube', 'audio'] as const).filter(
    (t) => posts.some((p) => p.type === t)
  )

  const filteredPosts = posts.filter((p) => {
    if (activeType && p.type !== activeType) return false
    if (activeTag && !p.tags?.includes(activeTag)) return false
    return true
  })

  const lightboxIndex = lightboxPost ? filteredPosts.findIndex((p) => p.id === lightboxPost.id) : -1

  const handleDelete = useCallback(async (id: string) => {
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
      if (lightboxPost?.id === id) setLightboxPost(null)
    }
  }, [lightboxPost])

  return (
    <main className="min-h-dvh text-white">

      <header className="relative flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h1 className="text-lg font-semibold tracking-tight absolute left-1/2 -translate-x-1/2 lowercase">board</h1>
        <div className="flex items-center gap-3 ml-auto">
          {isAdmin && (
            <>
              <Link
                href="/upload"
                className="text-sm bg-white text-black px-4 py-1.5 rounded-full font-medium hover:bg-neutral-200 transition-colors"
              >
                + Post
              </Link>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  router.refresh()
                }}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </header>

      {/* Filters — revealed on scroll up */}
      <ScrollHeader>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${filtersVisible ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          {availableTypes.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 pt-3 pb-1 scrollbar-hide h-12 items-center">
              <button
                onClick={() => setActiveType(null)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeType === null ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                all
              </button>
              {availableTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveType(activeType === type ? null : type)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors lowercase ${activeType === type ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
          {allTags.length > 0 && (
            <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide h-12 items-center">
              <button
                onClick={() => setActiveTag(null)}
                className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTag === null ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
              >
                all
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeTag === tag ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollHeader>

      <MasonryGrid
        posts={filteredPosts}
        onCardClick={setLightboxPost}
        onDelete={isAdmin ? handleDelete : undefined}
        isAdmin={isAdmin}
      />

      {lightboxPost && (
        <Lightbox
          post={lightboxPost}
          onClose={() => setLightboxPost(null)}
          onPrev={lightboxIndex > 0 ? () => setLightboxPost(filteredPosts[lightboxIndex - 1]) : undefined}
          onNext={lightboxIndex < filteredPosts.length - 1 ? () => setLightboxPost(filteredPosts[lightboxIndex + 1]) : undefined}
        />
      )}
    </main>
  )
}
