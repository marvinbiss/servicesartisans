import { redirect } from 'next/navigation'

// Gel 2026-06-06 : feature équipe non utilisée (artisans solo en rodage).
// APIs/tables conservées — réactivable en restaurant cette page depuis
// l'historique git.
export default function EquipePage() {
  redirect('/espace-artisan')
}
