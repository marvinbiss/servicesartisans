import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mentions légales - ServicesArtisans',
  description: 'Mentions légales du site ServicesArtisans.fr - Informations juridiques, éditeur, hébergeur et conditions d\'utilisation.',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900">
            Mentions légales
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">
            <p>
              Les mentions légales seront publiées lors de l'immatriculation de la société.
              Site en cours de développement.
            </p>
            <h2>Hébergement</h2>
            <p>
              Le site est hébergé par :
            </p>
            <ul>
              <li><strong>Hébergeur :</strong> Vercel Inc.</li>
              <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
              <li><strong>Site web :</strong> https://vercel.com</li>
            </ul>
            <h2>Contact</h2>
            <p>
              Pour toute question, vous pouvez nous contacter par email : <strong>contact@servicesartisans.fr</strong>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
