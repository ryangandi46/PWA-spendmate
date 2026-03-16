"use client";

import { useEffect, useState } from "react";
import { formatNumber, parseRawValue } from "@/lib/utils";

interface CurrencyInputProps {
  label?: string;
  value?: number;
  onChange: (value: number) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export default function CurrencyInput({
  label,
  value,
  onChange,
  error,
  placeholder = "0",
  className = "",
  autoFocus = false,
}: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const formatted = value === 0 ? "" : formatNumber(value);
      if (parseRawValue(displayValue) !== value) {
        setDisplayValue(formatted);
      }
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numeric = parseRawValue(raw);
    
    // Prevent excessive numbers
    if (numeric > 1000000000000) return; 

    setDisplayValue(numeric === 0 ? "" : formatNumber(numeric));
    onChange(numeric);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
        </label>
      )}
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
          Rp
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full pl-11 pr-4 py-3 bg-secondary rounded-xl border-0 text-foreground text-lg font-semibold placeholder:text-muted focus:ring-2 focus:ring-primary outline-none transition-all ${
            error ? "ring-2 ring-danger" : ""
          }`}
        />
      </div>
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}
