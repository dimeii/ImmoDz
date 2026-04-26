interface Props {
  size?: "sm" | "md" | "lg";
  withLabel?: boolean;
  className?: string;
}

export default function VerifiedBadge({
  size = "md",
  withLabel = true,
  className = "",
}: Props) {
  const dim = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" }[size];
  const text = { sm: "text-[10px]", md: "text-xs", lg: "text-sm" }[size];

  if (!withLabel) {
    return (
      <span
        title="Agence vérifiée"
        className={`inline-flex items-center justify-center rounded-full bg-emerald-600 text-white ${dim} ${className}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          className="w-2/3 h-2/3"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 font-semibold ${text} ${className}`}
      title="Cette agence a été vérifiée par ImmoDz"
    >
      <svg
        className={dim}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M12 2l2.39 2.89L18 5.14l.86 3.61L21.36 11 18.86 13.25 18 16.86l-3.61.25L12 20l-2.39-2.89L6 16.86l-.86-3.61L2.64 11 5.14 8.75 6 5.14l3.61-.25L12 2zm4.3 6.7l-5.3 5.3-2.3-2.3-1.4 1.4 3.7 3.7 6.7-6.7-1.4-1.4z"
          clipRule="evenodd"
        />
      </svg>
      Vérifiée
    </span>
  );
}
