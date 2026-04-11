"use client";

import { useState } from "react";
import { Phone, Map as MapIcon, Calendar, Package as PackageIcon, X, Clock } from "lucide-react";

export default function ClientGrid({ clients }: { clients: any[] }) {
  // This state remembers which client you clicked on to show the modal!
  const [selectedClient, setSelectedClient] = useState<any>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {clients.length === 0 ? (
          <div className="col-span-full p-10 text-center text-gray-500 font-medium bg-white rounded-2xl border border-gray-100">
            No clients found in the database yet.
          </div>
        ) : (
          clients.map((client: any) => (
            <div 
              key={client.id} 
              onClick={() => setSelectedClient(client)}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-mex-blue transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-mex-blue font-black flex items-center justify-center text-lg group-hover:bg-mex-blue group-hover:text-white transition-colors">
                  {client.firstName.charAt(0)}{client.lastName.charAt(0)}
                </div>
                <span className="bg-orange-50 text-mex-orange px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1">
                  <PackageIcon size={12}/> {client.shipmentCount} {client.shipmentCount === 1 ? 'Order' : 'Orders'}
                </span>
              </div>
              
              <h3 className="font-black text-lg text-mex-dark mb-1">{client.firstName} {client.lastName}</h3>
              
              <div className="space-y-2 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Phone size={16} className="text-gray-400" /> {client.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <MapIcon size={16} className="text-gray-400" /> {client.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                  <Calendar size={16} className="text-gray-400" /> Last active: {new Date(client.lastActive).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ============================== */}
      {/* POPUP MODAL (FULL CLIENT DETAILS) */}
      {/* ============================== */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* MODAL HEADER */}
            <div className="bg-mex-dark p-6 flex justify-between items-center text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-mex-blue font-black flex items-center justify-center text-xl shadow-inner">
                  {selectedClient.firstName.charAt(0)}{selectedClient.lastName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black">{selectedClient.firstName} {selectedClient.lastName}</h2>
                  <p className="text-gray-300 text-sm font-medium flex items-center gap-2">
                    <Phone size={14}/> {selectedClient.phone} | <MapIcon size={14}/> {selectedClient.location}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-gray-400 hover:text-white font-bold transition-colors">
                <X size={28} />
              </button>
            </div>

            {/* MODAL BODY - SCROLLABLE HISTORY */}
            <div className="p-6 overflow-y-auto bg-gray-50 flex-1">
              <h3 className="font-bold text-mex-dark mb-4 flex items-center gap-2">
                <Clock className="text-mex-orange" /> Order History ({selectedClient.shipmentCount})
              </h3>
              
              <div className="space-y-4">
                {selectedClient.history.map((order: any, idx: number) => (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-mex-dark text-lg mb-1">{order.departure} &rarr; Haiti</div>
                      <div className="text-sm text-gray-500 font-medium">Category: <span className="text-gray-700">{order.category}</span></div>
                      <div className="text-xs text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        order.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        order.status === 'INVOICED' ? 'bg-blue-100 text-blue-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {String(order.status).replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}