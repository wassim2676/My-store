import { getMarketerSession, serializeLandingPage } from "@/lib/marketer";
import PageSettingsForm from "@/components/dashboard/PageSettingsForm";

export default async function PageSettingsPage() {
  const ctx = await getMarketerSession();
  return <PageSettingsForm initial={serializeLandingPage(ctx!.landingPage!)} />;
}
