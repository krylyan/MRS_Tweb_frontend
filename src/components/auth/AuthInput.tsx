import { useState, type ChangeEventHandler, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  label?: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  error?: string;
  showPasswordToggle?: boolean;
}

export default function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  showPasswordToggle = false,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle && showPassword ? "text" : type;

  return (
    <div>
      {label ? (
        <label className="mb-2 block text-xs font-semibold text-gray-300">{label}</label>
      ) : null}

      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`h-12 w-full rounded-xl border bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all duration-300 placeholder:font-normal placeholder:text-gray-400/70 focus:border-emerald-500/50 focus:outline-none focus:shadow-[0_0_20px_rgba(16,185,129,0.2)] ${
            error
              ? "border-red-500/50 focus:border-red-500/50 focus:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
              : "border-white/10"
          }`}
          {...props}
        />

        {showPasswordToggle ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-gray-400 transition-colors duration-200 hover:text-white"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        ) : null}
      </div>

      {error ? <p className="mt-2 text-xs text-white/90">{error}</p> : null}
    </div>
  );
}

