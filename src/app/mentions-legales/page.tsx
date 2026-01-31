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
          <p className="text-gray-600 mt-2">
            Dernière mise à jour : Janvier 2024
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-sm p-8 prose prose-gray max-w-none">

            <h2>1. Éditeur du site</h2>
            <p>
              Le site <strong>servicesartisans.fr</strong> est édité par :
            </p>
            <ul>
              <li><strong>Raison sociale :</strong> ServicesArtisans SAS</li>
              <li><strong>Siège social :</strong> 123 Avenue des Artisans, 75001 Paris</li>
              <li><strong>Capital social :</strong> 10 000 €</li>
              <li><strong>RCS :</strong> Paris B 123 456 789</li>
              <li><strong>SIRET :</strong> 123 456 789 00012</li>
              <li><strong>TVA intracommunautaire :</strong> FR 12 345678901</li>
              <li><strong>Directeur de la publication :</strong> Marie Dupont</li>
              <li><strong>Email :</strong> contact@servicesartisans.fr</li>
              <li><strong>Téléphone :</strong> 01 23 45 67 89</li>
            </ul>

            <h2>2. Hébergement</h2>
            <p>
              Le site est hébergé par :
            </p>
            <ul>
              <li><strong>Hébergeur :</strong> Vercel Inc.</li>
              <li><strong>Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</li>
              <li><strong>Site web :</strong> https://vercel.com</li>
            </ul>

            <h2>3. Propriété intellectuelle</h2>
            <p>
              L'ensemble du contenu du site servicesartisans.fr (textes, images, graphismes, logo,
              icônes, sons, logiciels, etc.) est la propriété exclusive de ServicesArtisans SAS ou
              de ses partenaires et est protégé par les lois françaises et internationales relatives
              à la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication, transmission,
              dénaturation, totale ou partielle du site ou de son contenu, par quelque procédé
              que ce soit, et sur quelque support que ce soit est interdite sans autorisation
              écrite préalable de ServicesArtisans SAS.
            </p>

            <h2>4. Données personnelles</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la
              loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification,
              de suppression et de portabilité de vos données personnelles.
            </p>
            <p>
              Pour exercer ces droits ou pour toute question relative à vos données personnelles,
              vous pouvez nous contacter à l'adresse : <strong>dpo@servicesartisans.fr</strong>
            </p>
            <p>
              Pour plus d'informations, consultez notre <a href="/confidentialite">Politique de confidentialité</a>.
            </p>

            <h2>5. Cookies</h2>
            <p>
              Le site utilise des cookies pour améliorer l'expérience utilisateur, réaliser
              des statistiques de visite et proposer des contenus personnalisés. Vous pouvez
              gérer vos préférences de cookies à tout moment via le bandeau de consentement
              ou dans les paramètres de votre navigateur.
            </p>

            <h2>6. Responsabilité</h2>
            <p>
              ServicesArtisans SAS s'efforce d'assurer l'exactitude et la mise à jour des
              informations diffusées sur ce site. Toutefois, ServicesArtisans SAS ne peut
              garantir l'exactitude, la précision ou l'exhaustivité des informations mises
              à disposition sur ce site.
            </p>
            <p>
              ServicesArtisans SAS agit en tant qu'intermédiaire entre les particuliers et
              les artisans. À ce titre, ServicesArtisans SAS n'est pas responsable des
              prestations réalisées par les artisans référencés sur la plateforme.
            </p>

            <h2>7. Liens hypertextes</h2>
            <p>
              Le site peut contenir des liens vers d'autres sites internet. ServicesArtisans SAS
              n'exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur
              contenu ou aux pratiques de leurs éditeurs en matière de protection des données
              personnelles.
            </p>

            <h2>8. Droit applicable</h2>
            <p>
              Les présentes mentions légales sont soumises au droit français. En cas de litige,
              les tribunaux français seront seuls compétents.
            </p>

            <h2>9. Contact</h2>
            <p>
              Pour toute question concernant ces mentions légales, vous pouvez nous contacter :
            </p>
            <ul>
              <li><strong>Par email :</strong> contact@servicesartisans.fr</li>
              <li><strong>Par courrier :</strong> ServicesArtisans SAS, 123 Avenue des Artisans, 75001 Paris</li>
            </ul>

          </div>
        </div>
      </section>
    </div>
  )
}
