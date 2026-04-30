import { Home, Receipt, Send, MapPin } from "lucide-react";

type ServicePoint = {
  id: string;
  city: string;
  title: string;
  address: string;
  phone?: string;
  photoUrl?: string;
  tags: string[];
};

const SERVICE_POINTS: ServicePoint[] = [
  {
    id: "st-marc",
    city: "St Marc",
    title: "MelschyElectronic's St Marc",
    address: "Rue Louverture, Saint-Marc",
    tags: ["Accueil", "Recus", "Envoyes", "Point de Service"],
  },
  {
    id: "santiago",
    city: "Santiago (RD)",
    title: "Villa Olimpica pickup point",
    address: "Villa Olimpica Manzana M Casa 8B, Rep. Dominicaine",
    phone: "+1 809 407 5020",
    // Replace with the real storefront photo when provided.
    photoUrl: "/marketing/promo-trusted-cargo.png",
    tags: ["Accueil", "Recus", "Envoyes", "Point de Service"],
  },
];

const TAG_ICONS = [Home, Receipt, Send, MapPin] as const;

export default function ServicePointsSection() {
  return (
    <section className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
      <div className="mb-5 flex flex-col gap-2">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-mex-blue/80">Service points</p>
        <h3 className="text-2xl font-black text-mex-dark">DHL-style local points</h3>
        <p className="text-sm font-medium text-gray-600">
          Structure is ready to add Cap-Haitien and Hinche without changing layout logic.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {SERVICE_POINTS.map((point) => (
          <article key={point.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/50">
            {point.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={point.photoUrl} alt={`${point.city} service point`} className="h-44 w-full object-cover" />
            ) : null}
            <div className="p-4">
              <p className="text-xs font-black uppercase tracking-widest text-mex-orange">{point.city}</p>
              <h4 className="mt-1 text-lg font-black text-mex-dark">{point.title}</h4>
              <p className="mt-1 text-sm font-medium text-gray-600">{point.address}</p>
              {point.phone ? <p className="mt-1 text-sm font-bold text-mex-blue">{point.phone}</p> : null}
              <div className="mt-3 flex flex-wrap gap-2">
                {point.tags.map((tag, i) => {
                  const Icon = TAG_ICONS[i % TAG_ICONS.length];
                  return (
                    <span
                      key={`${point.id}-${tag}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-bold text-gray-700"
                    >
                      <Icon className="h-3.5 w-3.5 text-mex-blue" />
                      {tag}
                    </span>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
