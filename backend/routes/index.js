const express = require("express");
const healthRoutes = require("./health.routes");
const studentsRoutes = require("./students");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/students", studentsRoutes);

module.exports = router;
