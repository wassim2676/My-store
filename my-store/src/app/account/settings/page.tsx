"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Bell, Lock, Trash2, Save, Check, AlertCircle, Loader2, X } from "lucide-react";

// ==================== 🔤 الترجمات الشاملة ====================
type Language = "ar" | "fr" | "en";

const translations: Record<Language, any> = {
  ar: {
    title: "الإعدادات",
    subtitle: "إدارة الأمان والتفضيلات",
    
    // 🔔 الإشعارات
    notifications: {
      title: "الإشعارات",
      desc: "تحكم في كيفية استلامك للتحديثات",
      email: { label: "إشعارات البريد الإلكتروني", desc: "تفاصيل الطلبات والفواتير" },
      sms: { label: "رسائل SMS", desc: "حالة الشحن والتوصيل" },
      orders: { label: "تحديثات الطلبات", desc: "تغييرات الحالة والتتبع" },
      marketing: { label: "العروض والتخفيضات", desc: "كوبونات ومنتجات جديدة" },
      saving: "جاري الحفظ...",
      saved: "تم حفظ التفضيلات",
      error: "فشل حفظ التفضيلات",
    },
    
    // 🔐 كلمة المرور
    password: {
      title: "تغيير كلمة المرور",
      desc: "استخدم كلمة مرور قوية لحماية حسابك",
      current: "كلمة المرور الحالية",
      currentPlaceholder: "أدخل كلمة المرور الحالية",
      new: "كلمة المرور الجديدة",
      newPlaceholder: "أدخل كلمة المرور الجديدة",
      confirm: "تأكيد كلمة المرور",
      confirmPlaceholder: "أعد إدخال كلمة المرور الجديدة",
      requirements: "يجب أن تحتوي كلمة المرور على 6 أحرف على الأقل",
      update: "تحديث كلمة المرور",
      updating: "جاري التحديث...",
      success: "تم تغيير كلمة المرور بنجاح",
      errors: {
        required: "هذا الحقل مطلوب",
        currentRequired: "كلمة المرور الحالية مطلوبة",
        newRequired: "كلمة المرور الجديدة مطلوبة",
        confirmRequired: "يجب تأكيد كلمة المرور",
        mismatch: "كلمات المرور غير متطابقة",
        short: "كلمة المرور قصيرة جداً (6 أحرف كحد أدنى)",
        same: "كلمة المرور الجديدة يجب أن تختلف عن الحالية",
        incorrect: "كلمة المرور الحالية غير صحيحة",
        failed: "فشل تغيير كلمة المرور",
      },
    },
    
    // ⚠️ منطقة الخطر
    danger: {
      title: "منطقة الخطر",
      desc: "إجراءات لا يمكن التراجع عنها",
      deleteTitle: "حذف الحساب نهائياً",
      deleteDesc: "سيتم حذف جميع بياناتك بشكل دائم. هذا الإجراء لا يمكن التراجع عنه.",
      deleteConfirm: "اكتب \"حذف\" لتأكيد",
      deleteBtn: "حذف الحساب",
      deleting: "جاري الحذف...",
      cancel: "إلغاء",
      confirm: "تأكيد الحذف",
      error: "فشل حذف الحساب",
    },
    
    // 🔄 عام
    loading: "جاري التحميل...",
    retry: "إعادة المحاولة",
    close: "إغلاق",
  },
  fr: {
    title: "Paramètres",
    subtitle: "Gérez la sécurité et vos préférences",
    
    notifications: {
      title: "Notifications",
      desc: "Contrôlez comment vous recevez les mises à jour",
      email: { label: "Notifications par email", desc: "Détails des commandes et factures" },
      sms: { label: "Messages SMS", desc: "Statut d'expédition et livraison" },
      orders: { label: "Mises à jour des commandes", desc: "Changements de statut et suivi" },
      marketing: { label: "Offres et promotions", desc: "Coupons et nouveaux produits" },
      saving: "Enregistrement...",
      saved: "Préférences enregistrées",
      error: "Échec de l'enregistrement",
    },
    
    password: {
      title: "Changer le mot de passe",
      desc: "Utilisez un mot de passe fort pour protéger votre compte",
      current: "Mot de passe actuel",
      currentPlaceholder: "Entrez votre mot de passe actuel",
      new: "Nouveau mot de passe",
      newPlaceholder: "Entrez votre nouveau mot de passe",
      confirm: "Confirmer le mot de passe",
      confirmPlaceholder: "Répétez votre nouveau mot de passe",
      requirements: "Le mot de passe doit contenir au moins 6 caractères",
      update: "Mettre à jour",
      updating: "Mise à jour...",
      success: "Mot de passe changé avec succès",
      errors: {
        required: "Ce champ est requis",
        currentRequired: "Le mot de passe actuel est requis",
        newRequired: "Le nouveau mot de passe est requis",
        confirmRequired: "La confirmation est requise",
        mismatch: "Les mots de passe ne correspondent pas",
        short: "Mot de passe trop court (6 caractères minimum)",
        same: "Le nouveau mot de passe doit être différent",
        incorrect: "Mot de passe actuel incorrect",
        failed: "Échec du changement de mot de passe",
      },
    },
    
    danger: {
      title: "Zone de danger",
      desc: "Actions irréversibles",
      deleteTitle: "Supprimer le compte définitivement",
      deleteDesc: "Toutes vos données seront supprimées définitivement. Cette action est irréversible.",
      deleteConfirm: "Tapez \"supprimer\" pour confirmer",
      deleteBtn: "Supprimer le compte",
      deleting: "Suppression...",
      cancel: "Annuler",
      confirm: "Confirmer la suppression",
      error: "Échec de la suppression du compte",
    },
    
    loading: "Chargement...",
    retry: "Réessayer",
    close: "Fermer",
  },
  en: {
    title: "Settings",
    subtitle: "Manage security and preferences",
    
    notifications: {
      title: "Notifications",
      desc: "Control how you receive updates",
      email: { label: "Email Notifications", desc: "Order details and invoices" },
      sms: { label: "SMS Messages", desc: "Shipping status and delivery" },
      orders: { label: "Order Updates", desc: "Status changes and tracking" },
      marketing: { label: "Offers & Promotions", desc: "Coupons and new products" },
      saving: "Saving...",
      saved: "Preferences saved",
      error: "Failed to save preferences",
    },
    
    password: {
      title: "Change Password",
      desc: "Use a strong password to protect your account",
      current: "Current Password",
      currentPlaceholder: "Enter your current password",
      new: "New Password",
      newPlaceholder: "Enter your new password",
      confirm: "Confirm Password",
      confirmPlaceholder: "Re-enter your new password",
      requirements: "Password must be at least 6 characters",
      update: "Update Password",
      updating: "Updating...",
      success: "Password changed successfully",
      errors: {
        required: "This field is required",
        currentRequired: "Current password is required",
        newRequired: "New password is required",
        confirmRequired: "Confirmation is required",
        mismatch: "Passwords do not match",
        short: "Password too short (6 characters minimum)",
        same: "New password must be different",
        incorrect: "Current password is incorrect",
        failed: "Failed to change password",
      },
    },
    
    danger: {
      title: "Danger Zone",
      desc: "Irreversible actions",
      deleteTitle: "Delete Account Permanently",
      deleteDesc: "All your data will be permanently deleted. This action cannot be undone.",
      deleteConfirm: "Type \"delete\" to confirm",
      deleteBtn: "Delete Account",
      deleting: "Deleting...",
      cancel: "Cancel",
      confirm: "Confirm Deletion",
      error: "Failed to delete account",
    },
    
    loading: "Loading...",
    retry: "Retry",
    close: "Close",
  },
};

// ==================== 🎨 مكون Toggle Switch ====================
function ToggleSwitch({ 
  enabled, 
  onChange, 
  disabled,
  label 
}: { 
  enabled: boolean; 
  onChange: () => void; 
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
        enabled ? "bg-sky-500" : "bg-gray-300 dark:bg-gray-700"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        enabled ? "translate-x-6" : "translate-x-1"
      }`} />
    </button>
  );
}

// ==================== 🎨 مكون Toast Notification ====================
function Toast({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: "success" | "error" | "info"; 
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400",
    error: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400",
    info: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400",
  };

  const icons = {
    success: <Check className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    info: <Bell className="w-5 h-5" />,
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-right ${colors[type]}`}>
      {icons[type]}
      <p className="text-sm font-medium">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ==================== 🎨 مكون تأكيد الحذف (Modal) ====================
function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  t 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  t: any;
}) {
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleConfirm = async () => {
    if (confirmText.toLowerCase().trim() !== "حذف" && confirmText.toLowerCase().trim() !== "delete" && confirmText.toLowerCase().trim() !== "supprimer") {
      return;
    }
    setDeleting(true);
    await onConfirm();
    setDeleting(false);
    onClose();
    setConfirmText("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.danger.deleteTitle}</h3>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {t.danger.deleteDesc}
        </p>
        
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={t.danger.deleteConfirm}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4 cursor-text"
        />
        
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {t.danger.cancel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting || confirmText.toLowerCase().trim() !== "حذف" && confirmText.toLowerCase().trim() !== "delete" && confirmText.toLowerCase().trim() !== "supprimer"}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.danger.deleting}
              </>
            ) : (
              t.danger.confirm
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 🏠 المكون الرئيسي ====================
export default function SettingsPage() {
  const [lang, setLang] = useState<Language>("ar");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    orders: true,
    marketing: false,
  });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState({ notifications: false, password: false });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const t = translations[lang];

  // 🔹 تحميل اللغة
  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language;
    if (savedLang && ["ar", "fr", "en"].includes(savedLang)) {
      setLang(savedLang);
    }
  }, []);

  // 🔹 جلب تفضيلات الإشعارات (محاكاة)
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const response = await fetch("/api/users/notifications");
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setNotifications(result.data);
          }
        }
      } catch (err) {
        console.error("Fetch notifications error:", err);
      }
    };
    fetchPreferences();
  }, []);

  // 🔹 تحديث الإشعارات
  const updateNotifications = useCallback(async (key: string, value: boolean) => {
    const newPrefs = { ...notifications, [key]: value };
    setNotifications(newPrefs);
    setLoading(prev => ({ ...prev, notifications: true }));

    try {
      const response = await fetch("/api/users/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPrefs),
      });
      
      if (response.ok) {
        setToast({ message: t.notifications.saved, type: "success" });
      } else {
        setNotifications(notifications); // Revert on error
        setToast({ message: t.notifications.error, type: "error" });
      }
    } catch (err) {
      console.error("Update notifications error:", err);
      setNotifications(notifications);
      setToast({ message: t.notifications.error, type: "error" });
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, [notifications, t.notifications]);

  // 🔹 التحقق من كلمة المرور
  const validatePassword = () => {
    const errors: Record<string, string> = {};
    
    if (!passwords.current.trim()) errors.current = t.password.errors.currentRequired;
    if (!passwords.new.trim()) errors.new = t.password.errors.newRequired;
    if (!passwords.confirm.trim()) errors.confirm = t.password.errors.confirmRequired;
    if (passwords.new && passwords.new.length < 6) errors.new = t.password.errors.short;
    if (passwords.new !== passwords.confirm) errors.confirm = t.password.errors.mismatch;
    if (passwords.current && passwords.new && passwords.current === passwords.new) {
      errors.new = t.password.errors.same;
    }
    
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 🔹 تغيير كلمة المرور
  const handleChangePassword = async () => {
    if (!validatePassword()) return;
    
    setLoading(prev => ({ ...prev, password: true }));
    
    try {
      const response = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.current,
          newPassword: passwords.new,
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setToast({ message: t.password.success, type: "success" });
        setPasswords({ current: "", new: "", confirm: "" });
        setPasswordErrors({});
      } else {
        setPasswordErrors({ current: result.error || t.password.errors.incorrect });
        setToast({ message: result.error || t.password.errors.failed, type: "error" });
      }
    } catch (err) {
      console.error("Change password error:", err);
      setToast({ message: t.password.errors.failed, type: "error" });
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  // 🔹 حذف الحساب (محاكاة)
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/users/account", { method: "DELETE" });
      if (response.ok) {
        // Redirect to login or home
        window.location.href = "/login?deleted=true";
      } else {
        setToast({ message: t.danger.error, type: "error" });
      }
    } catch (err) {
      console.error("Delete account error:", err);
      setToast({ message: t.danger.error, type: "error" });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
      </div>

      {/* 🔔 Notifications Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.notifications.title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.notifications.desc}</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {[
            { key: "email", ...t.notifications.email },
            { key: "sms", ...t.notifications.sms },
            { key: "orders", ...t.notifications.orders },
            { key: "marketing", ...t.notifications.marketing },
          ].map((item: any) => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{item.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
              <ToggleSwitch
                enabled={notifications[item.key as keyof typeof notifications]}
                onChange={() => updateNotifications(item.key, !notifications[item.key as keyof typeof notifications])}
                disabled={loading.notifications}
                label={item.label}
              />
            </div>
          ))}
        </div>
        
        {loading.notifications && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t.notifications.saving}
          </div>
        )}
      </div>

      {/* 🔐 Change Password Section */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.password.title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.password.desc}</p>
          </div>
        </div>

        <div className="space-y-4 max-w-md">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.password.current}
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) => { setPasswords({ ...passwords, current: e.target.value }); setPasswordErrors({ ...passwordErrors, current: "" }); }}
              placeholder={t.password.currentPlaceholder}
              className={`w-full px-4 py-2.5 rounded-lg border ${passwordErrors.current ? "border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text`}
            />
            {passwordErrors.current && <p className="mt-1 text-xs text-red-500">{passwordErrors.current}</p>}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.password.new}
            </label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) => { setPasswords({ ...passwords, new: e.target.value }); setPasswordErrors({ ...passwordErrors, new: "" }); }}
              placeholder={t.password.newPlaceholder}
              className={`w-full px-4 py-2.5 rounded-lg border ${passwordErrors.new ? "border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text`}
            />
            {passwordErrors.new && <p className="mt-1 text-xs text-red-500">{passwordErrors.new}</p>}
            <p className="mt-1 text-xs text-gray-500">{t.password.requirements}</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.password.confirm}
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => { setPasswords({ ...passwords, confirm: e.target.value }); setPasswordErrors({ ...passwordErrors, confirm: "" }); }}
              placeholder={t.password.confirmPlaceholder}
              className={`w-full px-4 py-2.5 rounded-lg border ${passwordErrors.confirm ? "border-red-500" : "border-gray-300 dark:border-gray-700"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text`}
            />
            {passwordErrors.confirm && <p className="mt-1 text-xs text-red-500">{passwordErrors.confirm}</p>}
          </div>

          {/* Submit Button */}
          <button
            onClick={handleChangePassword}
            disabled={loading.password || !passwords.current || !passwords.new || !passwords.confirm}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium hover:from-sky-600 hover:to-blue-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading.password ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.password.updating}
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                {t.password.update}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ⚠️ Danger Zone */}
      <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">{t.danger.title}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t.danger.desc}</p>
          </div>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
        >
          {t.danger.deleteBtn}
        </button>
      </div>

      {/* 🗑️ Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        t={t}
      />

      {/* 🔔 Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}