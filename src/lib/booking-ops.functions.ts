// Booking & CRM operations — server functions.
import { createServerFn } from "@tanstack/react-start";
import { requireStaff } from "@/lib/staff-middleware";
import { z } from "zod";

type BookingStatus =
  | "pending" | "confirmed" | "assigned" | "en_route"
  | "on_trip" | "picked_up" | "completed" | "cancelled" | "no_show";

const BOOKING_STATUSES = [
  "pending", "confirmed", "assigned", "en_route",
  "on_trip", "picked_up", "completed", "cancelled", "no_show",
] as const satisfies readonly BookingStatus[];

const uuid = z.string().uuid();
const optionalUuid = uuid.nullish();

/** Duplicate an existing booking — copies everything except lifecycle timestamps + status. */
export const duplicateBooking = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator((d: { id: string }) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: src, error } = await supabase.from("bookings").select("*").eq("id", data.id).single();
    if (error) throw error;
    const copy: any = { ...src };
    delete copy.id; delete copy.code; delete copy.created_at; delete copy.updated_at;
    delete copy.started_at; delete copy.completed_at; delete copy.confirmed_at; delete copy.assigned_at;
    delete copy.cancelled_by; delete copy.cancellation_reason; delete copy.cancellation_category;
    copy.status = "pending";
    copy.driver_id = null; copy.vehicle_id = null;
    copy.pickup_at = new Date(Date.now() + 24 * 3600_000).toISOString();
    const { data: created, error: e2 } = await supabase.from("bookings").insert(copy).select("id, code").single();
    if (e2) throw e2;
    return created;
  });

/** Bulk status update. */
export const bulkUpdateBookings = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator((d: { ids: string[]; patch: { status?: BookingStatus; is_priority?: boolean; tags?: string[] } }) =>
    z.object({
      ids: z.array(uuid).max(500),
      // .strict() rejects any column other than these three.
      patch: z.object({
        status: z.enum(BOOKING_STATUSES).optional(),
        is_priority: z.boolean().optional(),
        tags: z.array(z.string().trim().max(50)).max(30).optional(),
      }).strict(),
    }).parse(d))
  .handler(async ({ data, context }) => {
    if (!data.ids.length) return { updated: 0 };
    const { error } = await context.supabase.from("bookings").update(data.patch as any).in("id", data.ids);
    if (error) throw error;
    return { updated: data.ids.length };
  });

/** Cancel booking with reason + category, log to activity, set cancelled_by. */
export const cancelBooking = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator((d: { id: string; reason: string; category?: string | null }) =>
    z.object({
      id: uuid,
      reason: z.string().trim().min(1).max(1000),
      category: z.string().trim().max(80).nullish(),
    }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("bookings").update({
      status: "cancelled",
      cancellation_reason: data.reason,
      cancellation_category: data.category ?? null,
      cancelled_by: userId,
    } as any).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

/** Add a booking note. */
export const addBookingNote = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator((d: { booking_id: string; body: string; pinned?: boolean }) =>
    z.object({
      booking_id: uuid,
      body: z.string().trim().min(1).max(5000),
      pinned: z.boolean().optional(),
    }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("booking_notes").insert({
      booking_id: data.booking_id,
      body: data.body,
      pinned: data.pinned ?? false,
      author_id: context.userId,
    });
    if (error) throw error;
    return { ok: true };
  });

/** Log a WhatsApp send (called after the deep link opens). */
export const logWhatsAppMessage = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator((d: {
    phone: string; body: string; locale?: "en" | "ar";
    template_code?: string | null;
    booking_id?: string | null; customer_id?: string | null; contact_id?: string | null;
  }) =>
    z.object({
      phone: z.string().trim().min(1).max(40),
      body: z.string().max(10000),
      locale: z.enum(["en", "ar"]).optional(),
      template_code: z.string().trim().max(80).nullish(),
      booking_id: optionalUuid,
      customer_id: optionalUuid,
      contact_id: optionalUuid,
    }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("whatsapp_messages").insert({
      phone: data.phone,
      body: data.body,
      locale: data.locale ?? "en",
      template_code: data.template_code ?? null,
      booking_id: data.booking_id ?? null,
      customer_id: data.customer_id ?? null,
      contact_id: data.contact_id ?? null,
      sent_by: context.userId,
    });
    if (error) throw error;
    return { ok: true };
  });

/** Schedule a booking reminder. */
export const scheduleBookingReminder = createServerFn({ method: "POST" })
  .middleware([requireStaff])
  .inputValidator((d: { booking_id: string; remind_at: string; note?: string | null; channel?: string }) =>
    z.object({
      booking_id: uuid,
      remind_at: z.string().datetime({ offset: true }),
      note: z.string().trim().max(1000).nullish(),
      channel: z.string().trim().max(30).optional(),
    }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("booking_reminders").insert({
      booking_id: data.booking_id,
      remind_at: data.remind_at,
      note: data.note ?? null,
      channel: data.channel ?? "whatsapp",
      created_by: context.userId,
    });
    if (error) throw error;
    return { ok: true };
  });
