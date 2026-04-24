/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/useAuth";

function PayoutDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [payout, setPayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

  const loadPayout = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/payouts/${id}`);
      setPayout(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load payout.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayout();
  }, [id]);

  const runAction = async (endpoint, body) => {
    setActionLoading(true);
    setError("");
    try {
      const { data } = await api.post(endpoint, body);
      setPayout(data);
      setRejectReason("");
    } catch (err) {
      setError(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const isOps = user?.role === "OPS";
  const isFinance = user?.role === "FINANCE";
  const canSubmit = isOps && payout?.status === "Draft";
  const canApproveOrReject = isFinance && payout?.status === "Submitted";

  if (loading) return <p className="text-sm text-slate-600">Loading payout detail...</p>;
  if (!payout) return <p className="text-sm text-red-600">{error || "Payout not found."}</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Payout Detail</h2>
        <Link to="/payouts" className="text-sm font-medium text-indigo-600 hover:underline">
          Back to list
        </Link>
      </div>

      <section className="ui-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Overview</h3>
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
        </div>
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <p className="rounded-lg bg-slate-50 px-3 py-2">
            <strong>Vendor:</strong> {payout.vendor_id?.name}
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2">
            <strong>Amount:</strong> INR {payout.amount}
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2">
            <strong>Mode:</strong> {payout.mode}
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2">
            <strong>Status:</strong> {payout.status}
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2 md:col-span-2">
            <strong>Note:</strong> {payout.note || "-"}
          </p>
          <p className="rounded-lg bg-slate-50 px-3 py-2 md:col-span-2">
            <strong>Decision Reason:</strong> {payout.decision_reason || "-"}
          </p>
        </div>
      </section>

      {(canSubmit || canApproveOrReject) && (
        <section className="ui-card">
          <h3 className="mb-3 font-semibold text-slate-900">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {canSubmit && (
              <button
                disabled={actionLoading}
                onClick={() => runAction(`/payouts/${id}/submit`)}
                className="ui-btn-primary px-3 py-2"
              >
                Submit
              </button>
            )}
            {canApproveOrReject && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() => runAction(`/payouts/${id}/approve`)}
                  className="ui-btn-success"
                >
                  Approve
                </button>
                <input
                  className="ui-input"
                  placeholder="Reject reason *"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
                <button
                  disabled={actionLoading || !rejectReason.trim()}
                  onClick={() =>
                    runAction(`/payouts/${id}/reject`, { decision_reason: rejectReason.trim() })
                  }
                  className="ui-btn-danger"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </section>
      )}

      <section className="ui-card">
        <h3 className="mb-1 font-semibold text-slate-900">Audit Trail</h3>
        <ul className="space-y-2 text-sm">
          {payout.audit_logs?.map((log, index) => (
            <li key={`${log.timestamp}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                <strong>{log.action}</strong>
                <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-slate-600">By {log.user?.email || "Unknown"}</p>
              {log.note ? <p className="mt-1 text-slate-600">Reason: {log.note}</p> : null}
            </li>
          ))}
          {!payout.audit_logs?.length && <li className="text-slate-600">No audit logs yet.</li>}
        </ul>
      </section>
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}

export default PayoutDetailPage;
