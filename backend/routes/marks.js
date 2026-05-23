const express = require("express");
const { saveMarks } = require("../controllers/marks.controller");

const router = express.Router();

router.post("/", saveMarks);

module.exports = router;
