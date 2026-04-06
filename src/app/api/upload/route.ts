import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import cloudinary from '@/lib/cloudinary'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File
  const title = formData.get('title') as string | null
  const description = formData.get('description') as string | null
  const tags = formData.get('tags') as string | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const mime = file.type
  let resourceType: 'image' | 'video' | 'raw' = 'image'
  let postType: 'image' | 'video' | 'audio' | 'gif' = 'image'

  if (mime.startsWith('video/')) {
    resourceType = 'video'
    postType = 'video'
  } else if (mime.startsWith('audio/')) {
    resourceType = 'raw'
    postType = 'audio'
  } else if (mime === 'image/gif') {
    postType = 'gif'
  }

  const uploadResult = await new Promise<{ secure_url: string; public_id: string; width?: number; height?: number }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: resourceType,
            folder: 'mood-board',
          },
          (error, result) => {
            if (error || !result) return reject(error)
            resolve(result as { secure_url: string; public_id: string; width?: number; height?: number })
          }
        )
        .end(buffer)
    }
  )

  const { data, error } = await supabase
    .from('posts')
    .insert({
      type: postType,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      title: title || null,
      description: description || null,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      width: uploadResult.width ?? null,
      height: uploadResult.height ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ post: data })
}
