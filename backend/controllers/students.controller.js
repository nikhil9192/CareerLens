const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../config/supabase");

const REQUIRED_FIELDS = [
  "name",
  "class_grade",
  "school_name",
  "mobile",
  "gender",
  "medium",
  "password",
];

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

async function createStudent(req, res) {
  const missing = REQUIRED_FIELDS.filter(
    (field) => !req.body[field] || String(req.body[field]).trim() === ""
  );

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }

  const { name, class_grade, school_name, mobile, gender, medium, password } =
    req.body;

  if (String(password).length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters",
    });
  }

  if (req.body.confirm_password && password !== req.body.confirm_password) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
    });
  }

  const passwordHash = await bcrypt.hash(String(password), 10);

  const { data, error } = await supabase
    .from("students")
    .insert({
      name: String(name).trim(),
      class_grade: String(class_grade).trim(),
      school_name: String(school_name).trim(),
      mobile: String(mobile).trim(),
      gender: String(gender).trim(),
      medium: String(medium).trim(),
      password_hash: passwordHash,
    })
    .select("id, name, class_grade, school_name, mobile, gender, medium, created_at")
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  const token = signToken(data.id);

  return res.status(201).json({
    success: true,
    student: data,
    token,
  });
}

module.exports = { createStudent };
