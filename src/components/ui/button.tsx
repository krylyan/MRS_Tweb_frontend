import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function Button({ className = "", type = "button", ...props }: ButtonProps) {
  return <button type={type} className={className} {...props} />;
}

