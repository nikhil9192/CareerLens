const express = require("express");
const { createStudent } = require("../controllers/students.controller");

const router = express.Router();

router.post("/", createStudent);

module.exports = router;
