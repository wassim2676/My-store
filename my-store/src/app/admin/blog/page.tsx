"use client";

import { useState, useEffect } from "react";
import { Plus, X, Trash2, Newspaper } from "lucide-react";
import { useTranslations } from "next-intl";
import AdminButton from "@/components/admin/AdminButton";

interface Post {
  id: string; title: string; slug: string; status: "DRAFT" | "PUBLISHED";
  category: string | null; createdAt: string; views: number;
}

const emptyForm = { title: "", excerpt: "", content: "", coverImage: "", category: "", status: "DRAFT" as "DRAFT" | "PUBLISHED" };

export default function AdminBlogPage() {
  const t = useTranslations("adm.blog");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/admin/blog")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPosts(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- تحميل أولي عند فتح الصفحة
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, coverImage: form.coverImage || undefined }),
      });
      if (!res.ok) { setError(t("saveError")); return; }
      setForm(emptyForm);
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
    load();
  };

  const togglePublish = async (post: Post) => {
    await fetch(`/api/admin/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" }),
    });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-sky-500" /> {t("title")}
        </h1>
        <AdminButton onClick={() => setShowForm((v) => !v)} icon={showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}>
          {showForm ? t("close") : t("new")}
        </AdminButton>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 mb-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm">{error}</div>}
          <input required placeholder={t("fTitle")} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input placeholder={t("fCategory")} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm" />
            <input placeholder={t("fCover")} value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <input placeholder={t("fExcerpt")} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm" />
          <textarea required placeholder={t("fContent")} rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm" />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.status === "PUBLISHED"} onChange={(e) => setForm({ ...form, status: e.target.checked ? "PUBLISHED" : "DRAFT" })} />
              {t("publishNow")}
            </label>
            <AdminButton type="submit" loading={saving}>
              {saving ? t("saving") : t("save")}
            </AdminButton>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <p className="text-gray-500">{t("empty")}</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{post.title}</p>
                <p className="text-xs text-gray-400">{post.category || t("noCategory")} · {t("views", { n: post.views })}</p>
              </div>
              <AdminButton size="sm" variant={post.status === "PUBLISHED" ? "secondary" : "primary"} onClick={() => togglePublish(post)}>
                {post.status === "PUBLISHED" ? t("published") : t("draft")}
              </AdminButton>
              <AdminButton size="sm" variant="ghost" onClick={() => handleDelete(post.id)}>
                <Trash2 className="w-4 h-4" />
              </AdminButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
