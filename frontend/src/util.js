// Utilidades compartidas de imágenes

// Comprime una imagen (File) y devuelve un dataURL jpeg (prefijo incluido)
export function comprimirImagen(file, maxW = 900, maxH = 900, calidad = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const ratio = Math.min(maxW / img.width, maxH / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * ratio));
        canvas.height = Math.max(1, Math.round(img.height * ratio));
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Quita el prefijo de un dataURL base64 (ej. "data:image/jpeg;base64,")
export const sinPrefijo = (url) => (url || '').split(',')[1] || '';