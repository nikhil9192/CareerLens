const { supabase } = require("../config/supabase");

const REQUIRED_FIELDS = [
  "name",
  "class_grade",
  "school_name",
  "mobile",
  "gender",
  "medium",
];

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

  const { name, class_grade, school_name, mobile, gender, medium } = req.body;

  const { data, error } = await supabase
    .from("students")
    .insert({
      name: String(name).trim(),
      class_grade: String(class_grade).trim(),
      school_name: String(school_name).trim(),
      mobile: String(mobile).trim(),
      gender: String(gender).trim(),
      medium: String(medium).trim(),
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }

  return res.status(201).json({
    success: true,
    student: data,
  });
}

module.exports = { createStudent };
