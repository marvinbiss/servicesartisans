/**
 * Auto-generated barrel export for all generated image pools
 * NE PAS MODIFIER MANUELLEMENT
 */

import { serviceImagePool_gen4 } from './images-gen4'
import { serviceImagePool_gen5 } from './images-gen5'
import { serviceImagePool_gen6 } from './images-gen6'
import { serviceImagePool_gen7 } from './images-gen7'

export const generatedImagePools = [
  serviceImagePool_gen4,
  serviceImagePool_gen5,
  serviceImagePool_gen6,
  serviceImagePool_gen7,
]

export type GeneratedImagePool = Record<string, { src: string; alt: string }[]>
