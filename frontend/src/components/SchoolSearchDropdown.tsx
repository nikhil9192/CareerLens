import { useState, useRef, useEffect, useMemo } from "react";
import type { School } from "../types/school";
import { formatSchoolLabel } from "../types/school";
import { fieldClass, labelClass } from "./PasswordInput";

interface SchoolSearchDropdownProps {
  schools: School[];
  value: string;
  onChange: (schoolId: string) => void;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
}

export default function SchoolSearchDropdown({
  schools,
  value,
  onChange,
  loading = false,
  disabled = false,
  error,
}: SchoolSearchDropdownProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = schools.find((s) => s.id === value);

  useEffect(() => {
    if (selected) {
      setQuery(formatSchoolLabel(selected));
    }
  }, [selected]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || (selected && query === formatSchoolLabel(selected))) {
      return schools;
    }
    return schools.filter((school) => {
      const label = formatSchoolLabel(school).toLowerCase();
      return (
        label.includes(q) ||
        school.name.toLowerCase().includes(q) ||
        school.city.toLowerCase().includes(q) ||
        school.state.toLowerCase().includes(q)
      );
    });
  }, [schools, query, selected]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        if (selected) setQuery(formatSchoolLabel(selected));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected]);

  function handleSelect(school: School) {
    onChange(school.id);
    setQuery(formatSchoolLabel(school));
    setOpen(false);
  }

  function handleInputChange(text: string) {
    setQuery(text);
    setOpen(true);
    if (selected && text !== formatSchoolLabel(selected)) {
      onChange("");
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor="school-search" className={labelClass}>
        School
      </label>
      <input
        id="school-search"
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => setOpen(true)}
        disabled={disabled || loading}
        placeholder={
          loading ? "Loading schools..." : "Search your school..."
        }
        autoComplete="off"
        className={`${fieldClass} ${error ? "border-[var(--color-fail)]" : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        role="combobox"
      />

      {open && !loading && !disabled && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-md"
        >
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-[var(--color-text-muted)]">
              No schools found
            </li>
          ) : (
            filtered.map((school) => (
              <li key={school.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={school.id === value}
                  onClick={() => handleSelect(school)}
                  className={`w-full px-4 py-3 text-left text-sm transition hover:bg-[var(--color-bg)] ${
                    school.id === value
                      ? "bg-[var(--color-bg)] font-medium text-[var(--color-brand)]"
                      : "text-[var(--color-text)]"
                  }`}
                >
                  {formatSchoolLabel(school)}
                </button>
              </li>
            ))
          )}
        </ul>
      )}

      {error && (
        <p className="mt-1 text-sm text-[var(--color-fail)]">{error}</p>
      )}
    </div>
  );
}
