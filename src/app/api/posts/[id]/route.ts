import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import cloudinary from '@/lib/cloudinary'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const { data: post } = await supabase
    .from('posts')
    .select('public_id, type')
    .eq('id', id)
    .single()

  if (post) {
    const resourceType = post.type === 'audio' ? 'raw' : post.type === 'video' ? 'video' : 'image'
    await cloudinary.uploader.destroy(post.public_id, { resource_type: resourceType })
  }

  const { error } = await supabase.from('posts').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
