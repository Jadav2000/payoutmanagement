const express = require("express");
const { body, param, query } = require("express-validator");
const {
  approvePayout,
  createPayout,
  getPayoutById,
  getPayouts,
  rejectPayout,
  submitPayout,
} = require("../controllers/payoutController");
const { PAYOUT_MODE, PAYOUT_STATUS } = require("../constants/payout");
const ROLES = require("../constants/roles");
const { authorize, protect } = require("../middleware/auth");
const validate = require("../middleware/validate");

const router = express.Router();
router.use(protect);

router.get(
  "/",
  [
    query("status")
      .optional()
      .isIn(Object.values(PAYOUT_STATUS))
      .withMessage("status filter is invalid."),
    query("vendor_id").optional().isMongoId().withMessage("vendor_id must be valid."),
    validate,
  ],
  getPayouts
);

router.post(
  "/",
  [
    authorize(ROLES.OPS),
    body("vendor_id").isMongoId().withMessage("vendor_id is required."),
    body("amount").isFloat({ gt: 0 }).withMessage("amount must be greater than 0."),
    body("mode").isIn(Object.values(PAYOUT_MODE)).withMessage("mode is invalid."),
    body("note").optional().isString().withMessage("note must be text."),
    validate,
  ],
  createPayout
);

router.get("/:id", [param("id").isMongoId().withMessage("Invalid payout id."), validate], getPayoutById);
router.post(
  "/:id/submit",
  [authorize(ROLES.OPS), param("id").isMongoId().withMessage("Invalid payout id."), validate],
  submitPayout
);
router.post(
  "/:id/approve",
  [authorize(ROLES.FINANCE), param("id").isMongoId().withMessage("Invalid payout id."), validate],
  approvePayout
);
router.post(
  "/:id/reject",
  [
    authorize(ROLES.FINANCE),
    param("id").isMongoId().withMessage("Invalid payout id."),
    body("decision_reason").trim().notEmpty().withMessage("decision_reason is required."),
    validate,
  ],
  rejectPayout
);

module.exports = router;
