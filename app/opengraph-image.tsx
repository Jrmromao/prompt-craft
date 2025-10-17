import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PromptCraft - Cut AI Costs by 40%';
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
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 'bold',
            color: 'white',
            marginBottom: 20,
          }}
        >
          PromptCraft
        </div>
        <div
          style={{
            fontSize: 36,
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Cut AI Costs by 40%
        </div>
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.7)',
            marginTop: 20,
          }}
        >
          Intelligent routing • Caching • Real-time analytics
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
