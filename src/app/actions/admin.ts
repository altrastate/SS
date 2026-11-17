"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { requirePermission } from "@/lib/guard";
import { canPublish, resolveContentStatus, type Permission } from "@/lib/permissions";
import { dateFromKampalaLocal } from "@/lib/timezone";
import { slugify } from "@/lib/utils";
import { isSafeUpload } from "@/lib/files";
import type { AdminSession } from "@/lib/auth";

function text(formData: FormData, key: string) {
  return String(formData.get(key) || "").trim();
}

function bool(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function revalidatePublic() {
  revalidatePath("/", "layout");
}

async function gated(permission: Permission) {
  return requirePermission(permission);
}

function statusFor(formData: FormData, session: AdminSession, resource: "news" | "events" | "alumni" | "projects" | "content") {
  return resolveContentStatus(text(formData, "status"), canPublish(session.role, resource));
}

export async function saveSettings(formData: FormData) {
  const session = await gated("settings");
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      schoolName: text(formData, "schoolName"),
      abbreviation: text(formData, "abbreviation"),
      motto: text(formData, "motto"),
      tagline: text(formData, "tagline"),
      foundingYear: Number(text(formData, "foundingYear") || 0),
      locationLine: text(formData, "locationLine"),
      postalAddress: text(formData, "postalAddress") || null,
      streetAddress: text(formData, "streetAddress") || null,
      phone: text(formData, "phone") || null,
      secondaryPhone: text(formData, "secondaryPhone") || null,
      email: text(formData, "email") || null,
      officeHours: text(formData, "officeHours") || null,
      mapQuery: text(formData, "mapQuery") || null,
      announcementEnabled: bool(formData, "announcementEnabled"),
      announcementText: text(formData, "announcementText") || null,
      announcementHref: text(formData, "announcementHref") || null,
      developerAttributionEnabled: bool(formData, "developerAttributionEnabled"),
      developerName: text(formData, "developerName") || "Altrastate Technologies Ltd.",
      developerUrl: text(formData, "developerUrl") || null,
      metaTitle: text(formData, "metaTitle"),
      metaDescription: text(formData, "metaDescription"),
      vision: text(formData, "vision") || null,
      mission: text(formData, "mission") || null,
      inspiration: text(formData, "inspiration") || null,
      valuesJson: text(formData, "valuesJson") || "[]",
      introText: text(formData, "introText") || null,
      aboutOverview: text(formData, "aboutOverview") || null,
      historyText: text(formData, "historyText") || null,
      admissionsIntro: text(formData, "admissionsIntro") || null,
      feesNotice: text(formData, "feesNotice") || null,
      paymentNotice: text(formData, "paymentNotice") || null,
      fraudNotice: text(formData, "fraudNotice") || null,
      contactIntro: text(formData, "contactIntro") || null,
      alumniIntro: text(formData, "alumniIntro") || null,
      jicobaIntro: text(formData, "jicobaIntro") || null,
      developmentIntro: text(formData, "developmentIntro") || null,
      academicsIntro: text(formData, "academicsIntro") || null,
      campusIntro: text(formData, "campusIntro") || null,
      headTeacherQuote: text(formData, "headTeacherQuote") || null,
      headTeacherName: text(formData, "headTeacherName") || null,
      headTeacherTitle: text(formData, "headTeacherTitle") || "Head Teacher",
      headTeacherPhotoUrl: text(formData, "headTeacherPhotoUrl") || null,
      headTeacherNamePending: bool(formData, "headTeacherNamePending"),
      contactDetailsVerified: bool(formData, "contactDetailsVerified"),
      enquiryRetentionDays: Number(text(formData, "enquiryRetentionDays") || 365),
      analyticsEnabled: bool(formData, "analyticsEnabled"),
      alumniPortalEnabled: bool(formData, "alumniPortalEnabled"),
      donationsEnabled: bool(formData, "donationsEnabled"),
      communicationsEnabled: bool(formData, "communicationsEnabled"),
      supportIntro: text(formData, "supportIntro") || null,
      parentCommsIntro: text(formData, "parentCommsIntro") || null,
    },
    create: {
      id: "default",
      schoolName: text(formData, "schoolName") || "Kapchorwa Senior Secondary School",
      abbreviation: "KSS",
      motto: "Knowledge Is Our Future Light",
      tagline: "",
      foundingYear: 0,
      locationLine: "Kapchorwa Senior Secondary School, Kawowo, Central Division, Kapchorwa Municipality, Uganda",
      metaTitle: "Kapchorwa Senior Secondary School",
      metaDescription: "Kapchorwa Senior Secondary School",
    },
  });
  await logAudit({ session, action: "settings.update", resourceType: "settings", resourceId: "default", summary: "Site settings updated" });
  revalidatePublic();
  redirect("/admin/settings?saved=1");
}

export async function saveNews(formData: FormData) {
  const session = await gated("news");
  const id = text(formData, "id");
  const title = text(formData, "title");
  const slug = slugify(text(formData, "slug") || title);
  const status = statusFor(formData, session, "news");
  const publishedAt = dateFromKampalaLocal(text(formData, "publishedAt"));
  const data = {
    title,
    slug,
    summary: text(formData, "summary"),
    body: text(formData, "body"),
    category: text(formData, "category") || "News",
    coverImageUrl: text(formData, "coverImageUrl") || null,
    coverAltText: text(formData, "coverAltText") || null,
    authorName: text(formData, "authorName") || null,
    featured: bool(formData, "featured"),
    status,
    publishedAt: status === "published" ? publishedAt || new Date() : publishedAt,
    archivedAt: status === "archived" ? new Date() : null,
  };
  const saved = id
    ? await prisma.newsArticle.update({ where: { id }, data })
    : await prisma.newsArticle.create({ data });
  await prisma.newsRevision.create({
    data: {
      articleId: saved.id,
      title: saved.title,
      summary: saved.summary,
      body: saved.body,
      status: saved.status,
      editorId: session.sub,
    },
  });
  await logAudit({
    session,
    action: status === "published" ? "news.publish" : "news.save",
    resourceType: "news",
    resourceId: saved.id,
    summary: `${saved.title} saved as ${saved.status}`,
  });
  revalidatePublic();
  redirect("/admin/news");
}

export async function deleteNews(formData: FormData) {
  const session = await gated("news");
  if (!canPublish(session.role, "news")) redirect("/admin/forbidden");
  const id = text(formData, "id");
  const existing = await prisma.newsArticle.findUnique({ where: { id } });
  await prisma.newsArticle.delete({ where: { id } });
  await logAudit({ session, action: "news.delete", resourceType: "news", resourceId: id, summary: existing?.title || id });
  revalidatePublic();
  redirect("/admin/news");
}

export async function saveEvent(formData: FormData) {
  const session = await gated("events");
  const id = text(formData, "id");
  const title = text(formData, "title");
  const status = statusFor(formData, session, "events");
  const data = {
    title,
    slug: slugify(text(formData, "slug") || title),
    summary: text(formData, "summary"),
    body: text(formData, "body"),
    location: text(formData, "location") || null,
    startAt: dateFromKampalaLocal(text(formData, "startAt")),
    endAt: dateFromKampalaLocal(text(formData, "endAt")),
    coverImageUrl: text(formData, "coverImageUrl") || null,
    coverAltText: text(formData, "coverAltText") || null,
    category: text(formData, "category") || "School",
    audience: text(formData, "audience") || "public",
    infoUrl: text(formData, "infoUrl") || null,
    cancelled: bool(formData, "cancelled"),
    archived: bool(formData, "archived"),
    status,
    publishedAt: status === "published" ? new Date() : null,
  };
  const saved = id ? await prisma.eventItem.update({ where: { id }, data }) : await prisma.eventItem.create({ data });
  await logAudit({
    session,
    action: data.cancelled ? "event.cancel" : "event.save",
    resourceType: "event",
    resourceId: saved.id,
    summary: `${saved.title} saved as ${saved.status}${saved.cancelled ? " (cancelled)" : ""}`,
  });
  revalidatePublic();
  redirect("/admin/events");
}

export async function deleteEvent(formData: FormData) {
  const session = await gated("events");
  if (!canPublish(session.role, "events")) redirect("/admin/forbidden");
  const id = text(formData, "id");
  const existing = await prisma.eventItem.findUnique({ where: { id } });
  await prisma.eventItem.delete({ where: { id } });
  await logAudit({ session, action: "event.delete", resourceType: "event", resourceId: id, summary: existing?.title || id });
  revalidatePublic();
  redirect("/admin/events");
}

export async function saveFaq(formData: FormData) {
  const session = await gated("faqs");
  const id = text(formData, "id");
  const status = statusFor(formData, session, "content");
  const data = {
    question: text(formData, "question"),
    answer: text(formData, "answer"),
    category: text(formData, "category") || "general",
    sortOrder: Number(text(formData, "sortOrder") || 0),
    status,
  };
  const saved = id ? await prisma.fAQ.update({ where: { id }, data }) : await prisma.fAQ.create({ data });
  await logAudit({ session, action: "faq.save", resourceType: "faq", resourceId: saved.id, summary: saved.question });
  revalidatePublic();
  redirect("/admin/faqs");
}

export async function deleteFaq(formData: FormData) {
  const session = await gated("faqs");
  if (!canPublish(session.role, "content")) redirect("/admin/forbidden");
  const id = text(formData, "id");
  await prisma.fAQ.delete({ where: { id } });
  await logAudit({ session, action: "faq.delete", resourceType: "faq", resourceId: id });
  revalidatePublic();
  redirect("/admin/faqs");
}

export async function saveStaff(formData: FormData) {
  const session = await gated("staff");
  const id = text(formData, "id");
  const status = statusFor(formData, session, "content");
  const data = {
    name: text(formData, "name") || null,
    title: text(formData, "title"),
    bio: text(formData, "bio") || null,
    photoUrl: text(formData, "photoUrl") || null,
    category: text(formData, "category") || "leadership",
    sortOrder: Number(text(formData, "sortOrder") || 0),
    status,
    namePending: bool(formData, "namePending"),
  };
  const saved = id ? await prisma.staffProfile.update({ where: { id }, data }) : await prisma.staffProfile.create({ data });
  await logAudit({ session, action: "staff.save", resourceType: "staff", resourceId: saved.id, summary: saved.title });
  revalidatePublic();
  redirect("/admin/staff");
}

export async function deleteStaff(formData: FormData) {
  const session = await gated("staff");
  if (!canPublish(session.role, "content")) redirect("/admin/forbidden");
  const id = text(formData, "id");
  await prisma.staffProfile.delete({ where: { id } });
  await logAudit({ session, action: "staff.delete", resourceType: "staff", resourceId: id });
  revalidatePublic();
  redirect("/admin/staff");
}

export async function saveGallery(formData: FormData) {
  const session = await gated("gallery");
  const id = text(formData, "id");
  const status = statusFor(formData, session, "content");
  const data = {
    title: text(formData, "title"),
    caption: text(formData, "caption") || null,
    imageUrl: text(formData, "imageUrl"),
    altText: text(formData, "altText"),
    category: text(formData, "category") || null,
    sortOrder: Number(text(formData, "sortOrder") || 0),
    status,
  };
  const saved = id ? await prisma.galleryItem.update({ where: { id }, data }) : await prisma.galleryItem.create({ data });
  await logAudit({ session, action: "gallery.save", resourceType: "gallery", resourceId: saved.id, summary: saved.title });
  revalidatePublic();
  redirect("/admin/gallery");
}

export async function deleteGallery(formData: FormData) {
  const session = await gated("gallery");
  if (!canPublish(session.role, "content")) redirect("/admin/forbidden");
  const id = text(formData, "id");
  await prisma.galleryItem.delete({ where: { id } });
  await logAudit({ session, action: "gallery.delete", resourceType: "gallery", resourceId: id });
  revalidatePublic();
  redirect("/admin/gallery");
}

export async function saveDownload(formData: FormData) {
  const session = await gated("downloads");
  const id = text(formData, "id");
  const status = statusFor(formData, session, "content");
  const data = {
    title: text(formData, "title"),
    description: text(formData, "description") || null,
    fileUrl: text(formData, "fileUrl"),
    fileName: text(formData, "fileName") || null,
    fileSize: Number(text(formData, "fileSize") || 0) || null,
    mimeType: text(formData, "mimeType") || null,
    category: text(formData, "category") || "General documents",
    status,
    publishedAt: status === "published" ? new Date() : null,
    reviewAt: dateFromKampalaLocal(text(formData, "reviewAt")),
    expiresAt: dateFromKampalaLocal(text(formData, "expiresAt")),
  };
  const saved = id ? await prisma.downloadItem.update({ where: { id }, data }) : await prisma.downloadItem.create({ data });
  await logAudit({ session, action: "download.save", resourceType: "download", resourceId: saved.id, summary: saved.title });
  revalidatePublic();
  redirect("/admin/downloads");
}

export async function deleteDownload(formData: FormData) {
  const session = await gated("downloads");
  if (!canPublish(session.role, "content")) redirect("/admin/forbidden");
  const id = text(formData, "id");
  const existing = await prisma.downloadItem.findUnique({ where: { id } });
  await prisma.downloadItem.delete({ where: { id } });
  await logAudit({ session, action: "download.delete", resourceType: "download", resourceId: id, summary: existing?.title || id });
  revalidatePublic();
  redirect("/admin/downloads");
}

export async function saveAlumni(formData: FormData) {
  const session = await gated("alumni");
  const id = text(formData, "id");
  const title = text(formData, "title");
  const status = statusFor(formData, session, "alumni");
  const data = {
    title,
    slug: slugify(text(formData, "slug") || title),
    summary: text(formData, "summary"),
    body: text(formData, "body"),
    personName: text(formData, "personName") || null,
    graduationYear: text(formData, "graduationYear") || null,
    coverImageUrl: text(formData, "coverImageUrl") || null,
    coverAltText: text(formData, "coverAltText") || null,
    status,
    publishedAt: status === "published" ? new Date() : null,
  };
  const saved = id ? await prisma.alumniStory.update({ where: { id }, data }) : await prisma.alumniStory.create({ data });
  await logAudit({ session, action: "alumni.save", resourceType: "alumni", resourceId: saved.id, summary: saved.title });
  revalidatePublic();
  redirect("/admin/alumni");
}

export async function deleteAlumni(formData: FormData) {
  const session = await gated("alumni");
  if (!canPublish(session.role, "alumni")) redirect("/admin/forbidden");
  const id = text(formData, "id");
  const existing = await prisma.alumniStory.findUnique({ where: { id } });
  await prisma.alumniStory.delete({ where: { id } });
  await logAudit({ session, action: "alumni.delete", resourceType: "alumni", resourceId: id, summary: existing?.title || id });
  revalidatePublic();
  redirect("/admin/alumni");
}

export async function saveProject(formData: FormData) {
  const session = await gated("projects");
  const id = text(formData, "id");
  const title = text(formData, "title");
  const status = statusFor(formData, session, "projects");
  const data = {
    title,
    slug: slugify(text(formData, "slug") || title) || null,
    summary: text(formData, "summary"),
    body: text(formData, "body"),
    publicUpdates: text(formData, "publicUpdates") || null,
    statusLabel: text(formData, "statusLabel") || null,
    coverImageUrl: text(formData, "coverImageUrl") || null,
    coverAltText: text(formData, "coverAltText") || null,
    sortOrder: Number(text(formData, "sortOrder") || 0),
    acceptDonations: bool(formData, "acceptDonations"),
    status,
    publishedAt: status === "published" ? new Date() : null,
  };
  const saved = id
    ? await prisma.developmentProject.update({ where: { id }, data })
    : await prisma.developmentProject.create({ data });
  await logAudit({ session, action: "project.save", resourceType: "project", resourceId: saved.id, summary: saved.title });
  revalidatePublic();
  redirect("/admin/projects");
}

export async function deleteProject(formData: FormData) {
  const session = await gated("projects");
  if (!canPublish(session.role, "projects")) redirect("/admin/forbidden");
  const id = text(formData, "id");
  const existing = await prisma.developmentProject.findUnique({ where: { id } });
  await prisma.developmentProject.delete({ where: { id } });
  await logAudit({ session, action: "project.delete", resourceType: "project", resourceId: id, summary: existing?.title || id });
  revalidatePublic();
  redirect("/admin/projects");
}

export async function savePathway(formData: FormData) {
  const session = await gated("academics");
  const id = text(formData, "id");
  const name = text(formData, "name");
  const status = statusFor(formData, session, "content");
  const data = {
    name,
    slug: slugify(text(formData, "slug") || name),
    levelLabel: text(formData, "levelLabel"),
    summary: text(formData, "summary"),
    body: text(formData, "body"),
    sortOrder: Number(text(formData, "sortOrder") || 0),
    status,
  };
  const saved = id
    ? await prisma.academicPathway.update({ where: { id }, data })
    : await prisma.academicPathway.create({ data });
  await logAudit({ session, action: "pathway.save", resourceType: "pathway", resourceId: saved.id, summary: saved.name });
  revalidatePublic();
  redirect("/admin/academics");
}

export async function saveDepartment(formData: FormData) {
  const session = await gated("academics");
  const id = text(formData, "id");
  const status = statusFor(formData, session, "content");
  const data = {
    name: text(formData, "name"),
    summary: text(formData, "summary"),
    body: text(formData, "body") || null,
    sortOrder: Number(text(formData, "sortOrder") || 0),
    status,
  };
  const saved = id
    ? await prisma.academicDepartment.update({ where: { id }, data })
    : await prisma.academicDepartment.create({ data });
  await logAudit({ session, action: "department.save", resourceType: "department", resourceId: saved.id, summary: saved.name });
  revalidatePublic();
  redirect("/admin/academics");
}

export async function deleteDepartment(formData: FormData) {
  const session = await gated("academics");
  if (!canPublish(session.role, "content")) redirect("/admin/forbidden");
  const id = text(formData, "id");
  await prisma.academicDepartment.delete({ where: { id } });
  await logAudit({ session, action: "department.delete", resourceType: "department", resourceId: id });
  revalidatePublic();
  redirect("/admin/academics");
}

export async function saveCampusSection(formData: FormData) {
  const session = await gated("campus");
  const id = text(formData, "id");
  const title = text(formData, "title");
  const status = statusFor(formData, session, "content");
  const data = {
    title,
    slug: slugify(text(formData, "slug") || title),
    summary: text(formData, "summary"),
    body: text(formData, "body"),
    sortOrder: Number(text(formData, "sortOrder") || 0),
    status,
  };
  const saved = id
    ? await prisma.campusLifeSection.update({ where: { id }, data })
    : await prisma.campusLifeSection.create({ data });
  await logAudit({ session, action: "campus.save", resourceType: "campus", resourceId: saved.id, summary: saved.title });
  revalidatePublic();
  redirect("/admin/campus-life");
}

export async function deleteCampusSection(formData: FormData) {
  const session = await gated("campus");
  if (!canPublish(session.role, "content")) redirect("/admin/forbidden");
  const id = text(formData, "id");
  await prisma.campusLifeSection.delete({ where: { id } });
  await logAudit({ session, action: "campus.delete", resourceType: "campus", resourceId: id });
  revalidatePublic();
  redirect("/admin/campus-life");
}

export async function saveTimeline(formData: FormData) {
  const session = await gated("timeline");
  const id = text(formData, "id");
  const status = statusFor(formData, session, "content");
  const data = {
    year: text(formData, "year"),
    title: text(formData, "title"),
    description: text(formData, "description"),
    sortOrder: Number(text(formData, "sortOrder") || 0),
    verified: bool(formData, "verified"),
    status,
  };
  const saved = id ? await prisma.timelineEvent.update({ where: { id }, data }) : await prisma.timelineEvent.create({ data });
  await logAudit({ session, action: "timeline.save", resourceType: "timeline", resourceId: saved.id, summary: saved.title });
  revalidatePublic();
  redirect("/admin/timeline");
}

export async function deleteTimeline(formData: FormData) {
  const session = await gated("timeline");
  if (!canPublish(session.role, "content")) redirect("/admin/forbidden");
  const id = text(formData, "id");
  await prisma.timelineEvent.delete({ where: { id } });
  await logAudit({ session, action: "timeline.delete", resourceType: "timeline", resourceId: id });
  revalidatePublic();
  redirect("/admin/timeline");
}

const ENQUIRY_STATUSES = new Set(["new", "in_progress", "responded", "closed"]);

function normalizeEnquiryStatus(value: string) {
  if (value === "read") return "in_progress";
  if (value === "archived") return "closed";
  return ENQUIRY_STATUSES.has(value) ? value : "new";
}

export async function updateEnquiryStatus(formData: FormData) {
  const session = await gated("enquiries");
  const id = text(formData, "id");
  const existing = await prisma.enquiry.findUnique({ where: { id } });
  if (!existing) redirect("/admin/enquiries");
  const next = normalizeEnquiryStatus(text(formData, "status"));
  await prisma.enquiry.update({
    where: { id },
    data: {
      status: next,
      respondedAt: next === "responded" ? existing.respondedAt || new Date() : existing.respondedAt,
      closedAt: next === "closed" ? existing.closedAt || new Date() : null,
    },
  });
  await prisma.enquiryStatusChange.create({
    data: {
      enquiryId: id,
      fromStatus: existing.status,
      toStatus: next,
      actorId: session.sub,
      actorEmail: session.email,
    },
  });
  await logAudit({
    session,
    action: "enquiry.status",
    resourceType: "enquiry",
    resourceId: id,
    summary: `Status changed from ${existing.status} to ${next}`,
  });
  redirect(`/admin/enquiries/${id}`);
}

export async function assignEnquiry(formData: FormData) {
  const session = await gated("enquiries");
  const id = text(formData, "id");
  const assignedToId = text(formData, "assignedToId") || null;
  if (assignedToId) {
    const assignee = await prisma.user.findUnique({ where: { id: assignedToId } });
    if (!assignee || assignee.active === false) redirect(`/admin/enquiries/${id}?error=assignee`);
  }
  await prisma.enquiry.update({ where: { id }, data: { assignedToId } });
  await logAudit({
    session,
    action: "enquiry.assign",
    resourceType: "enquiry",
    resourceId: id,
    summary: assignedToId ? `Assigned to staff member` : "Assignment cleared",
  });
  redirect(`/admin/enquiries/${id}`);
}

export async function addEnquiryNote(formData: FormData) {
  const session = await gated("enquiries");
  const id = text(formData, "id");
  const body = text(formData, "note");
  if (body.length < 2) redirect(`/admin/enquiries/${id}?error=note`);
  await prisma.enquiryNote.create({
    data: { enquiryId: id, authorId: session.sub, body: body.slice(0, 4000) },
  });
  await logAudit({ session, action: "enquiry.note", resourceType: "enquiry", resourceId: id, summary: "Internal note added" });
  redirect(`/admin/enquiries/${id}`);
}

export async function deleteEnquiry(formData: FormData) {
  const session = await gated("enquiries");
  const id = text(formData, "id");
  await prisma.enquiry.delete({ where: { id } });
  await logAudit({ session, action: "enquiry.delete", resourceType: "enquiry", resourceId: id, summary: "Enquiry record deleted" });
  redirect("/admin/enquiries");
}

export async function findMediaReferences(url: string) {
  const [news, events, gallery, alumni, projects, staff, downloads, settings] = await Promise.all([
    prisma.newsArticle.count({
      where: { OR: [{ coverImageUrl: url }, { body: { contains: url } }] },
    }),
    prisma.eventItem.count({
      where: { OR: [{ coverImageUrl: url }, { body: { contains: url } }] },
    }),
    prisma.galleryItem.count({ where: { imageUrl: url } }),
    prisma.alumniStory.count({
      where: { OR: [{ coverImageUrl: url }, { body: { contains: url } }] },
    }),
    prisma.developmentProject.count({
      where: { OR: [{ coverImageUrl: url }, { body: { contains: url } }] },
    }),
    prisma.staffProfile.count({ where: { photoUrl: url } }),
    prisma.downloadItem.count({ where: { fileUrl: url } }),
    prisma.siteSettings.count({ where: { OR: [{ headTeacherPhotoUrl: url }, { ogImageUrl: url }] } }),
  ]);
  return news + events + gallery + alumni + projects + staff + downloads + settings;
}

export async function uploadMedia(formData: FormData) {
  const session = await gated("media");
  const file = formData.get("file");
  const redirectTo = text(formData, "redirectTo") || "/admin/media";
  if (!(file instanceof File) || file.size === 0) {
    redirect(`${redirectTo}?error=upload`);
  }
  const safety = isSafeUpload(file);
  if (!safety.ok) {
    redirect(`${redirectTo}?error=${encodeURIComponent(safety.message)}`);
  }
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${safety.ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);
  const url = `/uploads/${name}`;
  const asset = await prisma.mediaAsset.create({
    data: {
      title: text(formData, "title") || file.name,
      filename: name,
      url,
      mimeType: file.type,
      size: file.size,
      altText: text(formData, "altText") || null,
      caption: text(formData, "caption") || null,
      createdById: session.sub,
    },
  });
  await logAudit({ session, action: "media.upload", resourceType: "media", resourceId: asset.id, summary: asset.title });
  redirect(`${redirectTo}${redirectTo.includes("?") ? "&" : "?"}uploaded=${encodeURIComponent(url)}`);
}

export async function updateMedia(formData: FormData) {
  const session = await gated("media");
  const id = text(formData, "id");
  await prisma.mediaAsset.update({
    where: { id },
    data: {
      title: text(formData, "title"),
      altText: text(formData, "altText") || null,
      caption: text(formData, "caption") || null,
    },
  });
  await logAudit({ session, action: "media.update", resourceType: "media", resourceId: id, summary: "Media details updated" });
  redirect(`/admin/media?id=${id}&saved=1`);
}

export async function deleteMedia(formData: FormData) {
  const session = await gated("media");
  const id = text(formData, "id");
  const confirmDelete = bool(formData, "confirmReferenced");
  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) redirect("/admin/media");
  const references = await findMediaReferences(asset.url);
  if (references > 0 && !confirmDelete) {
    redirect(`/admin/media?id=${id}&referenced=${references}`);
  }
  try {
    await unlink(path.join(process.cwd(), "public", asset.url.replace(/^\//, "")));
  } catch {
    // File may already have been removed from disk.
  }
  await prisma.mediaAsset.delete({ where: { id } });
  await logAudit({
    session,
    action: "media.delete",
    resourceType: "media",
    resourceId: id,
    summary: references > 0 ? `Deleted with ${references} known references` : asset.title,
  });
  redirect("/admin/media?deleted=1");
}
