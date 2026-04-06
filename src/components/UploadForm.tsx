'use client'

import { useState, useRef, useEffect } from 'react'

interface UploadFormProps {
  onSuccess: () => void
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handlePaste(e: ClipboardEvent) {
      const item = Array.from(e.clipboardData?.items ?? []).find(
        (i) => i.type.startsWith('image/')
      )
      if (!item) return
      const file = item.getAsFile()
      if (file) handleFile(file)
    }
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

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

  async function handleSubmit(e: React.FormEvent) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-neutral-800 text-white rounded-xl px-4 py-2.5 text-sm placeholder-neutral-500 outline-none focus:ring-1 focus:ring-white/30"
      />

      <textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full bg-neutral-800 text-white rounded-xl px-4 py-2.5 text-sm placeholder-neutral-500 outline-none focus:ring-1 focus:ring-white/30 resize-none"
      />

      <input
        type="text"
        placeholder="Tags, comma-separated (optional)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="w-full bg-neutral-800 text-white rounded-xl px-4 py-2.5 text-sm placeholder-neutral-500 outline-none focus:ring-1 focus:ring-white/30"
      />

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={!file || loading}
        className="w-full bg-white text-black font-semibold rounded-xl py-2.5 text-sm disabled:opacity-40 hover:bg-neutral-200 transition-colors"
      >
        {loading ? 'Uploading…' : 'Post'}
      </button>
    </form>
  )
}
