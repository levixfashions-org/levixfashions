/**
 * LEVIX Client-Side Image Optimizer
 * Converts Camera captures and Gallery files into high-performance,
 * crisp, compressed e-commerce images with zero upload lag or cloud limits.
 */

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
              height = maxDimension
            }
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(readerEvent.target?.result as string)
            return
          }

          // Use high quality image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          // Output optimized JPEG data URL
          const compressed = canvas.toDataURL('image/jpeg', quality)
          resolve(compressed)
        } catch (err) {
          console.warn('Canvas compression fallback to raw data URL:', err)
          resolve(readerEvent.target?.result as string)
        }
      }

      img.onerror = () => {
        resolve(readerEvent.target?.result as string)
      }

      img.src = readerEvent.target?.result as string
    }

    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

export const processMultipleImages = async (
  files: FileList | File[]
): Promise<string[]> => {
  const fileArray = Array.from(files)
  const results = await Promise.all(
    fileArray.map((file) =>
      compressAndProcessImage(file).catch((err) => {
        console.error('Failed to process image:', file.name, err)
        return null
      })
    )
  )
  return results.filter((res): res is string => Boolean(res))
}
