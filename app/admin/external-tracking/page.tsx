import AdminExternalTrackingBoard from "@/components/admin/AdminExternalTrackingBoard";

export default async function AdminExternalTrackingPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  return <AdminExternalTrackingBoard highlightId={id?.trim() || null} />;
}
