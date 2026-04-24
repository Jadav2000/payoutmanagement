/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/useAuth";

const emptyPayout = { vendor_id: "", amount: "", mode: "UPI", note: "" };

function PayoutListPage() {
  const [vendors, setVendors] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [filters, setFilters] = useState({ status: "", vendor_id: "" });
  const [form, setForm] = useState(emptyPayout);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const loadVendors = async () => {
    const { data } = await api.get("/vendors");
    setVendors(data);
  };

  const loadPayouts = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.vendor_id) params.vendor_id = filters.vendor_id;
      const { data } = await api.get("/payouts", { params });
      setPayouts(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payouts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors().catch(() => setError("Failed to load vendors."));
  }, []);

  useEffect(() => {
    loadPayouts();
  }, [filters.status, filters.vendor_id]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await api.post("/payouts", { ...form, amount: Number(form.amount) });
      setForm(emptyPayout);
      await loadPayouts();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create payout.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="ui-card">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Payout List</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {payouts.length} records
          </span>
        </div>
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
              className="ui-input py-2"
            >
              <option value="">All</option>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Vendor</label>
            <select
              value={filters.vendor_id}
              onChange={(e) => setFilters((p) => ({ ...p, vendor_id: e.target.value }))}
              className="ui-input py-2"
            >
              <option value="">All</option>
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <p className="text-sm opacity-70">Loading payouts...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="ui-table min-w-full">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="py-3 pr-3 font-medium">Vendor</th>
                  <th className="py-3 pr-3 font-medium">Amount</th>
                  <th className="py-3 pr-3 font-medium">Mode</th>
                  <th className="py-3 pr-3 font-medium">Status</th>
                  <th className="py-3 pr-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout._id} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                    <td className="font-medium text-slate-800">{payout.vendor_id?.name || "-"}</td>
                    <td>INR {payout.amount}</td>
                    <td>{payout.mode}</td>
                    <td className="py-3 pr-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          payout.status === "Approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : payout.status === "Rejected"
                              ? "bg-rose-100 text-rose-700"
                              : payout.status === "Submitted"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      <Link className="font-medium text-indigo-600 hover:underline" to={`/payouts/${payout._id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!payouts.length && <p className="py-3 text-sm opacity-70">No payouts found.</p>}
          </div>
        )}
      </section>

      {user?.role === "OPS" && (
        <section className="ui-card">
          <h2 className="mb-2 text-lg font-semibold text-slate-900">Create Payout (Draft)</h2>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleCreate}>
            <select
              className="ui-input"
              value={form.vendor_id}
              onChange={(e) => setForm((p) => ({ ...p, vendor_id: e.target.value }))}
              required
            >
              <option value="">Select Vendor *</option>
              {vendors.map((vendor) => (
                <option key={vendor._id} value={vendor._id}>
                  {vendor.name}
                </option>
              ))}
            </select>
            <input
              className="ui-input"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Amount *"
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              required
            />
            <select
              className="ui-input"
              value={form.mode}
              onChange={(e) => setForm((p) => ({ ...p, mode: e.target.value }))}
            >
              <option value="UPI">UPI</option>
              <option value="IMPS">IMPS</option>
              <option value="NEFT">NEFT</option>
            </select>
            <input
              className="ui-input"
              placeholder="Note"
              value={form.note}
              onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
            />
            <button
              disabled={submitting}
              className="ui-btn-primary"
            >
              {submitting ? "Saving..." : "Create Draft"}
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

export default PayoutListPage;
