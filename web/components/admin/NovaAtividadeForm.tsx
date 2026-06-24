'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Loader2, Save, Eye } from 'lucide-react'
import { toast } from 'sonner'
import PdfUploader from '@/components/admin/PdfUploader'
import { GRADE_LABELS, DISCIPLINE_LABELS, formatPrice, type GradeLevel, type Discipline } from '@/lib/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title: z.string().min(3, 'Título deve ter ao menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter ao menos 10 caracteres'),
  pedagogical_objectives: z.string().optional(),
  priceInput: z
    .string()
    .regex(/^\d+([.,]\d{1,2})?$/, 'Preço inválido. Ex: 9,90')
    .transform((v) => Math.round(parseFloat(v.replace(',', '.')) * 100)),
  grade_level: z.enum(
    ['1ano', '2ano', '3ano', '4ano', '5ano', '6ano', '7ano', '8ano', '9ano'] as const,
  ),
  discipline: z.enum(
    ['matematica', 'portugues', 'ciencias', 'historia', 'geografia', 'artes', 'educacao-fisica', 'ingles'] as const,
  ),
  thumbnail_url: z.string().optional(),
})

type FormValues = {
  title: string
  description: string
  pedagogical_objectives: string
  priceInput: string
  grade_level: GradeLevel | ''
  discipline: Discipline | ''
  thumbnail_url: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function pricePreview(raw: string): string {
  const num = parseFloat(raw.replace(',', '.'))
  if (isNaN(num)) return ''
  return formatPrice(Math.round(num * 100))
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NovaAtividadeForm() {
  const router = useRouter()

  const [values, setValues] = useState<FormValues>({
    title: '',
    description: '',
    pedagogical_objectives: '',
    priceInput: '',
    grade_level: '',
    discipline: '',
    thumbnail_url: '',
  })

  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({})
  const [pdfKey, setPdfKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = (field: keyof FormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const handlePdfUpload = useCallback((key: string) => {
    setPdfKey(key)
  }, [])

  const validate = () => {
    const result = schema.safeParse(values)
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      const mapped: Partial<Record<keyof FormValues, string>> = {}
      for (const [k, v] of Object.entries(flat)) {
        if (v?.[0]) mapped[k as keyof FormValues] = v[0]
      }
      setErrors(mapped)
      return null
    }
    setErrors({})
    if (!pdfKey) {
      toast.error('Faça o upload do PDF antes de salvar.')
      return null
    }
    return result.data
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = validate()
    if (!parsed) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          pedagogical_objectives: values.pedagogical_objectives || undefined,
          price: parsed.priceInput,
          grade_level: parsed.grade_level,
          discipline: parsed.discipline,
          full_pdf_path: pdfKey,
          thumbnail_url: values.thumbnail_url || '',
        }),
      })

      const json = (await res.json()) as { product?: { slug: string }; error?: unknown }

      if (!res.ok) {
        toast.error('Erro ao salvar atividade. Verifique os campos e tente novamente.')
        console.error(json.error)
        return
      }

      toast.success('Atividade cadastrada! Ela ficará inativa até você publicá-la.')
      router.push('/admin/atividades')
      router.refresh()
    } catch (err) {
      console.error(err)
      toast.error('Falha de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const slugPreview = values.title ? toSlug(values.title) : ''

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* PDF Upload */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Arquivo PDF</h2>
        <p className="mb-4 text-sm text-gray-500">
          Faça o upload do arquivo antes de preencher os demais campos.
        </p>
        <PdfUploader slug={slugPreview || undefined} onUpload={handlePdfUpload} />
        {!pdfKey && (
          <p className="mt-2 text-xs text-gray-400">Obrigatório — sem PDF a atividade não pode ser salva.</p>
        )}
      </section>

      {/* Informações principais */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-5">
        <h2 className="text-base font-semibold text-gray-900">Informações da atividade</h2>

        {/* Título */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={values.title}
            onChange={set('title')}
            placeholder="Ex: Atividade de Frações — 4º Ano"
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {slugPreview && (
            <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
              <Eye className="h-3 w-3" />
              /atividades/<span className="font-mono text-gray-600">{slugPreview}</span>
            </p>
          )}
          {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
        </div>

        {/* Descrição */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Descrição <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={values.description}
            onChange={set('description')}
            placeholder="Descreva brevemente o conteúdo da atividade..."
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
          {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
        </div>

        {/* Objetivos pedagógicos */}
        <div>
          <label htmlFor="objectives" className="block text-sm font-medium text-gray-700">
            Objetivos pedagógicos
            <span className="ml-1 text-xs font-normal text-gray-400">(opcional)</span>
          </label>
          <textarea
            id="objectives"
            rows={2}
            value={values.pedagogical_objectives}
            onChange={set('pedagogical_objectives')}
            placeholder="O que o aluno vai aprender com esta atividade..."
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>
      </section>

      {/* Classificação e preço */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-base font-semibold text-gray-900">Classificação e preço</h2>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {/* Série */}
          <div>
            <label htmlFor="grade" className="block text-sm font-medium text-gray-700">
              Série escolar <span className="text-red-500">*</span>
            </label>
            <select
              id="grade"
              value={values.grade_level}
              onChange={set('grade_level')}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {(Object.entries(GRADE_LABELS) as [GradeLevel, string][]).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
            {errors.grade_level && <p className="mt-1 text-xs text-red-600">{errors.grade_level}</p>}
          </div>

          {/* Disciplina */}
          <div>
            <label htmlFor="discipline" className="block text-sm font-medium text-gray-700">
              Disciplina <span className="text-red-500">*</span>
            </label>
            <select
              id="discipline"
              value={values.discipline}
              onChange={set('discipline')}
              className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {(Object.entries(DISCIPLINE_LABELS) as [Discipline, string][]).map(([k, label]) => (
                <option key={k} value={k}>{label}</option>
              ))}
            </select>
            {errors.discipline && <p className="mt-1 text-xs text-red-600">{errors.discipline}</p>}
          </div>

          {/* Preço */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Preço (R$) <span className="text-red-500">*</span>
            </label>
            <div className="relative mt-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-sm text-gray-500">R$</span>
              <input
                id="price"
                type="text"
                inputMode="decimal"
                value={values.priceInput}
                onChange={set('priceInput')}
                placeholder="9,90"
                className="block w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {values.priceInput && !errors.priceInput && (
              <p className="mt-1 text-xs text-gray-500">
                {pricePreview(values.priceInput)}
              </p>
            )}
            {errors.priceInput && <p className="mt-1 text-xs text-red-600">{errors.priceInput}</p>}
          </div>
        </div>
      </section>

      {/* Thumbnail (opcional) */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Thumbnail</h2>
        <p className="mb-4 text-sm text-gray-500">
          URL da imagem de capa (gerada automaticamente após publicação, ou cole uma URL manualmente).
        </p>
        <input
          type="url"
          value={values.thumbnail_url}
          onChange={set('thumbnail_url')}
          placeholder="https://..."
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {values.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={values.thumbnail_url}
            alt="Prévia da thumbnail"
            className="mt-3 h-32 w-auto rounded-lg border border-gray-200 object-cover"
          />
        )}
      </section>

      {/* Ações */}
      <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-xs text-gray-500">
          A atividade será salva como <strong>Inativa</strong> e só aparecerá no catálogo depois que você publicá-la.
        </p>
        <button
          type="submit"
          disabled={loading || !pdfKey}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {loading ? 'Salvando...' : 'Salvar como rascunho'}
        </button>
      </div>
    </form>
  )
}
