import { NextResponse } from "next/server";
import { ExternalTrackingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdminApiUser } from "@/lib/requireApiSession";
import { pushStaffNotification, pushUserNotification } from "@/lib/pushAppNotification";
import { sendExternalTrackingUpdateEmails } from "@/lib/sendNotificationEmails";
import { getPortalSiteUrl } from "@/lib/siteUrl";
import { canPerformStaffCapability } from "@/lib/staffAccess";

const STATUSES = new Set(Object.values(ExternalTrackingStatus));

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const adminOrRes = await requireAdminApiUser();
    if (adminOrRes instanceof NextResponse) return adminOrRes;
    if (!canPerformStaffCapability(adminOrRes, "tracking:external-review")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));

    const statusRaw = typeof body.status === "string" ? body.status.trim() : "";
    const adminNote =
      typeof body.adminNote === "string" ? body.adminNote.trim().slice(0, 4000) : undefined;
    const linkedRaw = body.linkedPackageId;
    const mexTracking =
      typeof body.linkMexTrackingId === "string" ? body.linkMexTrackingId.trim().toUpperCase() : "";

    const existing = await prisma.clientExternalTracking.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Entry not found." }, { status: 404 });
    }

    let linkedPackageId: string | null | undefined = undefined;

    if (mexTracking) {
      const pkg = await prisma.package.findUnique({
        where: { trackingId: mexTracking },
        include: { request: true },
      });
      if (!pkg) {
        return NextResponse.json(
          { error: `No MEX509 package found for tracking ID ${mexTracking}.` },
          { status: 400 }
        );
      }
      if (pkg.request.clientId !== existing.userId) {
        return NextResponse.json(
          { error: "That internal package belongs to a different client." },
          { status: 403 }
        );
      }
      linkedPackageId = pkg.id;
    } else if (linkedRaw === null) linkedPackageId = null;
    else if (typeof linkedRaw === "string" && linkedRaw.trim()) {
      const lid = linkedRaw.trim();
      const pkg = await prisma.package.findUnique({
        where: { id: lid },
        include: { request: true },
      });
      if (!pkg) {
        return NextResponse.json({ error: "MEX509 package not found for that ID." }, { status: 400 });
      }
      if (pkg.request.clientId !== existing.userId) {
        return NextResponse.json(
          { error: "That internal package belongs to a different client." },
          { status: 403 }
        );
      }
      linkedPackageId = lid;
    }

    const data: {
      status?: ExternalTrackingStatus;
      adminNote?: string | null;
      linkedPackageId?: string | null;
    } = {};

    if (statusRaw && STATUSES.has(statusRaw as ExternalTrackingStatus)) {
      data.status = statusRaw as ExternalTrackingStatus;
    }

    if (adminNote !== undefined) {
      data.adminNote = adminNote || null;
    }

    if (linkedPackageId !== undefined) {
      data.linkedPackageId = linkedPackageId;
      if (linkedPackageId !== null) {
        data.status = ExternalTrackingStatus.PACKED_RECEIVED;
      }
    }

    await prisma.clientExternalTracking.update({
      where: { id },
      data,
    });

    const row = await prisma.clientExternalTracking.findUnique({
      where: { id },
      include: { linkedPackage: { select: { trackingId: true, id: true, status: true } } },
    });

    const nextStatus = row?.status ?? existing.status;

    const linkedResolved = row?.linkedPackage?.trackingId;
    const becameLinked =
      linkedPackageId !== undefined &&
      linkedPackageId !== null &&
      linkedResolved &&
      linkedPackageId !== existing.linkedPackageId;

    const title = becameLinked
      ? "Your external tracking was linked"
      : adminNote !== undefined && (adminNote?.length ?? 0) > 0
        ? "Message about your external tracking"
        : nextStatus !== existing.status
          ? "External tracking status updated"
          : "External tracking updated";

    const message =
      becameLinked && linkedResolved
        ? `We linked ${existing.trackingNumber} to your MEX509 shipment ${linkedResolved}.`
        : adminNote !== undefined && adminNote
          ? adminNote
          : `Status is now ${String(nextStatus).replace(/_/g, " ").toLowerCase()}.`;

    await pushUserNotification(existing.userId, {
      type: "EXTERNAL_TRACKING_ADMIN_UPDATE",
      title,
      body: message,
      link: "/dashboard?tab=external",
    });

    await pushStaffNotification({
      type: "EXTERNAL_TRACKING_ADMIN_RECORD",
      title: `External tracking updated · ${existing.trackingNumber}`,
      body: message,
      link: `/admin/external-tracking?id=${id}`,
    });

    const clientName =
      `${existing.user.firstName ?? ""} ${existing.user.lastName ?? ""}`.trim() || existing.user.email;

    await sendExternalTrackingUpdateEmails({
      clientEmail: existing.user.email,
      clientName,
      trackingNumber: existing.trackingNumber,
      title,
      message,
      dashboardUrl: getPortalSiteUrl(),
    });

    const fresh = await prisma.clientExternalTracking.findUnique({
      where: { id },
      include: {
        linkedPackage: { select: { id: true, trackingId: true, status: true } },
      },
    });

    return NextResponse.json({ entry: fresh });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
