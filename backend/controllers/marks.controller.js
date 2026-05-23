const { supabase } = require("../config/supabase");

async function saveMarks(req, res) {
  const { student_id, exam_term, subjects } = req.body;

  if (!student_id || String(student_id).trim() === "") {
    return res.status(400).json({
      success: false,
      error: "student_id is required",
    });
  }

  if (!exam_term || String(exam_term).trim() === "") {
    return res.status(400).json({
      success: false,
      error: "exam_term is required",
    });
  }

  if (!Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({
      success: false,
      error: "subjects must be a non-empty array",
    });
  }

  const rows = subjects.map((item) => ({
    student_id,
    exam_term: String(exam_term).trim(),
    subject: item.subject,
    marks: item.marks,
    total_marks: item.total_marks,
  }));

  const { error } = await supabase.from("marks").insert(rows);

  if (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }

  return res.status(201).json({
    success: true,
    message: "Marks saved",
  });
}

module.exports = { saveMarks };
