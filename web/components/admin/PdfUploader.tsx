'use client'

import { useRef, useState, useCallback } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PdfUploaderProps {
  slug?: string
  onUpload: (key: string) => void
  className?: string
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'

export default function PdfUploader({ slug, onUpload, className }: PdfUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<UploadState>('idle')
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const reset = () => {
    setState('idle')
    setProgress(0)
    setFileName('')
    setErrorMsg('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const upload = useCallback(
    async (file: File) => {
      if (file.type !== 'application/pdf') {
        setErrorMsg('Apenas arquivos PDF são aceitos.')
        setState('error')
        return
      }
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg('O arquivo não pode ultrapassar 50 MB.')
        setState('error')
        return
      }

      setFileName(file.name)
      setState('uploading')
      setProgress(0)

      const formData = new FormData()
      formData.append('file', file)
      if (slug) formData.append('slug', slug)

      // XMLHttpRequest para progresso real
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 90))
          }
        })

        xhr.addEventListener('load', () => {
          if (xhr.status === 201) {
            const json = JSON.parse(xhr.responseText) as { key: string }
            setProgress(100)
            setState('done')
            onUpload(json.key)
            resolve()
          } else {
            let msg = 'Erro no upload.'
            try {
              const json = JSON.parse(xhr.responseText) as { error?: string }
              if (json.error) msg = json.error
            } catch { /* */ }
            setErrorMsg(msg)
            setState('error')
            reject(new Error(msg))
          }
        })

        xhr.addEventListener('error', () => {
          setErrorMsg('Falha na conexão. Tente novamente.')
          setState('error')
          reject(new Error('network'))
        })

        xhr.open('POST', '/api/admin/upload')
        xhr.send(formData)
      })
    },
    [slug, onUpload],
  )

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return
    void upload(files[0])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className={cn('space-y-2', className)}>
      {state === 'idle' && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Área de upload de PDF"
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50',
          )}
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Arraste o PDF aqui ou <span className="text-blue-600">clique para selecionar</span>
            </p>
            <p className="mt-1 text-xs text-gray-500">PDF — máximo 50 MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {state === 'uploading' && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <span className="truncate max-w-[200px]">{fileName}</span>
            </div>
            <span className="font-medium text-blue-700">{progress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {state === 'done' && (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
            <FileText className="h-4 w-4 text-green-600 flex-shrink-0" />
            <span className="truncate max-w-[220px] font-medium">{fileName}</span>
          </div>
          <button
            type="button"
            onClick={reset}
            className="ml-2 rounded-full p-1 text-green-600 hover:bg-green-100"
            aria-label="Remover arquivo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {state === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-start gap-2 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{errorMsg}</p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="mt-2 text-xs font-medium text-red-600 underline hover:text-red-800"
          >
            Tentar novamente
          </button>
        </div>
      )}
    </div>
  )
}
