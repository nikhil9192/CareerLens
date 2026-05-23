import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <h1 className="text-3xl font-bold text-slate-800 sm:text-4xl">
        CareerLens - Student Career Guidance
      </h1>
      <p className="mt-3 max-w-md text-center text-slate-600">
        Discover your path with personalized career guidance.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/register"
          className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Register as Student
        </Link>
        <Link
          to="/marks"
          className="rounded-lg border border-indigo-600 px-6 py-3 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
        >
          Enter Marks
        </Link>
      </div>
    </div>
  );
}
