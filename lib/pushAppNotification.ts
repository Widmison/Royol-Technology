import { prisma } from "@/lib/prisma";

export async function pushStaffNotification(input: {
  type: string;
  title: string;
  body: string;
  link?: string | null;
}) {
  return prisma.appNotification.create({
    data: {
      forStaff: true,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    },
  });
}

export async function pushUserNotification(
  userId: string,
  input: { type: string; title: string; body: string; link?: string | null }
) {
  return prisma.appNotification.create({
    data: {
      userId,
      forStaff: false,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link ?? null,
    },
  });
}
