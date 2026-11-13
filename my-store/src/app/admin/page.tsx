import { redirect } from "next/navigation";

// /admin بلا صفحة كان يعطي 404 — نحوّله إلى النظرة العامة
export default function AdminIndex() {
  redirect("/admin/dashboard");
}
