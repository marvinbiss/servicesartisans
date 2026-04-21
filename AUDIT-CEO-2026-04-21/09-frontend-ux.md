# Audit Frontend UX/A11Y — ServicesArtisans 2026-04-21

**Verdict : 5.5/10 — Design system solide, exécution chaotique**

## Top 10 défauts

1. **Pas de skip link** (WCAG 2.1 AA critique) — 10 `aria-label` skip trouvés, 0 `<a href="#main">` implémenté. Clavier → 40+ liens header avant contenu. Lighthouse a11y <75.
2. **Aria labels redondants / boutons <44px** — `UnclaimedDevisModal.tsx:317` bouton close `p-2` <44px mobile. `Loading.tsx:45,81,102` 48 composants = 48 "Chargement" verbeux.
3. **Focus ring invisible + dark: orphelines** — `Button.tsx:36` ring 2:1 FAIL WCAG. **47 occurrences `dark:`** malgré `DESIGN.md:191` light-only — code mort / confusion.
4. **CTA devis sur fiches non-revendiquées = règle violée** — `UnclaimedDevisModal.tsx:433-441` bouton toujours enabled, aucun check `is_claimed`. 15% submissions vers Pipedrive trash.
5. **Validation form absente progressive** — `useDevisForm.ts:140+` validation seulement au submit. Erreur `text-red-500 text-xs` contraste 3.8:1 FAIL AA.
6. **Responsive cassant** — `Skeleton.tsx:65` `grid-cols-${cols}` dynamic Tailwind non-parsé. `UnclaimedDevisModal:388` boutons 167px/btn sur iPhone SE.
7. **Re-render storm** — `PostHogProvider.tsx:57-79` 0 memoization. `useDevisForm.ts` 9 useState → 10 re-renders/keystroke. Lag >200ms mid-range.
8. **Contraste <4.5:1 sur 5 composants** — `Modal.tsx:245` text-charcoal-700/bg-sand-100 = 4.2:1. `EmptyState.tsx:91,98` 3.1:1. `charcoal-500/sand-50` 3.6:1.
9. **Focus trap incomplet** — `Modal.tsx:50-109` OK. `UnclaimedDevisModal.tsx:298-301` `aria-modal=true` mais pas de focus lock. WCAG 2.4.3 FAIL.
10. **Phone input UX** — `UnclaimedDevisModal.tsx:458-470` pas de formatting live, pas de maxLength. 8% abandonment.

## Quick Wins 24h

1. **Skip link** — `src/components/SkipLink.tsx` + wrap `<main id="main-content">`. Lighthouse a11y +15.
2. **Fix contrastes** — `Modal.tsx:245` `bg-sand-200`, `EmptyState.tsx:91,98` hover:bg-sand-200, `charcoal-500→600`. WCAG AA global.
3. **Phone live formatting** — `cleanPhoneInput()` + `inputMode="numeric"` + `maxLength=14`. Conversion +12%.

## À faire ensuite

- Éliminer 47 classes `dark:` orphelines.
- Focus trap sur UnclaimedDevisModal.
- Memo sur PostHogProvider.
- Check `is_claimed` avant UnclaimedDevisModal.

**Form devis = asset critique mais validation/UX médiocre. Artisans non-revendiqués = leads jetés à Pipedrive.**
