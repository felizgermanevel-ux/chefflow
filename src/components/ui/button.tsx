import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonProps) {
  const styles =
    variant === "primary"
      ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)]"
      : "border border-[var(--border)] bg-white text-[var(--foreground)] hover:bg-stone-50";

  return (
    <button
      className={`min-h-12 rounded-xl px-5 py-3 font-semibold transition-colors ${styles} ${className}`}
      {...props}
    />
  );
}
