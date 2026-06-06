/**
 * compress-image — chemins pass-through (le chemin canvas nécessite un vrai
 * décodeur d'image, absent de jsdom ; il est couvert par le test manuel mobile).
 */

import { describe, it, expect } from 'vitest'
import { compressImage } from '@/lib/images/compress-image'

function makeFile(name: string, type: string, bytes: number): File {
  return new File([new Uint8Array(bytes)], name, { type })
}

describe('compressImage — pass-through', () => {
  it('vidéo retournée telle quelle', async () => {
    const file = makeFile('chantier.mp4', 'video/mp4', 1024)
    expect(await compressImage(file)).toBe(file)
  })

  it('GIF retourné tel quel (animation préservée)', async () => {
    const file = makeFile('avant-apres.gif', 'image/gif', 1024)
    expect(await compressImage(file)).toBe(file)
  })

  it('JPEG déjà léger (< 3 Mo) retourné tel quel', async () => {
    const file = makeFile('photo.jpg', 'image/jpeg', 500 * 1024)
    expect(await compressImage(file)).toBe(file)
  })

  it('PNG léger retourné tel quel (transparence préservée)', async () => {
    const file = makeFile('logo.png', 'image/png', 100 * 1024)
    expect(await compressImage(file)).toBe(file)
  })

  it('fichier non-image retourné tel quel', async () => {
    const file = makeFile('devis.pdf', 'application/pdf', 1024)
    expect(await compressImage(file)).toBe(file)
  })
})
