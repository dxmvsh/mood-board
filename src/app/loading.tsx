export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0c1614' }}>
      <div className="flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/flower-art.gif" alt="loading" className="w-32 h-32 object-cover rounded-3xl" />
        <p className="shimmer text-sm tracking-widest">Loading...</p>
      </div>
    </div>
  )
}
