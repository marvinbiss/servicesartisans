/**
 * Avatar artisan généré (DiceBear notionists) — illustration déterministe par
 * seed (SIRET, slug, nom).
 *
 * Les anciens portraits Unsplash (faux visages "social proof") ont été retirés
 * 2026-06-09 : ils sonnaient « template » et n'étaient liés à aucune personne
 * réelle. La social proof utilise désormais des monogrammes (`@/lib/ui/monogram`).
 */

export function getDiceBearAvatar(seed: string, size = 80): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&size=${size}&backgroundColor=f0f0f0`
}
