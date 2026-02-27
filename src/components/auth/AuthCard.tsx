import { useEffect, useState, type ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  titleColor?: "white" | "emerald";
}

export default function AuthCard({
  children,
  title,
  titleColor = "white",
}: AuthCardProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const titleColorClass = titleColor === "emerald" ? "text-emerald-400" : "text-white";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6">
      <div
        className={`w-full max-w-[440px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          isLoaded ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.98] opacity-0"
        }`}
      >
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <h1 className={`text-2xl font-bold ${titleColorClass}`}>{title}</h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

