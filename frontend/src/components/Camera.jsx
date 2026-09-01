import React, { useEffect, useRef, useState } from 'react';

// Ventana modal que abre la cámara con vista previa en vivo.
// - "📸 Tomar foto" captura y devuelve la imagen en base64 (onPhoto)
// - Alterna entre cámara trasera y frontal
// - Si no hay cámara o se niega el permiso, muestra opción de subir archivo
export default function Camera({ onPhoto, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facing, setFacing] = useState('environment');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function start() {
      setLoading(true);
      setError('');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      } catch (err) {
        setError(err.name === 'NotAllowedError'
          ? 'No diste permiso para usar la cámara.'
          : 'No se pudo abrir la cámara en este dispositivo.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    start();
    return () => {
      cancelled = true;
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  function capturar() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const max = 900;
    let w = video.videoWidth;
    let h = video.videoHeight;
    const scale = Math.min(1, max / Math.max(w, h));
    if (scale < 1) { w = Math.round(w * scale); h = Math.round(h * scale); }
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(video, 0, 0, w, h);
    onPhoto(canvas.toDataURL('image/jpeg', 0.7));
  }

  return (
    <div className="camera-overlay" onClick={onClose}>
      <div className="camera-box" onClick={(e) => e.stopPropagation()}>
        <div className="camera-bar">
          <span>📷 Cámara</span>
          <button type="button" className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="camera-view">
          <video ref={videoRef} playsInline muted autoPlay />
          {loading && !error && <div className="camera-loading">Abriendo cámara...</div>}
          {error && (
            <div className="camera-error">
              <p>{error}</p>
              <p className="muted">Puedes tomar foto con el archivo en su lugar.</p>
            </div>
          )}
        </div>

        <div className="camera-actions">
          <button type="button" className="btn-ghost" onClick={() => setFacing(facing === 'environment' ? 'user' : 'environment')} disabled={!!error}>
            🔄 Cambiar cámara
          </button>
          <button type="button" className="btn-shoot" onClick={capturar} disabled={!!error || loading}>
            📸 Tomar foto
          </button>
        </div>
      </div>
    </div>
  );
}