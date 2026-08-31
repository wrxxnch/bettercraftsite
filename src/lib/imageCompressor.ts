/**
 * Compresses an image file or DataURL on the client side using HTML5 Canvas
 * so that it can be stored directly inside Firebase Firestore documents (<1MB limit).
 */
export async function compressImageForFirebase(
  fileOrBase64: File | string,
  maxWidth = 1280,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not initialize canvas context'));
        return;
      }

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first for optimal compression, fallback to JPEG
      try {
        const webpData = canvas.toDataURL('image/webp', quality);
        if (webpData && webpData.startsWith('data:image/webp')) {
          resolve(webpData);
          return;
        }
      } catch (e) {
        // ignore and fallback
      }

      const jpegData = canvas.toDataURL('image/jpeg', quality);
      resolve(jpegData);
    };

    img.onerror = () => {
      reject(new Error('Falha ao processar e carregar a imagem.'));
    };

    if (typeof fileOrBase64 === 'string') {
      img.src = fileOrBase64;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          img.src = e.target.result as string;
        } else {
          reject(new Error('Falha ao ler arquivo.'));
        }
      };
      reader.onerror = () => reject(new Error('Erro na leitura do arquivo.'));
      reader.readAsDataURL(fileOrBase64);
    }
  });
}
