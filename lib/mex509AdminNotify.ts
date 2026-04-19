/** Email address for operational alerts (external tracking, staff notifications). */
export function mex509AdminNotifyEmail(): string {
  return process.env.MEX509_ADMIN_NOTIFY_EMAIL?.trim() || "info@mex509.com";
}
