import { prisma } from "@/lib/prisma";
import { mex509AdminNotifyEmail } from "@/lib/mex509AdminNotify";
import { getAdminPortalUrl, getPortalSiteUrl } from "@/lib/siteUrl";
import { sendInAppNotificationEmail } from "@/lib/sendNotificationEmails";

export async function pushStaffNotification(input: {
  type: string;
  title: string;
  body: string;
  link?: string | null;
}) {
  const created = await prisma.appNotification.create({
    data: {
      forStaff: true,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    },
  });

  void sendInAppNotificationEmail({
    to: mex509AdminNotifyEmail(),
    title: input.title,
    body: input.body,
    link: input.link ? `${getAdminPortalUrl().replace(/\/$/, "")}${input.link}` : getAdminPortalUrl(),
    isStaff: true,
  }).catch((err) => console.warn("[pushStaffNotification email]", err));

  return created;
}

export async function pushUserNotification(
  userId: string,
  input: { type: string; title: string; body: string; link?: string | null }
) {
  const created = await prisma.appNotification.create({
    data: {
      userId,
      forStaff: false,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (user?.email) {
    void sendInAppNotificationEmail({
      to: user.email,
      title: input.title,
      body: input.body,
      link: input.link ? `${getPortalSiteUrl().replace(/\/$/, "")}${input.link}` : getPortalSiteUrl(),
      isStaff: false,
    }).catch((err) => console.warn("[pushUserNotification email]", err));
  }

  return created;
}
