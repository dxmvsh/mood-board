'use client'

import { useState, useRef, useEffect } from 'react'

interface UploadFormProps {
  onSuccess: () => void
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [tab, setTab] = useState<'file' | 'youtube'>('file')

  // File upload state
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Shared metadata
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')

  // YouTube state
  const [youtubeUrl, setYoutubeUrl] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      if (tab !== 'file') return
      const item = Array.from(e.clipboardData?.items ?? []).find(
        (i) => i.type.startsWith('image/')
      )
      if (!item) return
      const file = item.getAsFile()
      if (file) handleFile(file)
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [tab])

  function handleFile(selected: File) {
    setFile(selected)
    setError(null)
    if (selected.type.startsWith('image/') || selected.type.startsWith('video/')) {
      setPreview(URL.createObjectURL(selected))
    } else {
      setPreview(null)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFile(dropped)
  }

  async function handleFileSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)
    if (title) formData.append('title', title)
    if (description) formData.append('description', description)
    if (tags) formData.append('tags', tags)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()

    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Upload failed')
      return
    }

    setFile(null)
    setPreview(null)
    setTitle('')
    setDescription('')
    setTags('')
    onSuccess()
  }

  async function handleYouTubeSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!youtubeUrl.trim()) return

    setLoading(true)
    setError(null)

    const res = await fetch('/api/youtube', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: youtubeUrl, title, description, tags }),
    })
    const data = await res.json()

    setLoading(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to add YouTube video')
      return
    }

    setYoutubeUrl('')
    setTitle('')
    setDescription('')
    setTags('')
    onSuccess()
  }

  const inputClass = 'w-full bg-neutral-800 text-white rounded-xl px-4 py-2.5 text-sm placeholder-neutral-500 outline-none focus:ring-1 focus:ring-white/30'

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-neutral-800 rounded-xl p-1">
        <button
          type="button"
          onClick={() => { setTab('file'); setError(null) }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'file' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => { setTab('youtube'); setError(null) }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
            tab === 'youtube' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
          }`}
        >
          YouTube Link
        </button>
      </div>

      {tab === 'file' ? (
        <form onSubmit={handleFileSubmit} className="space-y-5">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? 'border-white bg-white/5'
                : 'border-neutral-700 hover:border-neutral-500'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            {file ? (
              <p className="text-white text-sm">{file.name}</p>
            ) : (
              <p className="text-neutral-400 text-sm">
                Drop a file here, <span className="underline">click to browse</span>, or paste
                <br />
                <span className="text-xs">Images, GIFs, Videos, Audio</span>
              </p>
            )}
          </div>

          {/* Preview */}
          {preview && (
            <div className="rounded-xl overflow-hidden max-h-64 flex items-center justify-center bg-neutral-900">
              {file?.type.startsWith('video/') ? (
                <video src={preview} className="max-h-64" muted controls />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="max-h-64 object-contain" />
              )}
            </div>
          )}

          <input type="text" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
          <input type="text" placeholder="Tags, comma-separated (optional)" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-white text-black font-semibold rounded-xl py-2.5 text-sm disabled:opacity-40 hover:bg-neutral-200 transition-colors"
          >
            {loading ? 'Uploading…' : 'Post'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleYouTubeSubmit} className="space-y-5">
          <input
            type="text"
            placeholder="YouTube URL or video ID"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className={inputClass}
            autoFocus
          />

          <input type="text" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
          <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={`${inputClass} resize-none`} />
          <input type="text" placeholder="Tags, comma-separated (optional)" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={!youtubeUrl.trim() || loading}
            className="w-full bg-white text-black font-semibold rounded-xl py-2.5 text-sm disabled:opacity-40 hover:bg-neutral-200 transition-colors"
          >
            {loading ? 'Adding…' : 'Post'}
          </button>
        </form>
      )}
    </div>
  )
}
