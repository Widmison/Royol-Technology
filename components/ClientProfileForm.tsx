"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, CheckCircle, Mail, User as UserIcon, Phone, MapPin, ShieldCheck, CalendarDays, Edit2, X } from "lucide-react";

export default function ClientProfileForm({ user }: { user: any }) {
  const router = useRouter();
  
  // NEW: Control whether the form is in "Read-Only" or "Edit" mode!
  const [isEditing, setIsEditing] = useState(false); 
  
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  const [city, setCity] = useState(user.city || "");
  const [state, setState] = useState(user.state || "");
  const [zipCode, setZipCode] = useState(user.zipCode || "");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, address, city, state, zipCode }),
      });

      if (res.ok) {
        setSuccess(true);
        setIsEditing(false); // Turn off edit mode after saving!
        router.refresh();
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset all fields back to the original database values if they cancel
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setCity(user.city || "");
    setState(user.state || "");
    setZipCode(user.zipCode || "");
    setIsEditing(false); // Turn off edit mode
  };

  // NEW: Dynamic input styling based on whether they are editing or not
  const inputStyle = `w-full rounded-xl px-4 py-3 outline-none font-bold transition-all ${
    isEditing 
      ? "border border-gray-300 focus:ring-2 focus:ring-mex-blue text-mex-dark bg-white" 
      : "border border-transparent bg-gray-50 text-gray-600 cursor-default"
  }`;

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl flex items-center gap-3 font-bold animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
          <CheckCircle size={24} className="text-green-500" /> 
          <div>
            <div className="text-lg">Profile Successfully Updated!</div>
            <div className="text-sm font-medium text-green-600">Your information has been securely saved to the database.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: ACCOUNT BASICS (READ-ONLY) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-black text-mex-dark mb-4 flex items-center gap-2 border-b border-gray-100 pb-4"><ShieldCheck className="text-mex-blue"/> Account Security</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Registered Email</label>
                {/* FIXED: Added 'overflow-hidden', 'shrink-0' and 'truncate' to stop long emails from breaking out */}
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-500 font-medium overflow-hidden">
                  <Mail size={16} className="text-gray-400 shrink-0"/> 
                  <span className="truncate">{user.email}</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1 font-medium">Contact support to change your login email.</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Member Since</label>
                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-500 font-medium">
                  <CalendarDays size={16} className="text-gray-400"/> {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Status</label>
                <div className="flex items-center gap-2">
                  {user.isVerified ? (
                     <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1"><CheckCircle size={12}/> Verified</span>
                  ) : (
                     <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1">Unverified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EDITABLE PROFILE FORM */}
        <div className="lg:col-span-2">
          <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            
            {/* FORM HEADER & EDIT BUTTON */}
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-6">
              <h3 className="text-xl font-black text-mex-dark flex items-center gap-2"><UserIcon className="text-mex-blue"/> Personal Information</h3>
              {!isEditing && (
                <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                  <Edit2 size={16} /> Edit Info
                </button>
              )}
            </div>

            <div className="space-y-8">
              {/* PERSONAL INFO SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">First Name</label>
                  <input type="text" readOnly={!isEditing} value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputStyle} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">Last Name</label>
                  <input type="text" readOnly={!isEditing} value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputStyle} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-500 mb-2">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Phone className={`h-5 w-5 ${isEditing ? 'text-gray-400' : 'text-gray-400'}`} /></div>
                    <input type="text" readOnly={!isEditing} value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputStyle} pl-11`} />
                  </div>
                </div>
              </div>

              {/* ADDRESS SECTION */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-lg font-black text-mex-dark mb-4 flex items-center gap-2"><MapPin className="text-mex-blue h-5 w-5"/> Home / Delivery Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Street Address</label>
                    <input type="text" readOnly={!isEditing} value={address} onChange={(e) => setAddress(e.target.value)} className={inputStyle} placeholder="123 Main St" />
                  </div>
                  
                  <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-6 md:col-span-3">
                      <label className="block text-sm font-bold text-gray-500 mb-2">City</label>
                      <input type="text" readOnly={!isEditing} value={city} onChange={(e) => setCity(e.target.value)} className={inputStyle} placeholder="Miami" />
                    </div>
                    <div className="col-span-3 md:col-span-1">
                      <label className="block text-sm font-bold text-gray-500 mb-2">State</label>
                      <input type="text" readOnly={!isEditing} value={state} onChange={(e) => setState(e.target.value)} className={inputStyle} placeholder="FL" />
                    </div>
                    <div className="col-span-3 md:col-span-2">
                      <label className="block text-sm font-bold text-gray-500 mb-2">Zip Code</label>
                      <input type="text" readOnly={!isEditing} value={zipCode} onChange={(e) => setZipCode(e.target.value)} className={inputStyle} placeholder="33191" />
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: SAVE OR CANCEL ACTION BUTTONS (Only visible when editing) */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100 animate-in fade-in duration-300">
                  <button type="button" onClick={handleCancel} disabled={isSaving} className="w-full sm:w-auto bg-gray-100 text-gray-600 font-bold text-lg px-8 py-4 rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    <X size={20} /> Cancel
                  </button>
                  <button type="submit" disabled={isSaving} className="flex-1 bg-mex-blue text-white font-black text-lg px-8 py-4 rounded-xl hover:bg-blue-900 transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 disabled:opacity-50">
                    <Save size={20} /> {isSaving ? "Saving Updates..." : "Save Profile Updates"}
                  </button>
                </div>
              )}

            </div>
          </form>
        </div>

      </div>
    </div>
  );
}