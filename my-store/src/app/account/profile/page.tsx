"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { User, Mail, Phone, Save } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: session?.user?.firstName || "",
    lastName: session?.user?.lastName || "",
    phone: session?.user?.phone || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // هنا سيتم ربط API التحديث لاحقاً
      // await fetch("/api/users/profile", { ... })
      
      await update(formData); // تحديث الجلسة محلياً للعرض
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الملف الشخصي</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">إدارة معلوماتك الشخصية</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm space-y-5">
        {success && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
            تم تحديث البيانات بنجاح ✅
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">الاسم الأول</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اسم العائلة</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500">لا يمكن تغيير البريد الإلكتروني</p>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium hover:from-sky-600 hover:to-blue-700 disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
          </button>
        </div>
      </form>
    </div>
  );
}