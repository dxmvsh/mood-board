import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function extractYouTubeId(input: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/,
  ]
  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match) return match[1]
  }
  return null
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { url, title, description, tags } = body

  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
  }

  const videoId = extractYouTubeId(url.trim())
  if (!videoId) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
  }

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`

  const { data, error } = await supabase
    .from('posts')
    .insert({
      type: 'youtube',
      url: watchUrl,
      public_id: videoId,
      title: title || null,
      description: description || null,
      tags: tags ? tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
      width: 1280,
      height: 720,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post: data })
}
