import Image from "next/image";
import Link from "next/link";
// Added Star and Quote to the lucide-react import
import {
  Search,
  MapPin,
  Plane,
  Ship,
  ShieldCheck,
  Clock,
  Package,
  Star,
  Quote,
  Phone,
  Mail,
  ExternalLink,
  Truck,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import type { Metadata } from "next";
import HomeJsonLd from "@/components/seo/HomeJsonLd";

export const metadata: Metadata = {
  title: "Shipping USA, DR & China to Haiti",
  description:
    "Track packages, request a quote, and ship with MEX509 from Doral, FL. Air, ocean, and ground freight to Haiti — fast, secure, guaranteed service.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "MEX509 | Voye Li Vit, Resevwa Li Vit!",
    description:
      "Sèvis rapid e sekirize. Livrezon garanti! USA, DR, and China to Haiti — track, quote, and ship.",
    url: "/",
  },
};

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <HomeJsonLd />
      
      {/* HERO SECTION (Your Custom Design) */}
      <section className="bg-mex-gray pt-6 pb-24 lg:pt-10 lg:pb-32 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">
          
          <div className="w-full flex justify-center relative mb-4">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-tr from-mex-blue/10 to-mex-orange/10 rounded-full blur-2xl -z-10"></div>
            
            <Image 
              src="/hero-v2.jpg" 
              alt="MEX509 Delivery Courier" 
              width={220} 
              height={275} 
              className="w-full max-w-[140px] md:max-w-[180px] lg:max-w-[220px] object-contain drop-shadow-xl z-10"
              priority
            />
          </div>

          <div className="text-center w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-mex-blue tracking-tight mb-3 italic uppercase">
              Voye Li Vit, <br className="block sm:hidden" />
              <span className="text-mex-orange">Resevwa Li Vit!</span>
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-6 font-medium max-w-2xl mx-auto">
              Sèvis rapid e sekirize. Livrezon garanti! Fast, secure, and headache-free delivery logistics from USA, DR, and China to Haiti.
            </p>

            <form
              action="/track"
              method="get"
              className="bg-white p-3 md:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center border border-gray-100 relative z-20 max-w-3xl mx-auto"
            >
              <div className="relative w-full flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  name="id"
                  type="search"
                  autoComplete="off"
                  placeholder="Enter tracking number (e.g., MEX1234)"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mex-orange focus:border-transparent text-gray-800 font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto bg-mex-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
              >
                Track package
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* QUICK ACTIONS / SERVICES OVERVIEW (Your Custom Design) */}
      <section className="py-12 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 -mt-20">
            
            <div className="group bg-white rounded-3xl shadow-md hover:shadow-xl p-8 border border-gray-100 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300">
              <div className="bg-blue-50 group-hover:bg-mex-blue transition-colors duration-300 p-4 rounded-2xl mb-5">
                <Plane className="h-8 w-8 text-mex-blue group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-mex-dark mb-3">Air Freight</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Fast delivery in 5-7 days for urgent packages and documents.
              </p>
              <Link href="/services#air" className="mt-auto text-sm font-bold text-gray-400 group-hover:text-mex-blue transition-colors">
                Learn more &rarr;
              </Link>
            </div>
            
            <div className="group bg-white rounded-3xl shadow-xl p-8 border-2 border-mex-orange/20 relative flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300 overflow-hidden md:-mt-4 md:mb-4">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-mex-orange to-orange-400"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-mex-orange/5 rounded-bl-full -z-10"></div>

              <div className="bg-orange-50 group-hover:bg-mex-orange transition-colors duration-300 p-5 rounded-2xl mb-5">
                <Package className="h-9 w-9 text-mex-orange group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-black text-mex-dark mb-3 tracking-tight">Send a Package</h3>
              <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                Calculate price & request a pickup instantly using our smart online form.
              </p>
              <Link 
                href="/quote" 
                className="mt-auto w-full bg-mex-orange/10 group-hover:bg-mex-orange text-mex-orange group-hover:text-white py-3 px-6 rounded-xl font-bold transition-all duration-300"
              >
                Get a Quote Now
              </Link>
            </div>

            <div className="group bg-white rounded-3xl shadow-md hover:shadow-xl p-8 border border-gray-100 flex flex-col items-center text-center hover:-translate-y-2 transition-all duration-300">
              <div className="bg-blue-50 group-hover:bg-mex-blue transition-colors duration-300 p-4 rounded-2xl mb-5">
                <Ship className="h-8 w-8 text-mex-blue group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-bold text-mex-dark mb-3">Ocean Freight</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                Cost-effective shipping for heavy barrels, appliances, and large cargo.
              </p>
              <Link href="/services#ocean" className="mt-auto text-sm font-bold text-gray-400 group-hover:text-mex-blue transition-colors">
                Learn more &rarr;
              </Link>
            </div>

          </div>
          <p className="mt-10 max-w-2xl mx-auto text-center text-sm text-gray-600">
            <span className="font-bold text-mex-dark">Ground &amp; regional freight</span> is available too —{" "}
            <Link href="/services" className="font-bold text-mex-blue underline-offset-2 hover:underline">
              browse all services
            </Link>{" "}
            or{" "}
            <Link href="/quote" className="font-bold text-mex-orange underline-offset-2 hover:underline">
              start a quote
            </Link>
            .
          </p>
        </div>
      </section>

      {/* HOW IT WORKS — reduces uncertainty for first-time shippers */}
      <section className="border-t border-gray-100 bg-gray-50 py-16 sm:py-20" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 id="how-it-works-heading" className="text-3xl font-black italic uppercase text-mex-blue sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-sm font-medium text-gray-600 sm:text-base">
              From your first quote to delivery in Haiti — simple steps, clear expectations.
            </p>
          </div>
          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "1",
                title: "Pre-register online",
                body: "Tell us what you’re shipping, where it’s going, and how you want it sent (air, ocean, or ground).",
                icon: ClipboardList,
              },
              {
                step: "2",
                title: "Drop off in Doral",
                body: "Bring your packages to our Doral counter. We weigh, verify, and prepare your shipment.",
                icon: MapPin,
              },
              {
                step: "3",
                title: "Pay & we ship",
                body: "After weighing you get a clear invoice. Once paid, your cargo moves on the next available leg.",
                icon: CreditCard,
              },
              {
                step: "4",
                title: "Track to delivery",
                body: "Use your tracking ID anytime for status updates until your recipient gets the package.",
                icon: Package,
              },
            ].map(({ step, title, body, icon: Icon }) => (
              <li
                key={step}
                className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
              >
                <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-mex-orange text-sm font-black text-white">
                  {step}
                </span>
                <Icon className="mb-3 h-8 w-8 text-mex-blue" aria-hidden />
                <h3 className="text-lg font-black text-mex-dark">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-mex-orange px-8 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:bg-orange-700"
            >
              Start your quote
            </Link>
            <Link
              href="/login"
              className="text-sm font-bold text-mex-blue underline-offset-4 hover:underline"
            >
              Already a customer? Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* VISIT + CONTACT — trust & convenience */}
      <section className="bg-white py-14 sm:py-16" aria-labelledby="visit-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <h2 id="visit-heading" className="text-2xl font-black italic uppercase text-mex-dark sm:text-3xl">
                Visit us in Doral
              </h2>
              <p className="mt-3 text-sm font-medium text-gray-600 sm:text-base">
                Walk-ins welcome for drop-off and questions. Call ahead if you’re bringing oversized cargo.
              </p>
              <address className="mt-6 not-italic text-base font-bold text-mex-dark">
                1962 NW 82nd Ave
                <br />
                Doral, FL 33126
              </address>
              <div className="mt-6 flex flex-col gap-3 text-sm font-semibold text-gray-700 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
                <a
                  href="tel:+50934494494"
                  className="inline-flex items-center gap-2 text-mex-blue transition hover:text-mex-orange"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  +509 34 49 44 94
                </a>
                <a
                  href="mailto:info@mex509.com"
                  className="inline-flex items-center gap-2 text-mex-blue transition hover:text-mex-orange"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  info@mex509.com
                </a>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=1962+NW+82nd+Ave+Doral+FL+33126"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-mex-blue px-5 py-3 text-sm font-bold text-mex-blue transition hover:bg-mex-blue hover:text-white"
              >
                Open in Google Maps
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </div>
            <div className="flex flex-1 flex-col items-start rounded-2xl border border-gray-100 bg-mex-gray/50 p-6 sm:p-8 lg:max-w-md">
              <Truck className="mb-3 h-10 w-10 text-mex-orange" aria-hidden />
              <h3 className="text-lg font-black text-mex-dark">Pickup &amp; cutoffs</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Air and ocean schedules vary by week. After you submit a quote, our team confirms timing, required
                paperwork, and anything special about your cargo — so there are no surprises at the counter.
              </p>
              <Link href="/services" className="mt-4 text-sm font-bold text-mex-orange hover:underline">
                Read service details →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: CLIENT TESTIMONIALS */}
      <section className="py-20 bg-mex-blue relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase mb-4">What Our Clients Say</h2>
            <p className="text-blue-200 font-medium max-w-2xl mx-auto">Don't just take our word for it. See why hundreds of clients trust MEX509 for their shipping needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl relative">
              <Quote className="absolute top-6 right-6 h-10 w-10 text-gray-100" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />))}
              </div>
              <p className="text-gray-600 mb-6 relative z-10 italic">
                "Sèvis la rapid tout bon! Mwen voye yon laptop pou frè m Ayiti, li jwenn li san grate tèt. Mèsi MEX509!"
              </p>
              <div className="font-bold text-mex-dark">- Jean Michel</div>
              <div className="text-xs text-gray-400">Miami, FL</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl relative transform md:-translate-y-4">
              <Quote className="absolute top-6 right-6 h-10 w-10 text-gray-100" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />))}
              </div>
              <p className="text-gray-600 mb-6 relative z-10 italic">
                "The best shipping company from USA to Haiti. Very professional and my barrels always arrive exactly on time. Highly recommended!"
              </p>
              <div className="font-bold text-mex-dark">- Sarah L.</div>
              <div className="text-xs text-gray-400">Orlando, FL</div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl relative">
              <Quote className="absolute top-6 right-6 h-10 w-10 text-gray-100" />
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (<Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />))}
              </div>
              <p className="text-gray-600 mb-6 relative z-10 italic">
                "Mwen renmen kòman yo toujou reponn sou WhatsApp. Tracking sistèm lan vrèman fasil pou itilize pou wè kote pakè a ye."
              </p>
              <div className="font-bold text-mex-dark">- Patrick D.</div>
              <div className="text-xs text-gray-400">Dominican Republic</div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ — answers objections before they bounce */}
      <section className="border-t border-gray-100 bg-white py-16 sm:py-20" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 id="faq-heading" className="text-center text-3xl font-black italic uppercase text-mex-blue sm:text-4xl">
            Common questions
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-gray-600">
            Quick answers for new shippers. For specifics on your box, we’re happy to help by phone or email.
          </p>
          <div className="mt-10 space-y-3">
            {[
              {
                q: "Do I need an account to get a quote?",
                a: "No. You can complete the quote form first. Creating an account is useful to save addresses, see invoices, and track everything in one place.",
              },
              {
                q: "What happens after I submit a quote?",
                a: "You’ll bring your goods to our Doral location for weighing. We then invoice you based on actual weight/volume and service — you pay before we release the shipment into transit.",
              },
              {
                q: "How long do air and ocean take?",
                a: "Typical ranges are about 5–7 business days for air and about 14–21 for ocean, depending on consolidation and customs. We’ll confirm a realistic window for your lane when you check in.",
              },
              {
                q: "Can you handle shopping purchases or door delivery?",
                a: "Yes — we offer shopping assistance and local delivery options as part of our service lineup. See the Services page for how each product works.",
              },
              {
                q: "What should I bring to drop-off?",
                a: "Your packed items, any invoices or declarations you have, and a valid ID. If you’re unsure what’s allowed, contact us before you ship so we can advise.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-gray-200 bg-gray-50/80 px-5 py-4 open:bg-white open:shadow-md"
              >
                <summary className="cursor-pointer font-bold text-mex-dark text-sm sm:text-base">
                  {item.q}
                </summary>
                <p className="mt-3 border-t border-gray-100 pt-3 text-sm leading-relaxed text-gray-600">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US / TRUST BADGES */}
      <section className="py-16 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-black italic text-mex-dark mb-12 uppercase">Livrezon San Grate Tèt!</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <Clock className="h-12 w-12 text-mex-orange mb-4" />
              <h4 className="font-bold text-lg mb-2 text-mex-dark">Fast Turnaround</h4>
              <p className="text-gray-500 text-sm">Average delivery timeframe of just 10 days straight to Haiti.</p>
            </div>
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-12 w-12 text-mex-orange mb-4" />
              <h4 className="font-bold text-lg mb-2 text-mex-dark">100% Secure</h4>
              <p className="text-gray-500 text-sm">Your items are logged, insured, and tracked every step of the way.</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-12 w-12 text-mex-orange mb-4" />
              <h4 className="font-bold text-lg mb-2 text-mex-dark">Local Delivery</h4>
              <p className="text-gray-500 text-sm">Convenient pickup locations and direct-to-door options available.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}