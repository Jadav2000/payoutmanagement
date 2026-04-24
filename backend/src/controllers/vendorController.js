const Vendor = require("../models/Vendor");
const asyncHandler = require("../utils/asyncHandler");

const getVendors = asyncHandler(async (_req, res) => {
  const vendors = await Vendor.find().sort({ createdAt: -1 });
  res.json(vendors);
});

const createVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.create(req.body);
  res.status(201).json(vendor);
});

module.exports = { getVendors, createVendor };
