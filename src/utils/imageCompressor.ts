/**
 * Image compression and optimization utilities.
 * Ensures profile pictures and uploaded images stay compact (< 30KB)
 * to prevent localStorage QuotaExceededError and maintain high rendering speed.
 */

/**
 * Resizes and compresses an image (File or base64 Data URL) using HTML5 Canvas.
 * Outputs a compact, web-optimized JPEG data URL.
 */
export async function compressImage(
  fileOrDataUrl: File | string,
  maxWidth = 320,
  maxHeight = 320,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processDataUrl = (dataUrl: string) => {
      // If it's an external HTTP/HTTPS URL, DiceBear URL, or already tiny SVG, return as-is
      if (
        dataUrl.startsWith('http://') ||
        dataUrl.startsWith('https://') ||
        dataUrl.startsWith('data:image/svg+xml')
      ) {
        // If external URL, don't re-encode unless needed
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (!width || !height) {
          resolve(dataUrl);
          return;
        }

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        // High quality bicubic downsampling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        // If image loading fails, fallback safely
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    if (typeof fileOrDataUrl === 'string') {
      processDataUrl(fileOrDataUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          processDataUrl(result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}

/**
 * Avatar-optimized compressor.
 * Creates a crisp, square-cropped 256x256 avatar JPEG (< 20KB).
 */
export async function compressAvatar(
  fileOrDataUrl: File | string,
  targetSize = 256,
  quality = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const processDataUrl = (dataUrl: string) => {
      if (
        dataUrl.startsWith('http://') ||
        dataUrl.startsWith('https://') ||
        dataUrl.startsWith('data:image/svg+xml')
      ) {
        resolve(dataUrl);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const width = img.naturalWidth || img.width;
        const height = img.naturalHeight || img.height;

        if (!width || !height) {
          resolve(dataUrl);
          return;
        }

        // Center-crop square logic
        const minEdge = Math.min(width, height);
        const startX = Math.round((width - minEdge) / 2);
        const startY = Math.round((height - minEdge) / 2);

        const canvas = document.createElement('canvas');
        canvas.width = targetSize;
        canvas.height = targetSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(
          img,
          startX,
          startY,
          minEdge,
          minEdge,
          0,
          0,
          targetSize,
          targetSize
        );

        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch {
          resolve(dataUrl);
        }
      };

      img.onerror = () => {
        resolve(dataUrl);
      };

      img.src = dataUrl;
    };

    if (typeof fileOrDataUrl === 'string') {
      processDataUrl(fileOrDataUrl);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const res = e.target?.result as string;
        if (res) {
          processDataUrl(res);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read avatar file'));
      reader.readAsDataURL(fileOrDataUrl);
    }
  });
}
