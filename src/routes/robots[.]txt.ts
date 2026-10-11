// Server-rendered robots.txt so the Sitemap URL always follows the
// configured SITE.url. Change VITE_SITE_URL to update every environment.
import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE } from "@/lib/site-info";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const aiBots = [
          "GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot",
          "Claude-Web", "Google-Extended", "Applebot-Extended", "CCBot",
        ];
        const sitemaps = ["sitemap-index", "sitemap", "sitemap-posts", "sitemap-pages", "sitemap-categories", "sitemap-images"];
        const body = [
          `# robots.txt — ${SITE.domain}`,
          "",
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "Disallow: /admin/",
          "Disallow: /auth",
          "Disallow: /reset-password",
          "Disallow: /_authenticated/",
          "Disallow: /api/",
          "Disallow: /*%7B",
          "Disallow: /*{",
          "Disallow: /_public",
          "",
          "# AI / LLM crawlers are welcome (helps AI search visibility)",
          ...aiBots.flatMap((bot) => [`User-agent: ${bot}`, "Allow: /", ""]),
          ...sitemaps.map((name) => `Sitemap: ${SITE.url}/${name}.xml`),
          "",
        ].join("\n");
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
