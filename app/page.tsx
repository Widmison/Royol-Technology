import Image from "next/image";
import Link from "next/link";
// Added Star and Quote to the lucide-react import
import { Search, MapPin, Plane, Ship, ShieldCheck, Clock, Package, Star, Quote } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
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

            <div className="bg-white p-3 md:p-5 rounded-2xl shadow-xl flex flex-col sm:flex-row gap-3 items-center border border-gray-100 relative z-20 max-w-3xl mx-auto">
              <div className="relative w-full flex-grow">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Enter tracking number (e.g., MEX1234)"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-mex-orange focus:border-transparent text-gray-800 font-medium"
                />
              </div>
              <Link href="/track" className="w-full sm:w-auto bg-mex-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                Track
              </Link>
            </div>
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