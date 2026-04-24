const mongoose = require("mongoose");
const { PAYOUT_MODE, PAYOUT_STATUS } = require("../constants/payout");

const payoutSchema = new mongoose.Schema(
  {
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    mode: { type: String, enum: Object.values(PAYOUT_MODE), required: true },
    note: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(PAYOUT_STATUS),
      default: PAYOUT_STATUS.DRAFT,
    },
    decision_reason: { type: String, trim: true },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payout", payoutSchema);
