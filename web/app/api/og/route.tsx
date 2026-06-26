import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') ?? 'Atividade pedagógica'
  const grade = searchParams.get('grade') ?? ''
  const discipline = searchParams.get('discipline') ?? ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Header azul */}
        <div
          style={{
            backgroundColor: '#2563eb',
            padding: '32px 52px',
            display: 'flex',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              backgroundColor: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '900',
              color: '#2563eb',
              letterSpacing: '-0.5px',
            }}
          >
            TA
          </div>
          <span
            style={{
              color: 'white',
              fontSize: '30px',
              fontWeight: '700',
              letterSpacing: '-0.5px',
            }}
          >
            TodaAtividade
          </span>
        </div>

        {/* Conteúdo central */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '48px 52px',
            gap: '28px',
          }}
        >
          {/* Badges */}
          {(grade || discipline) && (
            <div style={{ display: 'flex', gap: '14px' }}>
              {grade && (
                <div
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                    padding: '9px 22px',
                    borderRadius: '100px',
                    fontSize: '20px',
                    fontWeight: '600',
                  }}
                >
                  {grade}
                </div>
              )}
              {discipline && (
                <div
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '9px 22px',
                    borderRadius: '100px',
                    fontSize: '20px',
                    fontWeight: '600',
                  }}
                >
                  {discipline}
                </div>
              )}
            </div>
          )}

          {/* Título */}
          <div
            style={{
              fontSize: title.length > 70 ? '38px' : title.length > 50 ? '46px' : '56px',
              fontWeight: '800',
              color: '#0f172a',
              lineHeight: 1.15,
              maxWidth: '1000px',
              letterSpacing: '-1px',
            }}
          >
            {title}
          </div>

          {/* CTA pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginTop: '8px',
            }}
          >
            <div
              style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '14px',
                fontSize: '22px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              Ver atividade
            </div>
            <div
              style={{
                backgroundColor: '#f0fdf4',
                color: '#15803d',
                padding: '16px 28px',
                borderRadius: '14px',
                fontSize: '20px',
                fontWeight: '600',
              }}
            >
              Download imediato
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '20px 52px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ color: '#94a3b8', fontSize: '18px', fontWeight: '500' }}>
            todaatividade.com.br
          </span>
          <span style={{ color: '#94a3b8', fontSize: '18px' }}>
            Atividades pedagógicas prontas para imprimir
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
