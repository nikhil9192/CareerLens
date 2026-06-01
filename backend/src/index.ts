import dotenv from "dotenv";
dotenv.config();
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import analyticsRoutes from "./routes/analytics";
import marksRoutes from "./routes/marks";
import studentsRoutes from "./routes/students";
import authRoutes from "./routes/auth";
import schoolsRoutes from "./routes/schools";
import careerRoutes from "./routes/career";
import { AppError } from "./lib/errors";

const app = express();
const PORT = Number(process.env.PORT) || 8000;

const productionOrigins = [
  "https://career-lens-ivory.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

const devOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (productionOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== "production" && devOriginPattern.test(origin)) {
    return true;
  }
  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/analytics", analyticsRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/schools", schoolsRoutes);
app.use("/api/career", careerRoutes);

app.use((_req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${_req.method} ${_req.originalUrl} does not exist`,
  });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`CareerLens API running on http://localhost:${PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use.\n` +
        `Run "npm run dev" again (it frees the port automatically), or stop Docker backend (uses host port 8001).`
    );
    process.exit(1);
  }
  throw err;
});

export default app;
