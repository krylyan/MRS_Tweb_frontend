import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Card({ className = "", ...props }: CardProps) {
  return <div className={className} {...props} />;
}

