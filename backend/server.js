require("dotenv").config();

const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const marks = require("./routes/marks");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/marks", marks);
app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`CareerLens API running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use.\n` +
        `Run "npm run dev" again (it frees the port automatically), or stop Docker backend (uses host port 8001).`
    );
    process.exit(1);
  }
  throw err;
});
