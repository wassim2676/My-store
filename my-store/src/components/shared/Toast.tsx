"use client";

import { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ message, type, onClose }: { message: string; type: "success" | "error" | "info"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { bg: "bg-emerald-500", border: "border-emerald-600", icon: CheckCircle },
    error: { bg: "bg-red-500", border: "border-red-600", icon: AlertCircle },
    info: { bg: "bg-blue-500", border: "border-blue-600", icon: Info },
  };

  const { bg, border, icon: Icon } = config[type];

  return (
    <div className={`fixed top-20 end-4 z-[100] ${bg} ${border} border text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300 max-w-sm`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}