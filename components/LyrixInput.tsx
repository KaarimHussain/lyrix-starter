"use client";

import * as React from "react";
import { Eye, EyeOff, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type InputVariant = "default" | "search" | "password";
type InputSize = "sm" | "md" | "lg";

interface LyrixInputProps extends Omit<React.ComponentProps<"input">, "size"> {
  variant?: InputVariant;
  inputSize?: InputSize;
  label?: React.ReactNode;
  hint?: string;
  error?: string;
  success?: string;
  clearable?: boolean;
  onClear?: () => void;
  containerClassName?: string;
}

const sizeMap: Record<InputSize, string> = {
  sm: "h-8 text-xs px-3",
  md: "h-11 text-sm px-4",
  lg: "h-13 text-base px-5",
};

export default function LyrixInput({
  variant = "default",
  inputSize = "md",
  label,
  hint,
  error,
  success,
  clearable,
  onClear,
  className,
  containerClassName,
  id,
  value,
  onChange,
  ...props
}: LyrixInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  const isPassword = variant === "password";
  const isSearch = variant === "search";

  const inputType = isPassword
    ? showPassword
      ? "text"
      : "password"
    : isSearch
      ? "search"
      : props.type ?? "text";

  const hasLeftIcon = isSearch;
  const hasRightSlot = isPassword || (clearable && value);

  const stateClass = error
    ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30"
    : success
      ? "border-primary focus-visible:border-primary focus-visible:ring-primary/30"
      : "focus-visible:border-primary focus-visible:ring-primary/30";

  return (
    <div className={cn("flex w-full flex-col gap-1.5", containerClassName)}>
      {label && (
        <Label htmlFor={inputId} className="text-sm font-medium text-foreground">
          {label}
          {props.required && <span className="ml-1 text-destructive">*</span>}
        </Label>
      )}

      <div className="relative flex items-center">
        {isSearch && (
          <Search className="pointer-events-none absolute left-3 z-10 size-4 text-muted-foreground" />
        )}

        <Input
          {...props}
          id={inputId}
          type={inputType}
          value={value}
          onChange={onChange}
          className={cn(
            sizeMap[inputSize],
            stateClass,
            "bg-background transition-all duration-150 [&::-webkit-search-cancel-button]:hidden",
            hasLeftIcon && "pl-9",
            hasRightSlot && "pr-10",
            className
          )}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-3 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}

        {clearable && value && !isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onClear}
            className="absolute right-3 text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Clear input"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {(hint || error || success) && (
        <p
          className={cn("text-xs font-mono", {
            "text-destructive": error,
            "text-primary": success,
            "text-muted-foreground": hint && !error && !success,
          })}
        >
          {error ?? success ?? hint}
        </p>
      )}
    </div>
  );
}
