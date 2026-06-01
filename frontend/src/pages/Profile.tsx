import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMe } from "../services/auth.api";
import { getStudentName, logout } from "../services/auth";

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState(getStudentName() ?? "Student");
  const [email, setEmail] = useState("");
  const [classGrade, setClassGrade] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMe()
      .then((data) => {
        const profile = data as {
          name?: string;
          email?: string;
          class_grade?: string;
        };
        if (profile.name) setName(profile.name);
        if (profile.email) setEmail(profile.email);
        if (profile.class_grade) setClassGrade(profile.class_grade);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] px-4 py-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Profile</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Your account details
        </p>

        <div className="card mt-6 p-6 shadow-sm">
          {loading ? (
            <div className="space-y-3">
              <div className="skeleton-bone h-5 w-40" />
              <div className="skeleton-bone h-4 w-56" />
              <div className="skeleton-bone h-4 w-32" />
            </div>
          ) : (
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="font-medium text-[var(--color-text-muted)]">Name</dt>
                <dd className="mt-1 text-lg font-semibold text-[var(--color-text)]">
                  {name}
                </dd>
              </div>
              {email && (
                <div>
                  <dt className="font-medium text-[var(--color-text-muted)]">Email</dt>
                  <dd className="mt-1 text-[var(--color-text)]">{email}</dd>
                </div>
              )}
              {classGrade && (
                <div>
                  <dt className="font-medium text-[var(--color-text-muted)]">Class</dt>
                  <dd className="mt-1 text-[var(--color-text)]">{classGrade}</dd>
                </div>
              )}
            </dl>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 w-full rounded-xl border border-[var(--color-fail)] py-3 font-semibold text-[var(--color-fail)] transition hover:bg-[var(--color-error-bg)] md:hidden"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
}
