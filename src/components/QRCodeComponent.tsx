'use client';

import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

interface QRCodeComponentProps {
  url: string;
  size?: number;
}

export default function QRCodeComponent({ url, size = 200 }: QRCodeComponentProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }, (error) => {
        if (error) {
          console.error('QR kod oluşturulamadı:', error);
        }
      });
    }
  }, [url, size]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-kod-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className="text-center">
      <h4 className="font-medium text-gray-800 mb-3">QR Kod</h4>
      <div className="inline-block p-4 bg-white border rounded-lg">
        <canvas ref={canvasRef} />
      </div>
      <div className="mt-3">
        <button
          onClick={downloadQR}
          className="text-sm px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          QR Kodu İndir
        </button>
      </div>
    </div>
  );
}
