// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Public backend URL + publishable key baked in at build time so SSR never
// depends on runtime env bindings (which can be missing on a custom-domain
// worker and cause "supabaseUrl is required." 500s on every page).
// Set them in .env locally and in the Cloudflare build settings for deploys.
// There is deliberately no hard-coded fallback: this site must use its own
// Supabase project, never another site's.
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

// The public origin drives canonical URLs, sitemaps, robots.txt and JSON-LD.
// Require it for production builds so a deploy never claims another site's domain.
if (process.argv.includes("build") && !process.env.VITE_SITE_URL) {
  throw new Error("Missing VITE_SITE_URL (e.g. https://your-domain.com or your *.workers.dev URL).");
}

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const msg =
    "Missing SUPABASE_URL / SUPABASE_PUBLISHABLE_KEY (or VITE_ equivalents). Copy .env.example to .env and fill them in.";
  if (process.argv.includes("build")) throw new Error(msg);
  console.warn(`[config] ${msg}`);
}

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
      "process.env.SUPABASE_URL": JSON.stringify(SUPABASE_URL),
      "process.env.SUPABASE_PUBLISHABLE_KEY": JSON.stringify(SUPABASE_PUBLISHABLE_KEY),
    },
  },
});

