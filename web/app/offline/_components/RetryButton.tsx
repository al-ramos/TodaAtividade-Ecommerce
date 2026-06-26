'use client'

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
    >
      Tentar novamente
    </button>
  )
}
