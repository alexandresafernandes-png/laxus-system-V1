import { ImageResponse } from 'next/og';

export const size = { width: 192, height: 192 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          background: '#080810',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 40,
          border: '3px solid #00d4ff',
        }}
      >
        <div
          style={{
            fontSize: 100,
            fontWeight: 900,
            color: '#00d4ff',
            fontFamily: 'sans-serif',
            lineHeight: 1,
          }}
        >
          L
        </div>
      </div>
    ),
    { ...size },
  );
}
