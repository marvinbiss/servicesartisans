/**
 * Client-side image compression before upload.
 *
 * Why: Vercel serverless functions reject request bodies over ~4.5 MB at the
 * platform level — our API-side limits (10 MB) are unreachable. A phone photo
 * (5-12 MB) hangs on "upload en cours…" until the platform kills the
 * connection ("Load failed" on Safari). Resizing to max 2048px JPEG keeps
 * every real-world photo well under the platform cap, and decoding through
 * canvas also converts iPhone HEIC into a server-accepted format.
 */

const MAX_DIMENSION = 2048
const JPEG_QUALITY = 0.85
// Already safely under the Vercel body cap — skip recompression to preserve
// the original bytes (PNG transparency, existing optimization…).
const SKIP_BELOW_BYTES = 3 * 1024 * 1024

const SERVER_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file)
    } catch {
      // Some Safari versions decode HEIC via <img> but not createImageBitmap
    }
  }
  return await new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('decode failed'))
    }
    img.src = url
  })
}

export async function compressImage(file: File): Promise<File> {
  // GIF: canvas would drop the animation; videos and non-images pass through.
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file

  const serverAccepted = SERVER_ACCEPTED_TYPES.includes(file.type)
  if (serverAccepted && file.size <= SKIP_BELOW_BYTES) return file

  try {
    const bitmap = await loadBitmap(file)
    const srcWidth = 'naturalWidth' in bitmap ? bitmap.naturalWidth : bitmap.width
    const srcHeight = 'naturalHeight' in bitmap ? bitmap.naturalHeight : bitmap.height
    if (!srcWidth || !srcHeight) return file

    const scale = Math.min(1, MAX_DIMENSION / Math.max(srcWidth, srcHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(srcWidth * scale)
    canvas.height = Math.round(srcHeight * scale)
    const ctx = canvas.getContext('2d')
    if (!ctx) return file
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    )
    if (!blob) return file
    // Recompression made it bigger and the original was already fine — keep it.
    if (serverAccepted && blob.size >= file.size) return file

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'photo'
    return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
  } catch {
    // Decode failed (corrupt file, unsupported codec): send the original,
    // the server-side magic-bytes validation produces the clear error.
    return file
  }
}
