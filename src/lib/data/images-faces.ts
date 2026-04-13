/**
 * Portraits centralisés pour social proof (témoignages, carrousel, CTAs)
 * IMPORTANT : Ces portraits ne sont JAMAIS liés à de vrais artisans.
 * Utilisés uniquement pour la social proof générique (avis, témoignages, etc.)
 *
 * Source : Unsplash (licence libre, usage commercial OK)
 * Crop=face pour cadrage visage optimal
 */

function unsplashFace(id: string, w = 200, h = 200): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=face&w=${w}&h=${h}&q=80`
}

export interface Portrait {
  src: string
  alt: string
  initials: string
}

/**
 * 20 portraits "artisans" — hommes/femmes, diversité d'âge et d'origine
 * Pour : témoignages artisans, carrousel avis, social proof
 */
export const artisanPortraits: Portrait[] = [
  { src: unsplashFace('1507003211169-0a1dd7228f2d'), alt: 'Portrait artisan', initials: 'JD' },
  { src: unsplashFace('1500648767791-00dcc994a43e'), alt: 'Portrait artisan', initials: 'PL' },
  { src: unsplashFace('1506794778202-cad84cf45f1d'), alt: 'Portrait artisan', initials: 'MR' },
  { src: unsplashFace('1472099645785-5658abf4ff4e'), alt: 'Portrait artisan', initials: 'TB' },
  { src: unsplashFace('1519345182560-3f2917c472ef'), alt: 'Portrait artisan', initials: 'AC' },
  { src: unsplashFace('1560250097-0b93528c311a'), alt: 'Portrait artisane', initials: 'SG' },
  { src: unsplashFace('1580489944761-15a19d654956'), alt: 'Portrait artisane', initials: 'LM' },
  { src: unsplashFace('1573496359142-b8d87734a5a2'), alt: 'Portrait artisane', initials: 'CB' },
  { src: unsplashFace('1595152772835-219674b2a8a6'), alt: 'Portrait artisan', initials: 'RD' },
  { src: unsplashFace('1566492031773-4f4e44671857'), alt: 'Portrait artisan', initials: 'FH' },
  { src: unsplashFace('1552058544-f2b08422138a'), alt: 'Portrait artisan', initials: 'YK' },
  { src: unsplashFace('1548142813-c348350df52b'), alt: 'Portrait artisane', initials: 'NV' },
  { src: unsplashFace('1544005313-94ddf0286df2'), alt: 'Portrait artisan', initials: 'DP' },
  { src: unsplashFace('1504257432389-52343af06ae3'), alt: 'Portrait artisan', initials: 'BT' },
  { src: unsplashFace('1531746020798-e6953c6e8e04'), alt: 'Portrait artisane', initials: 'EM' },
  { src: unsplashFace('1599566150163-29194dcabd9c'), alt: 'Portrait artisan', initials: 'HN' },
  { src: unsplashFace('1504199367641-ebb94b78b108'), alt: 'Portrait artisan', initials: 'OC' },
  { src: unsplashFace('1563132337-f159f484226c'), alt: 'Portrait artisane', initials: 'VR' },
  { src: unsplashFace('1542909168-82c3e7fdca5c'), alt: 'Portrait artisan', initials: 'GS' },
  { src: unsplashFace('1438761681033-6461ffad8d80'), alt: 'Portrait artisane', initials: 'IF' },
]

/**
 * 10 portraits "clients" — particuliers qui laissent des avis
 * Pour : témoignages clients, InlineTestimonial, avis vérifiés
 */
export const clientPortraits: Portrait[] = [
  { src: unsplashFace('1494790108377-be9c29b29330'), alt: 'Portrait client', initials: 'ND' },
  { src: unsplashFace('1534528741775-53994a69daeb'), alt: 'Portrait cliente', initials: 'FM' },
  { src: unsplashFace('1507081323647-4d250478b919'), alt: 'Portrait client', initials: 'SL' },
  { src: unsplashFace('1521119989659-a83eee488004'), alt: 'Portrait cliente', initials: 'AP' },
  { src: unsplashFace('1527980965255-d3b416303d12'), alt: 'Portrait client', initials: 'JB' },
  { src: unsplashFace('1546961342-ea1f6b206965'), alt: 'Portrait cliente', initials: 'MT' },
  { src: unsplashFace('1545167622-3a6ac756afa4'), alt: 'Portrait client', initials: 'RC' },
  { src: unsplashFace('1487412720507-e7ab37603c6f'), alt: 'Portrait cliente', initials: 'LB' },
  { src: unsplashFace('1500917293891-ef795e70e1f6'), alt: 'Portrait cliente', initials: 'CD' },
  { src: unsplashFace('1583195764036-6dc248ac07d9'), alt: 'Portrait client', initials: 'PG' },
]

/**
 * Helper : portrait déterministe par index (rotation cyclique)
 */
export function getArtisanPortrait(index: number): Portrait {
  return artisanPortraits[Math.abs(index) % artisanPortraits.length]
}

export function getClientPortrait(index: number): Portrait {
  return clientPortraits[Math.abs(index) % clientPortraits.length]
}

/**
 * Helper : URL DiceBear notionists pour avatar artisan sans photo
 * Génère un avatar illustré unique et déterministe basé sur un seed (SIRET, slug, etc.)
 */
export function getDiceBearAvatar(seed: string, size = 80): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&size=${size}&backgroundColor=f0f0f0`
}
