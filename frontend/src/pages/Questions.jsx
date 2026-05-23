import { Link } from "react-router-dom";

export default function Questions() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F9FAFB] px-4">
      <div className="w-full max-w-[480px] rounded-2xl bg-white p-6 text-center shadow-md">
        <p className="text-lg font-bold text-indigo-600">CareerLens</p>
        <h1 className="mt-4 text-2xl font-bold text-gray-800">Career Questions</h1>
        <p className="mt-2 text-sm text-gray-600">
          This section is coming soon. Your marks have been saved.
        </p>
        <Link
          to="/marks"
          className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          ← Back to marks entry
        </Link>
      </div>
    </div>
  );
}
