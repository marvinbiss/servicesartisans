import { permanentRedirect } from 'next/navigation'

export default function Page({ params }: { params: { service: string; ville: string } }) {
  permanentRedirect(`/services/${params.service}/${params.ville}`)
}
