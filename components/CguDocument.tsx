import {
  AlertCircle,
  AlertTriangle,
  Box,
  CheckCircle,
  DollarSign,
  Info,
  Mail,
  MapPin,
  Package,
  Phone,
  Scale,
  Scale3d,
  ShieldCheck,
} from "lucide-react";

export function CguPageHeader() {
  return (
    <div className="mb-8 border-b border-gray-200 pb-8 text-center">
      <Scale className="mx-auto mb-4 h-16 w-16 text-mex-blue" />
      <h1 className="mb-2 text-3xl font-black text-mex-dark">CONDITIONS GÉNÉRALES D&apos;UTILISATION</h1>
      <p className="text-sm font-bold uppercase tracking-widest text-gray-500">MEX509 SHIPPING SERVICES</p>
      <p className="mt-2 text-sm font-medium text-gray-400">Dernière mise à jour: 01/04/2026</p>
    </div>
  );
}

export function CguLegalSections() {
  return (
    <div className="space-y-10 rounded-3xl border border-gray-100 bg-white p-6 text-sm font-medium leading-relaxed text-gray-700 shadow-sm sm:space-y-12 sm:p-8 sm:text-base md:p-12">
      <p className="border-b border-gray-100 pb-4 text-center text-xs text-gray-400">
        Document aligné sur la version officielle (01/04/2026).
      </p>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <CheckCircle className="shrink-0 text-mex-blue" size={20} /> 1. ACCEPTATION DES CONDITIONS
        </h3>
        <p>
          En s&apos;inscrivant sur le site MEX509.com, en utilisant nos services ou en nous confiant un colis, le
          client reconnaît avoir lu, compris et accepté <strong>sans réserve</strong> l&apos;ensemble des présentes
          Conditions Générales.
        </p>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <Package className="shrink-0 text-mex-blue" size={20} /> 2. DESCRIPTION DES SERVICES
        </h3>
        <p className="mb-3">MEX509 fournit des services de transport et de logistique incluant :</p>
        <ul className="list-disc space-y-1.5 pl-5 text-gray-600 sm:pl-6">
          <li>Réception de colis (USA / République Dominicaine)</li>
          <li>Transport vers Haïti</li>
          <li>Suivi des colis (tracking)</li>
          <li>Notification des clients</li>
          <li>Assistance logistique</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <Info className="shrink-0 text-mex-orange" size={20} /> 3. OBLIGATION DE DÉCLARATION DU CLIENT
        </h3>
        <p className="mb-3 font-bold text-gray-800">Le client est tenu de :</p>
        <ul className="mb-4 list-disc space-y-1.5 pl-5 text-gray-600 sm:pl-6">
          <li>
            Déclarer <strong>avec exactitude</strong> le contenu de chaque colis
          </li>
          <li>
            Fournir la <strong>valeur réelle</strong> des produits
          </li>
          <li>
            Fournir, si possible, une <strong>facture ou un reçu</strong>
          </li>
          <li>Indiquer correctement ses informations personnelles (nom, téléphone, adresse)</li>
        </ul>
        <p className="mb-2 font-bold text-red-600">Toute fausse déclaration peut entraîner :</p>
        <ul className="list-disc space-y-1.5 pl-5 font-semibold text-red-600 sm:pl-6">
          <li>La saisie du colis</li>
          <li>La perte du colis sans remboursement</li>
          <li>Des poursuites selon la loi en vigueur</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <AlertTriangle className="shrink-0 text-red-500" size={20} /> 4. PRODUITS INTERDITS OU RESTREINTS
        </h3>
        <p className="mb-2 font-bold text-red-700">Produits strictement interdits :</p>
        <ul className="mb-6 list-disc space-y-1.5 pl-5 text-gray-600 sm:pl-6">
          <li>Armes, munitions, explosifs</li>
          <li>Drogues et substances illicites</li>
          <li>Produits contrefaits</li>
          <li>Produits illégaux selon les lois d&apos;Haïti ou de la République Dominicaine</li>
          <li>Matériel dangereux ou prohibé</li>
        </ul>
        <p className="mb-2 font-bold text-mex-orange">Produits réglementés (nécessitant autorisation) :</p>
        <ul className="mb-4 list-disc space-y-1.5 pl-5 text-gray-600 sm:pl-6">
          <li>Médicaments</li>
          <li>Produits alimentaires</li>
          <li>Produits chimiques</li>
          <li>Batteries lithium (selon conditions)</li>
        </ul>
        <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 font-bold text-gray-800">
          MEX509 se réserve le droit de refuser tout colis jugé non conforme.
        </p>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <ShieldCheck className="shrink-0 text-mex-dark" size={20} /> 5. RESPONSABILITÉ EN CAS DE NON-DÉCLARATION
        </h3>
        <p className="mb-2">Tout colis :</p>
        <ul className="mb-3 list-disc space-y-1.5 pl-5 text-gray-600 sm:pl-6">
          <li>Non déclaré</li>
          <li>Mal déclaré</li>
          <li>Ou contenant des articles interdits</li>
        </ul>
        <p>
          Peut être <strong>confisqué, détruit ou retenu</strong> par les autorités. MEX509 décline toute responsabilité
          en cas de perte dans ces situations.
        </p>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <Scale3d className="shrink-0 text-mex-dark" size={20} /> 6. RESPONSABILITÉ DOUANIÈRE
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-gray-600 sm:pl-6">
          <li>Les frais de douane sont à la charge du client</li>
          <li>
            MEX509 n&apos;est <strong>pas responsable</strong> des décisions des autorités douanières
          </li>
          <li>
            En cas de saisie ou de blocage : le client doit gérer directement la situation avec les autorités ; aucun
            remboursement ne sera effectué
          </li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <Scale className="shrink-0 text-mex-blue" size={20} /> 7. AUTORISATION LÉGALE
        </h3>
        <p className="mb-3">En cas d&apos;envoi de produits illégaux, le client autorise expressément MEX509 à :</p>
        <ul className="mb-4 list-disc space-y-1.5 pl-5 text-gray-600 sm:pl-6">
          <li>Transmettre ses informations aux autorités compétentes</li>
          <li>Coopérer avec les autorités pour toute enquête</li>
        </ul>
        <p className="rounded-xl border border-red-100 bg-red-50 p-4 font-bold text-red-900">
          MEX509 ne prendra aucune responsabilité légale dans ce cas.
        </p>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <DollarSign className="shrink-0 text-green-600" size={20} /> 8. CONDITIONS DE PAIEMENT
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-gray-600 sm:pl-6">
          <li>Tous les paiements doivent être effectués avant la livraison</li>
          <li>Paiement possible en ligne (Stripe, PayPal, MONCASH ou autres)</li>
          <li>Les frais de service ne sont pas remboursables</li>
        </ul>
        <p className="mt-3 font-bold text-gray-800">En cas de non-paiement :</p>
        <ul className="mt-1 list-disc space-y-1.5 pl-5 text-gray-600 sm:pl-6">
          <li>Le colis peut être retenu</li>
          <li>Des frais supplémentaires peuvent être appliqués</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <MapPin className="shrink-0 text-mex-blue" size={20} /> 9. LIVRAISON ET RESPONSABILITÉ
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-gray-600 sm:pl-6">
          <li>
            Le client doit fournir une <strong>adresse correcte et complète</strong>
          </li>
          <li>MEX509 n&apos;est pas responsable des erreurs d&apos;adresse fournies par le client</li>
          <li>Tout colis livré à une mauvaise adresse due à une erreur client ne sera pas récupéré</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <Box className="shrink-0 text-mex-orange" size={20} /> 10. EMBALLAGE ET DOMMAGES
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-gray-600 sm:pl-6">
          <li>Le fournisseur ou le client est responsable de l&apos;emballage initial</li>
          <li>
            MEX509 n&apos;est pas responsable des dommages causés par : mauvais emballage ; fragilité du produit non
            déclarée
          </li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <AlertCircle className="shrink-0 text-mex-orange" size={20} /> 11. COLIS NON RÉCUPÉRÉS
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-gray-600 sm:pl-6">
          <li>Les colis doivent être récupérés dans un délai raisonnable</li>
          <li>Passé ce délai, des frais de stockage peuvent être appliqués</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <Mail className="shrink-0 text-mex-blue" size={20} /> 12. SUIVI ET NOTIFICATIONS
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-gray-600 sm:pl-6">
          <li>Le client recevra des notifications (Email / WhatsApp)</li>
          <li>Le suivi dépend des informations fournies</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 flex items-center gap-2 text-lg font-black text-mex-dark sm:text-xl">
          <AlertTriangle className="shrink-0 text-gray-500" size={20} /> 13. LIMITATION DE RESPONSABILITÉ
        </h3>
        <p className="mb-2 font-bold text-gray-800">MEX509 ne pourra être tenu responsable pour :</p>
        <ul className="list-disc space-y-1.5 pl-5 text-gray-600 sm:pl-6">
          <li>Retards indépendants de sa volonté</li>
          <li>Actions douanières</li>
          <li>Perte liée à fausse déclaration</li>
          <li>Produits interdits</li>
          <li>Mauvaise information fournie par le client</li>
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-black text-mex-dark sm:text-xl">14. MODIFICATION DES CONDITIONS</h3>
        <p>
          MEX509 se réserve le droit de modifier ces conditions à tout moment. Les nouvelles conditions seront
          applicables dès leur publication.
        </p>
      </section>

      <section>
        <h3 className="mb-3 text-lg font-black text-mex-dark sm:text-xl">15. ACCEPTATION</h3>
        <p className="mb-2 font-bold text-gray-800">En utilisant nos services, le client confirme :</p>
        <ul className="list-disc space-y-1.5 pl-5 text-gray-600 sm:pl-6">
          <li>Avoir lu et compris les conditions</li>
          <li>Accepter toutes les règles</li>
          <li>S&apos;engager à les respecter</li>
        </ul>
      </section>

      <section className="rounded-2xl bg-gray-900 p-6 text-center text-white sm:p-8">
        <h3 className="mb-2 font-black text-xl text-white">16. CONTACT</h3>
        <p className="mb-4 text-sm text-gray-400">Pour toute question :</p>
        <div className="flex flex-col items-center justify-center gap-4 text-base font-bold sm:flex-row sm:gap-8">
          <a href="mailto:info@mex509.com" className="flex items-center gap-2 transition-colors hover:text-mex-orange">
            <Mail size={22} /> info@mex509.com
          </a>
          <a href="tel:+50934494494" className="flex items-center gap-2 transition-colors hover:text-mex-orange">
            <Phone size={22} /> +50934494494
          </a>
        </div>
        <p className="mt-8 border-t border-gray-700 pt-6 text-xs font-medium uppercase tracking-widest text-gray-500">
          MEX509 SHIPPING – Reliable. Fast. Secure.
        </p>
      </section>
    </div>
  );
}
