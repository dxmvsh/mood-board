'use client'

import { useRouter } from 'next/navigation'
import UploadForm from '@/components/UploadForm'
import Link from 'next/link'

export default function UploadPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <Link href="/" className="text-neutral-400 hover:text-white text-sm transition-colors">
          ← Back
        </Link>
        <h1 className="text-base font-semibold">New Post</h1>
        <div className="w-16" />
      </header>

      <div className="max-w-lg mx-auto px-6 py-8">
        <UploadForm onSuccess={() => router.push('/')} />
      </div>
    </main>
  )
}
