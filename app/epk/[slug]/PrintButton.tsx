'use client';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{ background: '#F0B51E', color: '#000', border: 'none', padding: '10px 24px', fontWeight: 700, cursor: 'pointer', fontSize: 12, letterSpacing: 2 }}>
      DOWNLOAD PDF
    </button>
  );
}
