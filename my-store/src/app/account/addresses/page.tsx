"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Plus, Pencil, Trash2, Check, X, Loader2, AlertCircle, RefreshCw } from "lucide-react";

// ==================== 📦 تعريف النوع محلياً ====================
interface Address {
  id: string;
  label: string;
  type?: string;
  firstName: string;
  lastName: string;
  phone: string;
  company?: string | null;
  street: string;
  address2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
  isDefault: boolean;
}

interface AddressFormData {
  label: string;
  firstName: string;
  lastName: string;
  phone: string;
  company?: string;
  street: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
}

// ==================== 🔤 الترجمات ====================
type Language = "ar" | "fr" | "en";

const translations: Record<Language, any> = {
  ar: {
    title: "عناويني",
    subtitle: "إدارة عناوين الشحن والفواتير",
    addNew: "عنوان جديد",
    default: "افتراضي",
    setDefault: "تعيين كافتراضي",
    edit: "تعديل",
    delete: "حذف",
    formTitle: "إضافة عنوان جديد",
    formEditTitle: "تعديل العنوان",
    label: "اسم العنوان *",
    labelPlaceholder: "مثال: المنزل، العمل",
    firstName: "الاسم الأول *",
    lastName: "اسم العائلة *",
    phone: "رقم الهاتف *",
    phonePlaceholder: "+212 6XX XXX XXX",
    company: "اسم الشركة (اختياري)",
    street: "العنوان التفصيلي *",
    streetPlaceholder: "الحي، الشارع، رقم العمارة",
    address2: "مكمل العنوان (شقة، طابق...)",
    city: "المدينة *",
    state: "الإقليم/الجهة",
    postalCode: "الرمز البريدي",
    country: "الدولة *",
    save: "حفظ العنوان",
    cancel: "إلغاء",
    updating: "جاري الحفظ...",
    errors: {
      required: "هذا الحقل مطلوب",
      phoneInvalid: "رقم هاتف غير صالح",
    },
    error: {
      load: "فشل جلب العناوين",
      add: "فشل إضافة العنوان",
      update: "فشل تحديث العنوان",
      delete: "فشل حذف العنوان",
      confirmDelete: "هل أنت متأكد من حذف هذا العنوان؟",
    },
    empty: "ليس لديك عناوين محفوظة بعد",
    addFirst: "أضف عنوانك الأول للبدء",
    loading: "جاري التحميل...",
    retry: "إعادة المحاولة",
  },
  fr: {
    title: "Mes Adresses",
    subtitle: "Gérez vos adresses de livraison et de facturation",
    addNew: "Nouvelle adresse",
    default: "Par défaut",
    setDefault: "Définir par défaut",
    edit: "Modifier",
    delete: "Supprimer",
    formTitle: "Ajouter une nouvelle adresse",
    formEditTitle: "Modifier l'adresse",
    label: "Nom de l'adresse *",
    labelPlaceholder: "Ex: Maison, Travail",
    firstName: "Prénom *",
    lastName: "Nom *",
    phone: "Téléphone *",
    phonePlaceholder: "+212 6XX XXX XXX",
    company: "Société (optionnel)",
    street: "Adresse complète *",
    streetPlaceholder: "Quartier, rue, numéro",
    address2: "Complément d'adresse",
    city: "Ville *",
    state: "Région",
    postalCode: "Code postal",
    country: "Pays *",
    save: "Enregistrer",
    cancel: "Annuler",
    updating: "Enregistrement...",
    errors: {
      required: "Ce champ est requis",
      phoneInvalid: "Numéro de téléphone invalide",
    },
    error: {
      load: "Échec du chargement des adresses",
      add: "Échec de l'ajout de l'adresse",
      update: "Échec de la mise à jour",
      delete: "Échec de la suppression",
      confirmDelete: "Êtes-vous sûr de vouloir supprimer cette adresse?",
    },
    empty: "Vous n'avez pas encore d'adresses",
    addFirst: "Ajoutez votre première adresse",
    loading: "Chargement...",
    retry: "Réessayer",
  },
  en: {
    title: "My Addresses",
    subtitle: "Manage your shipping and billing addresses",
    addNew: "Add New Address",
    default: "Default",
    setDefault: "Set as Default",
    edit: "Edit",
    delete: "Delete",
    formTitle: "Add New Address",
    formEditTitle: "Edit Address",
    label: "Address Label *",
    labelPlaceholder: "e.g., Home, Work",
    firstName: "First Name *",
    lastName: "Last Name *",
    phone: "Phone Number *",
    phonePlaceholder: "+212 6XX XXX XXX",
    company: "Company (optional)",
    street: "Street Address *",
    streetPlaceholder: "District, street, building number",
    address2: "Address Line 2",
    city: "City *",
    state: "State/Region",
    postalCode: "Postal Code",
    country: "Country *",
    save: "Save Address",
    cancel: "Cancel",
    updating: "Saving...",
    errors: {
      required: "This field is required",
      phoneInvalid: "Invalid phone number",
    },
    error: {
      load: "Failed to load addresses",
      add: "Failed to add address",
      update: "Failed to update address",
      delete: "Failed to delete address",
      confirmDelete: "Are you sure you want to delete this address?",
    },
    empty: "You don't have any saved addresses yet",
    addFirst: "Add your first address to get started",
    loading: "Loading...",
    retry: "Retry",
  },
};

// ==================== 🎨 مكون بطاقة العنوان ====================
function AddressCard({ 
  address, 
  t, 
  onSetDefault, 
  onEdit, 
  onDelete 
}: { 
  address: Address; 
  t: any; 
  onSetDefault: (id: string) => void; 
  onEdit: (address: Address) => void; 
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className={`relative bg-white dark:bg-gray-900 border rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer ${
        address.isDefault 
          ? "border-sky-500 dark:border-sky-600 ring-1 ring-sky-500/20" 
          : "border-gray-200 dark:border-gray-800 hover:border-sky-300 dark:hover:border-sky-700"
      }`}
    >
      {address.isDefault && (
        <div className="absolute top-3 start-3 px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 text-xs font-medium rounded-full flex items-center gap-1">
          <Check className="w-3 h-3" />
          {t.default}
        </div>
      )}
      
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center text-sky-600 dark:text-sky-400 flex-shrink-0">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white truncate">
            {address.label}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {address.street}
          </p>
          {address.address2 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {address.address2}
            </p>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {address.city}{address.state ? `, ${address.state}` : ""}, {address.country}
            <br />
            📞 {address.phone}
          </p>
          {address.company && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              🏢 {address.company}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={() => onSetDefault(address.id)}
          disabled={address.isDefault}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            address.isDefault
              ? "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 cursor-default"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          {t.setDefault}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(address)}
            className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg transition-colors cursor-pointer"
            title={t.edit}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(address.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors cursor-pointer"
            title={t.delete}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== 🎨 مكون النموذج ====================
function AddressForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  t, 
  errors 
}: { 
  initialData?: Address; 
  onSubmit: (data: AddressFormData) => Promise<void>; 
  onCancel: () => void; 
  t: any;
  errors: Record<string, string>;
}) {
  const [formData, setFormData] = useState<AddressFormData>({
    label: initialData?.label || "",
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    phone: initialData?.phone || "",
    company: initialData?.company || "",
    street: initialData?.street || "",
    address2: initialData?.address2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    postalCode: initialData?.postalCode || "",
    country: initialData?.country || "Morocco",
    isDefault: initialData?.isDefault || false,
  });
  
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onSubmit(formData);
    setSubmitting(false);
  };

  const countries = ["Morocco", "Algeria", "Tunisia", "Saudi Arabia", "UAE", "Egypt", "France", "Other"];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData?.id ? t.formEditTitle : t.formTitle}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.label}
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => handleChange("label", e.target.value)}
              placeholder={t.labelPlaceholder}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.label ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text`}
            />
            {errors.label && <p className="mt-1 text-xs text-red-500">{errors.label}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.firstName}
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.firstName ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text`}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.lastName}
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.lastName ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text`}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.phone}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder={t.phonePlaceholder}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.company}
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleChange("company", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.street}
            </label>
            <textarea
              value={formData.street}
              onChange={(e) => handleChange("street", e.target.value)}
              placeholder={t.streetPlaceholder}
              rows={2}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.street ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all resize-none cursor-text`}
            />
            {errors.street && <p className="mt-1 text-xs text-red-500">{errors.street}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.address2}
            </label>
            <input
              type="text"
              value={formData.address2}
              onChange={(e) => handleChange("address2", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.city}
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border ${errors.city ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text`}
              />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.state}
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleChange("state", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t.postalCode}
              </label>
              <input
                type="text"
                value={formData.postalCode}
                onChange={(e) => handleChange("postalCode", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-text"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t.country}
            </label>
            <select
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.country ? "border-red-500" : "border-gray-300 dark:border-gray-600"} bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-pointer`}
            >
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.country && <p className="mt-1 text-xs text-red-500">{errors.country}</p>}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => handleChange("isDefault", e.target.checked)}
              className="w-4 h-4 text-sky-600 focus:ring-sky-500 border-gray-300 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              تعيين كعنوان افتراضي
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-lg hover:from-sky-600 hover:to-blue-700 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.updating}
                </>
              ) : (
                t.save
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== 🏠 المكون الرئيسي ====================
export default function AddressesPage() {
  const [lang, setLang] = useState<Language>("ar");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const t = translations[lang];

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language;
    if (savedLang && ["ar", "fr", "en"].includes(savedLang)) {
      setLang(savedLang);
    }
  }, []);

  // 🔹 جلب العناوين من API
  const fetchAddresses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch("/api/addresses");
      const result = await response.json();
      
      if (response.ok && result.success && Array.isArray(result.data)) {
        setAddresses(result.data);
      } else {
        setError(result.error || t.error.load);
      }
    } catch (err) {
      console.error("Fetch addresses error:", err);
      setError(t.error.load);
    } finally {
      setLoading(false);
    }
  }, [t.error.load]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  // 🔹 تعيين كافتراضي
  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });
      
      if (response.ok) {
        fetchAddresses();
      }
    } catch (err) {
      console.error("Set default error:", err);
    }
  };

  // 🔹 فتح نموذج التعديل
  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormErrors({});
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingAddress(null);
    setFormErrors({});
    setShowForm(true);
  };

  // 🔹 حفظ العنوان
  const handleSubmit = async (data: AddressFormData) => {
    const errors: Record<string, string> = {};
    if (!data.label.trim()) errors.label = t.errors.required;
    if (!data.firstName.trim()) errors.firstName = t.errors.required;
    if (!data.lastName.trim()) errors.lastName = t.errors.required;
    if (!data.phone.trim() || !/^\+?[0-9\s\-]{8,15}$/.test(data.phone)) {
      errors.phone = t.errors.phoneInvalid;
    }
    if (!data.street.trim()) errors.street = t.errors.required;
    if (!data.city.trim()) errors.city = t.errors.required;
    if (!data.country.trim()) errors.country = t.errors.required;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingAddress?.id) {
        // Update existing
        const response = await fetch(`/api/addresses/${editingAddress.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (response.ok) {
          fetchAddresses();
          setShowForm(false);
          setEditingAddress(null);
        } else {
          const result = await response.json();
          setFormErrors({ label: result.error || t.error.update });
        }
      } else {
        // Create new
        const response = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (response.ok) {
          fetchAddresses();
          setShowForm(false);
        } else {
          const result = await response.json();
          setFormErrors({ label: result.error || t.error.add });
        }
      }
    } catch (err) {
      console.error("Save address error:", err);
    }
  };

  // 🔹 حذف عنوان
  const handleDelete = async (id: string) => {
    if (!confirm(t.error.confirmDelete)) return;
    
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchAddresses();
      } else {
        const result = await response.json();
        alert(result.error || t.error.delete);
      }
    } catch (err) {
      console.error("Delete address error:", err);
      alert(t.error.delete);
    }
  };

  // 🔹 حالة التحميل
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 animate-pulse">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-sky-600 hover:to-blue-700 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          {t.addNew}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={fetchAddresses}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            {t.retry}
          </button>
        </div>
      )}

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
          <MapPin className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t.empty}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t.addFirst}</p>
          <button
            onClick={handleAdd}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg font-medium hover:from-sky-600 hover:to-blue-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {t.addNew}
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              t={t}
              onSetDefault={handleSetDefault}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          
          {/* Add New Card */}
          <button
            onClick={handleAdd}
            className="flex flex-col items-center justify-center h-full min-h-[180px] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 hover:border-sky-500 hover:text-sky-600 dark:hover:border-sky-500 dark:hover:text-sky-400 transition-colors cursor-pointer"
          >
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">{t.addNew}</span>
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <AddressForm
          initialData={editingAddress || undefined}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingAddress(null); setFormErrors({}); }}
          t={t}
          errors={formErrors}
        />
      )}
    </div>
  );
}