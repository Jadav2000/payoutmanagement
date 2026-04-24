/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/useAuth";

const emptyVendor = { name: "", upi_id: "", bank_account: "", ifsc: "", is_active: true };

function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(emptyVendor);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const loadVendors = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/vendors");
      setVendors(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/vendors", form);
      setForm(emptyVendor);
      await loadVendors();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create vendor.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="ui-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Vendor List</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {vendors.length} vendors
          </span>
        </div>
        {loading ? (
          <p className="text-sm opacity-70">Loading vendors...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table min-w-full">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="py-3 pr-3 font-medium">Name</th>
                  <th className="py-3 pr-3 font-medium">UPI</th>
                  <th className="py-3 pr-3 font-medium">Bank Account</th>
                  <th className="py-3 pr-3 font-medium">IFSC</th>
                  <th className="py-3 pr-3 font-medium">Active</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                    <td className="font-medium text-slate-800">{vendor.name}</td>
                    <td>{vendor.upi_id || "-"}</td>
                    <td>{vendor.bank_account || "-"}</td>
                    <td>{vendor.ifsc || "-"}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          vendor.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {vendor.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!vendors.length && <p className="py-4 text-sm text-slate-600">No vendors found.</p>}
          </div>
        )}
      </section>

      {user?.role === "OPS" && (
        <section className="ui-card">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">Add Vendor</h2>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
            <input
              className="ui-input"
              placeholder="Name *"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
            <input
              className="ui-input"
              placeholder="UPI ID"
              value={form.upi_id}
              onChange={(e) => setForm((prev) => ({ ...prev, upi_id: e.target.value }))}
            />
            <input
              className="ui-input"
              placeholder="Bank Account"
              value={form.bank_account}
              onChange={(e) => setForm((prev) => ({ ...prev, bank_account: e.target.value }))}
            />
            <input
              className="ui-input"
              placeholder="IFSC"
              value={form.ifsc}
              onChange={(e) => setForm((prev) => ({ ...prev, ifsc: e.target.value }))}
            />
            <label className="flex cursor-pointer items-center justify-start gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              <span className="text-sm text-slate-700">Is Active</span>
            </label>
            <button
              disabled={submitting}
              className="ui-btn-primary"
            >
              {submitting ? "Saving..." : "Create Vendor"}
            </button>
          </form>
        </section>
      )}
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}

export default VendorsPage;
