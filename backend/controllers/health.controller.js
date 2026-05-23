const { supabase } = require("../config/supabase");

async function getHealth(req, res) {
  try {
    const { error } = await supabase.from("students").select("*").limit(1);

    if (error) {
      return res.json({
        status: "ok",
        database: "error",
        message: error.message,
      });
    }

    return res.json({
      status: "ok",
      database: "connected",
    });
  } catch (err) {
    return res.json({
      status: "ok",
      database: "error",
      message: err.message,
    });
  }
}

module.exports = { getHealth };
