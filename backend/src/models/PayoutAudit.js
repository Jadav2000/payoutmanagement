const mongoose = require("mongoose");
const { PAYOUT_ACTION } = require("../constants/payout");

const payoutAuditSchema = new mongoose.Schema(
  {
    payout_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payout", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: Object.values(PAYOUT_ACTION), required: true },
    note: { type: String, trim: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

module.exports = mongoose.model("PayoutAudit", payoutAuditSchema, "payout_audits");
