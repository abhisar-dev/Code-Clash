import { ImageResponse } from 'next/og';

export const alt = 'CodeClash - Real-Time 1v1 Competitive Coding';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1c1917',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#d97706',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '32px',
              fontWeight: 800,
              fontFamily: 'monospace',
            }}
          >
            &lt;/&gt;
          </div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#f5f5f4',
              letterSpacing: '-2px',
            }}
          >
            codeclash
          </div>
        </div>

        <div
          style={{
            fontSize: '32px',
            fontWeight: 600,
            color: '#fbbf24',
            marginBottom: '16px',
          }}
        >
          Real-Time 1v1 Peer Competitive Coding
        </div>

        <div
          style={{
            fontSize: '20px',
            color: '#a8a29e',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.5,
          }}
        >
          Solve DSA problems head-to-head. Python, JavaScript, C++, and Java execution sandbox.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
