/**
 * Validation helpers fichiers (portfolio).
 *
 * Les fonctions d'upload/suppression client-side direct-to-bucket ont été
 * retirées (audit 2026-06-05) : zéro usage, et elles bypassaient la route
 * serveur `/api/portfolio/upload` (validation magic bytes, path imposé
 * server-side). Tout upload portfolio passe par l'API serveur.
 */

import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from '@/types/portfolio'

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  type: 'image' | 'video'
): { valid: boolean; error?: string } {
  const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_VIDEO_TYPES
  const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Type de fichier non supporté. Types acceptés: ${allowedTypes.join(', ')}`,
    }
  }

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024)
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximum: ${maxSizeMB}MB`,
    }
  }

  return { valid: true }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
