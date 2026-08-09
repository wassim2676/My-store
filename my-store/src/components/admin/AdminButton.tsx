"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

// 🎨 نمط موحّد لكل أزرار لوحة الأدمن — نفس تصميم صفحة "Products" الأصلية بالضبط
// أي زر جديد في أي صفحة أدمن (منتجات، مقالات، بائعون، مستخدمون...) يجب أن يستخدم هذا المكوّن
const variantClasses: Record<Variant, string> = {
  primary: "bg-sky-600 text-white hover:bg-sky-700 disabled:bg-sky-300",
  secondary:
    "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  ghost: "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
};

export default function AdminButton({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  disabled,
  children,
  className = "",
  ...props
}: AdminButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-lg font-medium transition-colors cursor-pointer disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
