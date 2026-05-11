"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Bug,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ErrorType = "error" | "rejection" | "warning";

type CapturedError = {
  id: string;
  type: ErrorType;
  title: string;
  message: string;
  file?: string;
  line?: number;
  col?: number;
  stack?: string;
  timestamp: Date;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseFirstFrame(stack?: string): {
  file?: string;
  line?: number;
  col?: number;
} {
  if (!stack) return {};

  for (const raw of stack.split("\n").slice(1)) {
    const m =
      raw.match(/at .+? \((.+?):(\d+):(\d+)\)/) ||
      raw.match(/at (.+?):(\d+):(\d+)/);

    if (!m) continue;

    const [, src, l, c] = m;

    // Skip node_modules and Next.js internals
    if (
      src.includes("node_modules") ||
      src.includes("(node_modules") ||
      src.includes("<anonymous>") ||
      src.includes("webpack/runtime") ||
      src.includes("next/dist")
    )
      continue;

    return {
      file: src
        .replace(/^webpack-internal:\/\/\/\.\//, "")
        .replace(/^webpack-internal:\/\/\//, ""),
      line: +l,
      col: +c,
    };
  }

  return {};
}

// ── Config ────────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  error: {
    label: "Runtime Error",
    Icon: AlertCircle,
    iconColor: "text-red-500",
    iconBg: "bg-red-50 border-red-200",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
  },
  rejection: {
    label: "Unhandled Rejection",
    Icon: Bug,
    iconColor: "text-orange-500",
    iconBg: "bg-orange-50 border-orange-200",
    badge: "bg-orange-100 text-orange-700",
    dot: "bg-orange-500",
  },
  warning: {
    label: "Warning",
    Icon: AlertTriangle,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
  },
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function DevErrorOverlay() {
  const [errors, setErrors] = useState<CapturedError[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [stackOpen, setStackOpen] = useState(false);
  const suppressStyleRef = useRef<HTMLStyleElement | null>(null);

  // Suppress / restore the Next.js dev overlay while we have captured errors
  useEffect(() => {
    if (errors.length > 0) {
      if (!suppressStyleRef.current) {
        const s = document.createElement("style");
        s.id = "__lyrix-suppress-next";
        s.textContent = "nextjs-portal { display: none !important; }";
        document.head.appendChild(s);
        suppressStyleRef.current = s;
      }
    } else {
      suppressStyleRef.current?.remove();
      suppressStyleRef.current = null;
    }
  }, [errors.length]);

  const addError = useCallback(
    (entry: Omit<CapturedError, "id" | "timestamp">) => {
      const id = Math.random().toString(36).slice(2);
      setErrors((prev) =>
        [{ ...entry, id, timestamp: new Date() }, ...prev].slice(0, 20)
      );
      setIndex(0);
      setStackOpen(false);
      setIsOpen(true);
    },
    []
  );

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    // ── window runtime errors ──────────────────────────────────────────────
    const onError = (e: ErrorEvent) => {
      const { file, line, col } = parseFirstFrame(e.error?.stack);
      addError({
        type: "error",
        title: e.error?.name ?? "Runtime Error",
        message: e.message || "An unknown runtime error occurred.",
        file:
          file ??
          (e.filename
            ? e.filename.replace(location.origin + "/_next/", "")
            : undefined),
        line: line ?? e.lineno ?? undefined,
        col: col ?? e.colno ?? undefined,
        stack: e.error?.stack,
      });
    };

    // ── unhandled promise rejections ───────────────────────────────────────
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e.reason;
      const { file, line, col } = parseFirstFrame(r?.stack);
      addError({
        type: "rejection",
        title: r?.name ?? "Unhandled Promise Rejection",
        message: r?.message ?? String(r),
        file,
        line,
        col,
        stack: r?.stack,
      });
    };

    // ── console.error patch (React warnings + reconciler errors) ─────────
    const _orig = console.error.bind(console);
    console.error = (...args: unknown[]) => {
      _orig(...args);
      const msg = args
        .map((a) => (typeof a === "string" ? a : ""))
        .join(" ")
        .trim();

      if (msg.length < 20) return;
      if (
        msg.includes("Warning: ReactDOM.render") ||
        msg.includes("Warning: An update to") ||
        msg.includes("Download the React DevTools") ||
        msg.includes("You are running React in development")
      ) return;

      const isReactWarning = msg.startsWith("Warning:");
      // React 19 reconciler errors don't use "Warning:" prefix
      const isReconcilerError =
        !isReactWarning &&
        (msg.includes("can lead to") ||
          msg.includes("conflicting property") ||
          msg.includes("Updating a style") ||
          msg.includes("each child in a list") ||
          msg.includes("validateDOMNesting"));

      if (isReactWarning || isReconcilerError) {
        addError({
          type: isReactWarning ? "warning" : "error",
          title: isReactWarning ? "React Warning" : "React Error",
          message: msg.slice(0, 800),
        });
      }
    };

    window.addEventListener("error", onError, true);
    window.addEventListener("unhandledrejection", onRejection, true);

    return () => {
      window.removeEventListener("error", onError, true);
      window.removeEventListener("unhandledrejection", onRejection, true);
      console.error = _orig;
    };
  }, [addError]);

  // Navigate between captured errors
  const go = (dir: 1 | -1) => {
    setIndex((i) => Math.max(0, Math.min(errors.length - 1, i + dir)));
    setStackOpen(false);
  };

  const dismiss = () => {
    setErrors((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setIsOpen(false);
      setIndex((i) => Math.max(0, i - (i > 0 ? 1 : 0)));
      return next;
    });
  };

  const clearAll = () => {
    setErrors([]);
    setIsOpen(false);
  };

  // Nothing to show
  if (errors.length === 0) return null;

  const err = errors[index];
  const cfg = TYPE_CONFIG[err.type];

  return (
    <>
      {/* ── Minimized badge (modal closed but errors remain) ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
        >
          <span className={`size-2 rounded-full ${cfg.dot} shrink-0`} />
          {errors.length === 1
            ? "1 error — click to view"
            : `${errors.length} errors — click to view`}
        </button>
      )}

      {/* ── Full modal ── */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          {/* Dialog */}
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label={err.title}
            className="fixed left-1/2 top-1/2 z-[9999] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-gray-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className="flex h-12 items-center gap-2.5 border-b border-gray-100 px-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/Logo.png" alt="Lyrix" className="h-5 w-5 rounded" />
              <span className="text-sm font-semibold text-gray-800">Lyrix</span>
              <span className="text-sm text-gray-400">Dev Tools</span>

              {/* Error navigation */}
              {errors.length > 1 && (
                <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                  <button
                    onClick={() => go(-1)}
                    disabled={index === 0}
                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    ‹
                  </button>
                  <span className="tabular-nums">
                    {index + 1} / {errors.length}
                  </span>
                  <button
                    onClick={() => go(1)}
                    disabled={index === errors.length - 1}
                    className="flex h-6 w-6 items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                  >
                    ›
                  </button>
                </div>
              )}

              <button
                aria-label="Minimise"
                onClick={() => setIsOpen(false)}
                className={`flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 ${
                  errors.length <= 1 ? "ml-auto" : "ml-2"
                }`}
              >
                <X className="size-4" />
              </button>
            </div>

            {/* ── Body ── */}
            <div className="p-4">
              {/* Type icon + badge + title */}
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${cfg.iconBg}`}
                >
                  <cfg.Icon className={`size-4 ${cfg.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${cfg.badge}`}
                  >
                    {cfg.label}
                  </span>
                  <h2 className="mt-1.5 text-sm font-semibold leading-snug text-gray-900">
                    {err.title}
                  </h2>
                </div>
              </div>

              {/* Message */}
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-3">
                <p className="break-words font-mono text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">
                  {err.message}
                </p>
              </div>

              {/* Source location */}
              {(err.file || err.line != null) && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <code className="rounded bg-gray-100 px-2 py-1 font-mono text-[11px] text-gray-700">
                    {err.file}
                    {err.line != null ? `:${err.line}` : ""}
                    {err.col != null ? `:${err.col}` : ""}
                  </code>
                  <span className="text-[11px] text-gray-400">
                    — source location
                  </span>
                </div>
              )}

              {/* Stack trace (collapsible) */}
              {err.stack && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setStackOpen((v) => !v)}
                    className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:text-gray-700"
                  >
                    {stackOpen ? (
                      <ChevronUp className="size-3" />
                    ) : (
                      <ChevronDown className="size-3" />
                    )}
                    Stack trace
                  </button>
                  {stackOpen && (
                    <pre className="mt-2 max-h-44 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3 font-mono text-[10px] leading-5 text-gray-600 whitespace-pre break-all">
                      {err.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>

            {/* ── Footer ── */}
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5">
              <span className="font-mono text-[10px] text-gray-400">
                {err.timestamp.toLocaleTimeString()}
              </span>
              <div className="flex gap-2">
                {errors.length > 1 && (
                  <button
                    onClick={clearAll}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                  >
                    Clear all ({errors.length})
                  </button>
                )}
                <button
                  onClick={dismiss}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
