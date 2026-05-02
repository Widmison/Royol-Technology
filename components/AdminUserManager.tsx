"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Plus, Edit2, Trash2, Mail, Phone, Calendar, 
  X, CheckCircle, AlertTriangle, MapPin
} from "lucide-react";
import { SIGNUP_PASSWORD_RULES_TEXT } from "@/lib/passwordPolicy";

export default function AdminUserManager({ initialUsers }: { initialUsers: any[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  
  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form State (Now includes Address fields, removed Role)
  const [formData, setFormData] = useState({
    id: "", firstName: "", lastName: "", email: "", phone: "", password: "",
    address: "", city: "", state: "", zipCode: ""
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const filteredUsers = users.filter(u => 
    `${u.firstName} ${u.lastName} ${u.email} ${u.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setFormData({ 
      id: "", firstName: "", lastName: "", email: "", phone: "", password: "",
      address: "", city: "", state: "", zipCode: ""
    });
    setError("");
    setIsAddOpen(true);
  };

  const openEditModal = (user: any) => {
    setFormData({
      id: user.id, firstName: user.firstName || "", lastName: user.lastName || "", 
      email: user.email || "", phone: user.phone || "", password: "",
      address: user.address || "", city: user.city || "", state: user.state || "", zipCode: user.zipCode || ""
    });
    setSelectedUser(user);
    setError("");
    setIsEditOpen(true);
  };

  const openDeleteModal = (user: any) => {
    setSelectedUser(user);
    setError("");
    setIsDeleteOpen(true);
  };

  const handleAction = async (action: "create" | "update" | "delete") => {
    setIsProcessing(true);
    setError("");
    setSuccessMessage("");

    try {
      const payload =
        action === "delete" && selectedUser
          ? { action: "delete", id: selectedUser.id }
          : { action, ...formData, id: selectedUser?.id ?? formData.id };

      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Action failed");

      if (action === "create") setUsers([data.user, ...users]);
      if (action === "update") setUsers(users.map((u) => (u.id === data.user.id ? data.user : u)));
      if (action === "delete" && selectedUser) {
        setUsers(users.filter((u) => u.id !== selectedUser.id));
        setSuccessMessage(data.message || "Client deleted successfully.");
        window.setTimeout(() => setSuccessMessage(""), 5000);
      }

      setIsAddOpen(false);
      setIsEditOpen(false);
      setIsDeleteOpen(false);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {successMessage && (
        <div className="animate-in fade-in zoom-in rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-black text-green-800 duration-200">
          {successMessage}
        </div>
      )}
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center bg-white rounded-xl px-4 py-3 w-full md:w-96 border border-gray-200 shadow-sm focus-within:border-mex-blue focus-within:ring-2 focus-within:ring-blue-50 transition-all">
          <Search className="text-gray-400 h-5 w-5 mr-3" />
          <input 
            type="text" 
            placeholder="Search clients by name, email, or phone..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none focus:outline-none w-full text-sm font-medium text-gray-700" 
          />
        </div>
        <button onClick={openAddModal} className="bg-mex-blue text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-900 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 w-full md:w-auto">
          <Plus size={20} /> Add New Client
        </button>
      </div>

      {/* USERS TABLE — stacked cards on small screens, full table on large */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
        <div className="lg:hidden divide-y divide-gray-100">
          {filteredUsers.length === 0 ? (
            <p className="p-8 text-center text-gray-500 font-medium">No clients found.</p>
          ) : (
            filteredUsers.map((u) => (
              <div key={u.id} className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-black text-mex-dark text-base">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 font-medium">ID: {u.id.substring(0, 8)}…</div>
                  </div>
                  {u.isVerified ? (
                    <span className="shrink-0 bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                      <CheckCircle size={12} /> Verified
                    </span>
                  ) : (
                    <span className="shrink-0 bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1">
                      <AlertTriangle size={12} /> Pending
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-start gap-2 text-gray-600 font-medium min-w-0">
                    <Mail size={14} className="text-gray-400 shrink-0 mt-0.5" />
                    <span className="break-all">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    {u.phone || "N/A"}
                  </div>
                  <div className="flex items-start gap-2 text-gray-600 font-medium">
                    <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-mex-dark font-bold">{u.address || "No address on file"}</div>
                      {(u.city || u.state || u.zipCode) && (
                        <div className="text-xs text-gray-400">
                          {u.city}, {u.state} {u.zipCode}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm pt-1">
                    <Calendar size={14} />
                    {new Date(u.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(u)}
                    className="p-2.5 bg-blue-50 text-mex-blue hover:bg-blue-100 rounded-xl transition-colors"
                    aria-label={`Edit ${u.firstName} ${u.lastName}`}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteModal(u)}
                    className="p-2.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                    aria-label={`Delete ${u.firstName} ${u.lastName}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden lg:block overflow-x-auto overscroll-x-contain">
          <table className="w-full text-left min-w-[880px]">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold">Client Name</th>
                <th className="p-5 font-bold">Contact Info</th>
                <th className="p-5 font-bold">Home Address</th>
                <th className="p-5 font-bold">Status</th>
                <th className="p-5 font-bold hidden md:table-cell">Date Joined</th>
                <th className="p-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">
                    No clients found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-5">
                      <div className="font-black text-mex-dark text-base">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 font-medium">ID: {u.id.substring(0, 8)}...</div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-gray-600 font-medium mb-1">
                        <Mail size={14} className="text-gray-400 shrink-0" />{" "}
                        <span className="truncate w-32 md:w-auto block">{u.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Phone size={14} className="text-gray-400 shrink-0" /> {u.phone || "N/A"}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-start gap-2 text-gray-600 font-medium">
                        <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-sm text-mex-dark font-bold">{u.address || "No address on file"}</div>
                          {(u.city || u.state || u.zipCode) && (
                            <div className="text-xs text-gray-400">
                              {u.city}, {u.state} {u.zipCode}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      {u.isVerified ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
                          <CheckCircle size={12} /> Verified
                        </span>
                      ) : (
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit">
                          <AlertTriangle size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-gray-500 font-medium hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} /> {new Date(u.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 bg-blue-50 text-mex-blue hover:bg-blue-100 rounded-lg transition-colors inline-block"
                        aria-label={`Edit ${u.firstName} ${u.lastName}`}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(u)}
                        className="p-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors inline-block"
                        aria-label={`Delete ${u.firstName} ${u.lastName}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================== */}
      {/* ADD / EDIT USER MODAL */}
      {/* ========================================== */}
      {(isAddOpen || isEditOpen) && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-black text-mex-dark flex items-center gap-2">
                {isAddOpen ? <><Plus className="text-mex-blue"/> Add New Client</> : <><Edit2 className="text-mex-blue"/> Edit Client Info</>}
              </h2>
              <button onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow-sm"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold text-center">{error}</div>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">First Name</label>
                  <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-bold text-mex-dark" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">Last Name</label>
                  <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-bold text-mex-dark" placeholder="Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">Email Address</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-bold text-mex-dark" placeholder="client@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-2">Phone Number</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-bold text-mex-dark" placeholder="555-123-4567" />
                </div>
                
                {isAddOpen && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-gray-500 mb-2">Initial password</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-bold text-mex-dark"
                      placeholder="Required — share securely with the client"
                    />
                    <p className="mt-2 text-xs font-medium text-gray-500">{SIGNUP_PASSWORD_RULES_TEXT}</p>
                  </div>
                )}

                {/* ADDED ADDRESS FIELDS TO MODAL */}
                <div className="md:col-span-2 pt-6 border-t border-gray-100">
                  <h3 className="font-black text-mex-dark mb-4 flex items-center gap-2"><MapPin className="text-mex-blue h-5 w-5"/> Client Home Address</h3>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-500 mb-2">Street Address</label>
                  <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-bold text-mex-dark" placeholder="123 Main St" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-gray-500 mb-2">City</label>
                  <input type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-bold text-mex-dark" placeholder="Miami" />
                </div>
                <div className="grid grid-cols-2 gap-4 col-span-2 md:col-span-1">
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">State</label>
                    <input type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-bold text-mex-dark" placeholder="FL" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-500 mb-2">Zip</label>
                    <input type="text" value={formData.zipCode} onChange={(e) => setFormData({...formData, zipCode: e.target.value})} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-mex-blue outline-none font-bold text-mex-dark" placeholder="33191" />
                  </div>
                </div>

              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-4">
              <button onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
              <button onClick={() => handleAction(isAddOpen ? "create" : "update")} disabled={isProcessing} className="bg-mex-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors shadow-lg shadow-blue-500/30 flex items-center gap-2 disabled:opacity-50">
                {isProcessing ? "Processing..." : isAddOpen ? "Create Client" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================== */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-center p-8">
            <div className="mx-auto w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle size={40} />
            </div>
            <h2 className="text-2xl font-black text-mex-dark mb-2">Delete Client?</h2>
            <p className="text-gray-500 font-medium mb-8">
              Are you sure you want to permanently delete <strong className="text-mex-dark">{selectedUser?.email}</strong>? This action cannot be undone. Their past shipments will be kept for accounting purposes.
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleAction("delete")} disabled={isProcessing} className="w-full bg-red-500 text-white px-6 py-4 rounded-xl font-black hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-50">
                {isProcessing ? "Deleting..." : "Yes, Delete Client"}
              </button>
              <button onClick={() => setIsDeleteOpen(false)} className="w-full bg-gray-100 text-gray-600 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}