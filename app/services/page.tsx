import { Plane, MapPin, ShoppingCart, Warehouse, Ship } from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      title: "Shipping USA to Haiti",
      icon: <Plane className="h-10 w-10 text-mex-blue" />,
      desc: "Fast, reliable air and ocean freight from our Miami warehouse directly to Port-au-Prince. Secure handling for personal packages, electronics, and commercial goods.",
    },
    {
      title: "Shipping DR to Haiti",
      icon: <Ship className="h-10 w-10 text-mex-blue" />,
      desc: "Cross-border logistics from the Dominican Republic to Haiti. We handle customs, transportation, and final delivery safely and efficiently.",
    },
    {
      title: "Online Shopping Assistance",
      icon: <ShoppingCart className="h-10 w-10 text-mex-blue" />,
      desc: "Don't have a credit card? We buy on your behalf from Shein, Amazon, Alibaba, or DR stores, and ship it straight to you in Haiti.",
    },
    {
      title: "Local Delivery",
      icon: <MapPin className="h-10 w-10 text-mex-blue" />,
      desc: "Convenient local distribution. Choose between secure pickup at our designated facilities or direct-to-door delivery in supported zones.",
    },
    {
      title: "Warehouse Services",
      icon: <Warehouse className="h-10 w-10 text-mex-blue" />,
      desc: "Secure storage solutions. Consolidate multiple packages into one shipment to save money on freight costs.",
    }
  ];

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-black italic text-mex-blue uppercase mb-4">Our Services</h1>
          <p className="text-lg text-gray-600 font-medium">
            Comprehensive logistics solutions tailored for speed, security, and peace of mind.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-mex-orange/30 transition-all group flex flex-col h-full">
              <div className="bg-white w-20 h-20 rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-mex-dark mb-4">{service.title}</h3>
              <p className="text-gray-600 leading-relaxed mb-8 flex-grow">
                {service.desc}
              </p>
              <button className="text-mex-orange font-bold flex items-center gap-2 hover:gap-3 transition-all mt-auto w-fit">
                Start Now <span className="text-xl">&rarr;</span>
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}