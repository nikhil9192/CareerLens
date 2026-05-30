function ErrorCard({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-lg p-3 text-sm text-[var(--color-fail)]"
      style={{ backgroundColor: "var(--color-error-bg)" }}
    >
      {message}
    </div>
  );
}

export default ErrorCard;
