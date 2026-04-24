const mongoose = require("mongoose");
const Payout = require("../models/Payout");
const PayoutAudit = require("../models/PayoutAudit");
const Vendor = require("../models/Vendor");
const asyncHandler = require("../utils/asyncHandler");
const { PAYOUT_ACTION, PAYOUT_STATUS } = require("../constants/payout");

const enrichPayoutQuery = (filter = {}) =>
  Payout.find(filter)
    .populate("vendor_id", "name upi_id bank_account ifsc is_active")
    .populate("created_by", "email role");

const withAuditLogs = async (payoutDoc) => {
  if (!payoutDoc) return payoutDoc;

  const payout = payoutDoc.toObject ? payoutDoc.toObject() : payoutDoc;
  const auditLogs = await PayoutAudit.find({ payout_id: payout._id })
    .sort({ timestamp: 1 })
    .populate("user", "email role")
    .lean();

  payout.audit_logs = auditLogs;
  return payout;
};

const getPayouts = asyncHandler(async (req, res) => {
  const { status, vendor_id } = req.query;
  const filter = {};

  if (status) filter.status = status;
  if (vendor_id && mongoose.Types.ObjectId.isValid(vendor_id)) filter.vendor_id = vendor_id;

  const payouts = await enrichPayoutQuery(filter).sort({ createdAt: -1 });
  res.json(payouts);
});

const getPayoutById = asyncHandler(async (req, res) => {
  const payout = await enrichPayoutQuery().findById(req.params.id);
  if (!payout) {
    const error = new Error("Payout not found.");
    error.statusCode = 404;
    throw error;
  }
  res.json(await withAuditLogs(payout));
});

const createPayout = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findById(req.body.vendor_id);
  if (!vendor) {
    const error = new Error("Vendor not found.");
    error.statusCode = 404;
    throw error;
  }

  const payout = await Payout.create({
    ...req.body,
    status: PAYOUT_STATUS.DRAFT,
    created_by: req.user._id,
  });
  await PayoutAudit.create({ payout_id: payout._id, user: req.user._id, action: PAYOUT_ACTION.CREATED });

  const populated = await enrichPayoutQuery().findById(payout._id);
  res.status(201).json(await withAuditLogs(populated));
});

const submitPayout = asyncHandler(async (req, res) => {
  const payout = await Payout.findById(req.params.id);
  if (!payout) {
    const error = new Error("Payout not found.");
    error.statusCode = 404;
    throw error;
  }
  if (String(payout.created_by) !== String(req.user._id)) {
    const error = new Error("Only creator can submit this payout.");
    error.statusCode = 403;
    throw error;
  }
  if (payout.status !== PAYOUT_STATUS.DRAFT) {
    const error = new Error("Only Draft payouts can be submitted.");
    error.statusCode = 400;
    throw error;
  }

  payout.status = PAYOUT_STATUS.SUBMITTED;
  await payout.save();
  await PayoutAudit.create({ payout_id: payout._id, user: req.user._id, action: PAYOUT_ACTION.SUBMITTED });

  const populated = await enrichPayoutQuery().findById(payout._id);
  res.json(await withAuditLogs(populated));
});

const approvePayout = asyncHandler(async (req, res) => {
  const payout = await Payout.findById(req.params.id);
  if (!payout) {
    const error = new Error("Payout not found.");
    error.statusCode = 404;
    throw error;
  }
  if (payout.status !== PAYOUT_STATUS.SUBMITTED) {
    const error = new Error("Only Submitted payouts can be approved.");
    error.statusCode = 400;
    throw error;
  }

  payout.status = PAYOUT_STATUS.APPROVED;
  payout.decision_reason = undefined;
  await payout.save();
  await PayoutAudit.create({ payout_id: payout._id, user: req.user._id, action: PAYOUT_ACTION.APPROVED });

  const populated = await enrichPayoutQuery().findById(payout._id);
  res.json(await withAuditLogs(populated));
});

const rejectPayout = asyncHandler(async (req, res) => {
  const payout = await Payout.findById(req.params.id);
  if (!payout) {
    const error = new Error("Payout not found.");
    error.statusCode = 404;
    throw error;
  }
  if (payout.status !== PAYOUT_STATUS.SUBMITTED) {
    const error = new Error("Only Submitted payouts can be rejected.");
    error.statusCode = 400;
    throw error;
  }

  payout.status = PAYOUT_STATUS.REJECTED;
  payout.decision_reason = req.body.decision_reason;
  await payout.save();
  await PayoutAudit.create({
    payout_id: payout._id,
    user: req.user._id,
    action: PAYOUT_ACTION.REJECTED,
    note: req.body.decision_reason,
  });

  const populated = await enrichPayoutQuery().findById(payout._id);
  res.json(await withAuditLogs(populated));
});

module.exports = {
  getPayouts,
  getPayoutById,
  createPayout,
  submitPayout,
  approvePayout,
  rejectPayout,
};
