/** `admin.example.com` or `admin.portal.example.com` (admin portal host). */
export function isAdminDashboardHost(host: string): boolean {
  return host.startsWith("admin.") || host.startsWith("admin.portal.");
}
