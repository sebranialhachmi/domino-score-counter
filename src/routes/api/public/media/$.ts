import { createFileRoute } from "@tanstack/react-router";

// Public, cacheable image proxy for the private media-library bucket.

// Media types safe to render inline. SVG is deliberately excluded: it is still
// served as image/svg+xml (so <img> tags keep working) but as an attachment.
const INLINE_TYPES = new Set([
  "image/png", "image/jpeg", "image/gif", "image/webp", "image/avif", "image/x-icon",
  "image/vnd.microsoft.icon", "video/mp4", "video/webm", "application/pdf",
]);

export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = (params as Record<string, string>)._splat ?? "";
        const path = decodeURIComponent(raw);
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("media-library").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        // Files are served from the site's own origin, so never let an uploaded
        // file execute as a page: inline only for passive media types, force a
        // download for everything else (HTML, JS, SVG with scripts, …), and
        // sandbox anything that isn't passive media.
        const type = (data.type || "").toLowerCase().split(";")[0].trim();
        const inline = INLINE_TYPES.has(type);
        const headers: Record<string, string> = {
          "Content-Type": inline || type === "image/svg+xml" ? type : "application/octet-stream",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        };
        if (!inline) {
          // (Not applied to inline types: a sandbox CSP breaks the browser PDF viewer.)
          headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox";
          const name = path.split("/").pop()?.replace(/[^\w.-]/g, "_") || "file";
          headers["Content-Disposition"] = `attachment; filename="${name}"`;
        }
        return new Response(await data.arrayBuffer(), { headers });
      },
    },
  },
});
