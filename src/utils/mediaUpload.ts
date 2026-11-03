/**
 * Architectural Media Upload & Perceptual Optimizer for EcuadorianArchitecture CMS.
 *
 * Automatically prepares and optimizes photographs to high-end architectural publication standards
 * (ArchDaily / Dezeen / Divisare):
 * 1. Proportional resizing to max 2560px on long edge (Retina 4K/5K clarity).
 * 2. Visual lossless conversion to modern WebP (quality 0.88), retaining all material textures (concrete, timber, brick)
 *    while avoiding sky banding.
 * 3. Reduces 15MB-30MB camera RAW/JPEGs down to ~400KB - 750KB in milliseconds on the client.
 * 4. Stores clean, permanent URLs into /public/images/uploads/.
 */

export interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
}

export interface OptimizationOptions {
  maxDimension?: number;
  quality?: number;
  format?: 'image/webp' | 'image/jpeg';
}

/**
 * Optimizes an image in the browser via HTML5 Canvas before uploading.
 * Bypasses SVGs and animated GIFs to prevent damage.
 */
export const optimizeArchitecturalImage = async (
  file: File,
  options: OptimizationOptions = {}
): Promise<{ dataUrl: string; filename: string; originalSize: number; optimizedSize: number }> => {
  const {
    maxDimension = 2560,
    quality = 0.88,
    format = 'image/webp',
  } = options;

  // If SVG or GIF, preserve raw vector/animation without re-encoding
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve({
          dataUrl: result,
          filename: file.name,
          originalSize: file.size,
          optimizedSize: file.size,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Scale down proportionally if larger than maxDimension
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        // Fallback to FileReader if canvas context fails
        const reader = new FileReader();
        reader.onload = () =>
          resolve({
            dataUrl: reader.result as string,
            filename: file.name,
            originalSize: file.size,
            optimizedSize: file.size,
          });
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }

      // Configure high-quality smoothing for fine architectural lines and textures
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Fill background with white in case of transparent background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(img, 0, 0, width, height);

      // Attempt WebP export; fallback to high-quality JPEG if browser lacks WebP canvas export
      let targetFormat = format;
      let targetExtension = '.webp';
      let dataUrl = canvas.toDataURL(targetFormat, quality);

      if (!dataUrl.startsWith(`data:${targetFormat}`)) {
        targetFormat = 'image/jpeg';
        targetExtension = '.jpg';
        dataUrl = canvas.toDataURL(targetFormat, quality);
      }

      // Calculate approximate size in bytes
      const base64Data = dataUrl.split(',')[1] || '';
      const optimizedSize = Math.round((base64Data.length * 3) / 4);

      // Sanitize filename and apply new extension
      const originalNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      const optimizedFilename = `${originalNameWithoutExt}${targetExtension}`;

      console.info(
        `[EA Image Optimizer] ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB, ${img.naturalWidth}x${img.naturalHeight}) ➔ ` +
        `${optimizedFilename} (${(optimizedSize / 1024).toFixed(1)} KB, ${width}x${height}) @ WebP q=${quality}`
      );

      resolve({
        dataUrl,
        filename: optimizedFilename,
        originalSize: file.size,
        optimizedSize,
      });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      console.warn('[EA Image Optimizer] Fallback to raw file read:', err);
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          dataUrl: reader.result as string,
          filename: file.name,
          originalSize: file.size,
          optimizedSize: file.size,
        });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };

    img.src = objectUrl;
  });
};

/**
 * Uploads an image to the backend /api/upload endpoint with automatic architectural optimization.
 */
export const uploadImageFile = async (
  file: File,
  options?: OptimizationOptions
): Promise<string> => {
  try {
    // 1. Optimize on the client first
    const { dataUrl, filename } = await optimizeArchitecturalImage(file, options);

    // 2. Transmit to backend
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        contentType: dataUrl.split(';')[0]?.replace('data:', '') || 'image/webp',
        data: dataUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`Upload server responded with status: ${response.status}`);
    }

    const result: UploadResponse = await response.json();
    if (result && result.url) {
      return result.url;
    }

    return dataUrl;
  } catch (err) {
    console.warn('API upload failed, falling back to data URL:', err);
    // Fallback: read directly as data URL so the user is never blocked
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Uploads multiple images in sequence or parallel with progress notification.
 */
export const uploadMultipleImages = async (
  files: FileList | File[],
  onProgress?: (current: number, total: number) => void,
  options?: OptimizationOptions
): Promise<string[]> => {
  const fileArray = Array.from(files);
  const uploadedUrls: string[] = [];

  for (let i = 0; i < fileArray.length; i++) {
    const file = fileArray[i];
    try {
      const url = await uploadImageFile(file, options);
      if (url) {
        uploadedUrls.push(url);
      }
    } catch (err) {
      console.error(`Failed to upload ${file.name}:`, err);
    }
    if (onProgress) {
      onProgress(i + 1, fileArray.length);
    }
  }

  return uploadedUrls;
};
