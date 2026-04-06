import { createClient } from '@/lib/supabase/server'
import Board from '@/components/Board'
import { Post } from '@/types'

export default async function Home() {
  const supabase = await createClient()

  const [{ data: posts }, { data: { user } }] = await Promise.all([
    supabase.from('posts').select('*').order('created_at', { ascending: false }),
    supabase.auth.getUser(),
  ])

  return <Board initialPosts={(posts ?? []) as Post[]} initialIsAdmin={!!user} />
}
