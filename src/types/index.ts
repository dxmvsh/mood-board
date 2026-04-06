export interface Post {
  id: string
  type: 'image' | 'video' | 'audio' | 'gif' | 'youtube'
  url: string
  public_id: string
  title: string | null
  description: string | null
  tags: string[]
  width: number | null
  height: number | null
  created_at: string
}
