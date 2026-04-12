import BrandLogo from "@/components/BrandLogo";

export default function Footer() {
  return (
    <footer className="bg-mex-dark text-white py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center md:items-start gap-10 md:gap-8">
        
        {/* Left Side: Brand & Slogan */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto">
          <div className="mb-3 flex items-center justify-center md:justify-start">
            <BrandLogo href="/" width={200} height={64} className="h-12 w-auto max-w-[180px] object-left" prefetch={false} />
          </div>
          <p className="text-gray-400 text-sm font-medium mt-1">Reliable. Fast. Secure.</p>
          <p className="text-gray-500 text-xs mt-1">Sèvis rapid e sekirize. Livrezon garanti!</p>
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLSevT3DsMg7B3fXAX9sqz4xOZYds_Xhk2QzmWOn2yCsgPSs7kA/viewform?pli=1"
            target="_blank"
            rel="noopener noreferrer"
            className="group mx-auto mt-4 block w-full max-w-sm text-center text-sm font-bold text-mex-orange underline decoration-mex-orange underline-offset-4 transition-colors hover:text-white hover:decoration-white"
          >
            <span className="block">Invest with us — tell us you want to partner (Google Form)</span>
            <span className="mt-1 block text-xs font-medium normal-case text-gray-400 group-hover:text-gray-200">
              Envesti avè nou — ranpli fòm patnè a isit la.
            </span>
          </a>
        </div>

        {/* Middle: Contact & Terms */}
        <div className="flex flex-col items-center md:items-start text-sm text-gray-400 gap-2 text-center md:text-left w-full md:w-auto">
          <h3 className="font-bold text-white mb-2 uppercase tracking-wider text-xs">Contact & Info</h3>
          
          <p className="flex items-start gap-2 hover:text-white transition-colors">
            <span className="text-mex-orange">📍</span> 
            <span>1962 NW 82nd Ave<br/>Doral, FL 33126</span>
          </p>
          
          <p>
            <a href="mailto:info@mex509.com" className="flex items-center gap-2 hover:text-mex-orange transition-colors py-1">
               <span className="text-mex-orange">✉️</span> info@mex509.com
            </a>
          </p>
          
          <p>
            <a href="tel:+50934494494" className="flex items-center gap-2 hover:text-mex-orange transition-colors py-1">
              <span className="text-mex-orange">📞</span> +509 34 49 44 94
            </a>
          </p>
          
          <div className="mt-2 border-t border-gray-800 pt-3">
            <a href="/conditions-generales" className="text-gray-300 font-medium hover:text-mex-orange transition-colors underline decoration-mex-orange underline-offset-4 py-1 block">
              Conditions Générales d'Utilisation
            </a>
            <p className="text-xs text-gray-600 mt-2">Dernière mise à jour: 01/04/2026</p>
          </div>
        </div>

        {/* Right Side: Copyright & Developer Signature */}
        <div className="flex flex-col items-center md:items-end gap-2 text-sm text-gray-400 font-medium text-center md:text-right w-full md:w-auto pt-8 md:pt-0 border-t border-gray-800 md:border-none">
          <div>&copy; {new Date().getFullYear()} MEX509 SHIPPING SERVICES. All rights reserved.</div>
          <div className="text-xs text-gray-500 mt-1">
            Designed and Developed by{' '}
            <a 
              href="https://royoltechnology.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-mex-orange hover:text-white transition-colors font-bold py-1 inline-block"
            >
              Royol Technology
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}