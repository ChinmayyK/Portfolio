import { ImageResponse } from 'next/og'

export const runtime = 'edge'

// Image metadata
export const alt = 'Chinmay Kudalkar - Full-Stack Engineer'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: '#0a0a0a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'sans-serif',
          color: 'white',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '40px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '32px',
            background: '#22c55e',
            display: 'flex',
          }} />
          <div style={{
            fontSize: '48px',
            fontWeight: 800,
            letterSpacing: '-0.05em',
            color: '#ffffff',
          }}>
            chinmay.io
          </div>
        </div>

        <div style={{
          fontSize: '82px',
          fontWeight: 900,
          letterSpacing: '-0.05em',
          lineHeight: 1.1,
          marginBottom: '24px',
          maxWidth: '900px',
        }}>
          Chinmay Kudalkar
        </div>
        
        <div style={{
          fontSize: '42px',
          color: '#a1a1aa',
          letterSpacing: '-0.02em',
        }}>
          Full-Stack Engineer &amp; Systems Architect
        </div>

        <div style={{
          display: 'flex',
          marginTop: '60px',
          gap: '24px',
        }}>
          <div style={{ padding: '12px 24px', background: '#18181b', borderRadius: '12px', fontSize: '24px', color: '#2dd4bf', border: '1px solid #27272a' }}>TypeScript</div>
          <div style={{ padding: '12px 24px', background: '#18181b', borderRadius: '12px', fontSize: '24px', color: '#2dd4bf', border: '1px solid #27272a' }}>Next.js</div>
          <div style={{ padding: '12px 24px', background: '#18181b', borderRadius: '12px', fontSize: '24px', color: '#2dd4bf', border: '1px solid #27272a' }}>Node.js</div>
          <div style={{ padding: '12px 24px', background: '#18181b', borderRadius: '12px', fontSize: '24px', color: '#2dd4bf', border: '1px solid #27272a' }}>PostgreSQL</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
