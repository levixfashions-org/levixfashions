/**
 * LEVIX Client-Side Image Optimizer
 * Converts Camera captures and Gallery files into high-performance,
 * crisp, compressed e-commerce images with zero upload lag or cloud limits.
 *
 * Implements Fix 1 (Section 3.1):
 * - Always forces a fresh admin auth token before uploading.
 * - Never silently falls back to inline base64 text in products or orders.
 * - Throws a descriptive error if upload fails so the form stays open for retry.
 */

import { auth } from './firebase'
import { getAdminHeaders } from './firestore'

export const compressAndProcessImage = (
  file: File,
  maxDimension = 900,
  quality = 0.75
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'))
    }

    const reader = new FileReader()

    reader.onload = (readerEvent) => {
      const img = new Image()

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          // Scale maintaining aspect ratio
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width)
              width = maxDimension
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height)
              width = maxDimension
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            return reject(new Error('Failed to process image canvas context.'))
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          // Output optimized JPEG data URL
          const compressed = canvas.toDataURL('image/jpeg', quality)
          uploadCompressedImage(compressed)
            .then(resolve)
            .catch(reject)
        } catch (err: any) {
          reject(new Error(err?.message || 'Failed to compress image.'))
        }
      }

      img.onerror = () => {
        reject(new Error('Failed to load image file into memory.'))
      }

      img.src = readerEvent.target?.result as string
    }

    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads compressed base64 image data to the backend storage endpoint (/api/upload).
 * Returns the permanent static file URL (/uploads/img-*.jpg).
 * Strictly refuses base64 fallback to prevent database and JSON bloating.
 */
async function uploadCompressedImage(imageData: string): Promise<string> {
  if (!imageData || !imageData.startsWith('data:image/')) {
    return imageData
  }

  // Force fresh token if user is signed in to prevent expired token rejections (Fix 1)
  if (auth?.currentUser) {
    try {
      await auth.currentUser.getIdToken(true)
    } catch (tokenErr) {
      console.warn('Could not refresh Firebase auth token before image upload:', tokenErr)
    }
  }

  const headers = await getAdminHeaders()
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers,
    body: JSON.stringify({ image: imageData }),
  })

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    const msg = errData.error || `Server returned ${res.status}: Upload failed, please try again.`
    throw new Error(msg)
  }

  const data = await res.json()
  if (data && data.url) {
    return data.url
  }

  throw new Error('Upload failed: Server did not return a valid image URL. Please try again.')
}

export const processMultipleImages = async (
  files: FileList | File[]
): Promise<string[]> => {
  const fileArray = Array.from(files)
  const results = await Promise.all(
    fileArray.map((file) => compressAndProcessImage(file))
  )
  return results.filter((res): res is string => Boolean(res))
}
