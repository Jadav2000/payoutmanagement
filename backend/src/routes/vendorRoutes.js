const express = require("express");
const { body } = require("express-validator");
const { createVendor, getVendors } = require("../controllers/vendorController");
const { authorize, protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const ROLES = require("../constants/roles");

const router = express.Router();

router.use(protect);

router.get("/", getVendors);
router.post(
  "/",
  [
    authorize(ROLES.OPS),
    body("name").trim().notEmpty().withMessage("Vendor name is required."),
    body("is_active").optional().isBoolean().withMessage("is_active must be boolean."),
    validate,
  ],
  createVendor
);

module.exports = router;
