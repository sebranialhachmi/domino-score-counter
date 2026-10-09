// Isomorphic HTML utilities for the blog rich-text pipeline.
// Used both when saving (admin) and when rendering (SSR public page).

const ALLOWED_TAGS = new Set([
  "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "sub", "sup", "code", "pre",
  "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote",
  "a", "img", "figure", "figcaption",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "span", "div",
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "title", "target", "rel"]),
  img: new Set(["src", "alt", "title", "width", "height", "loading", "decoding"]),
  th: new Set(["colspan", "rowspan", "scope"]),
  td: new Set(["colspan", "rowspan"]),
  "*": new Set(["dir"]),
};

// Blocks that must never survive, including their content.
const STRIP_WITH_CONTENT = /<(script|style|iframe|object|embed|noscript|form|svg|math)\b[\s\S]*?<\/\1\s*>/gi;
const SELF_CLOSING_DANGEROUS = /<\/?(script|style|iframe|object|embed|noscript|form|input|button|link|meta|svg|math)\b[^>]*>/gi;

const NAMED_URL_ENTITIES: Record<string, string> = {
  colon: ":", tab: "\t", newline: "\n", sol: "/", lpar: "(", rpar: ")", amp: "&",
};

/** Decode the HTML entities a browser would decode inside an attribute value. */
function decodeEntities(value: string) {
  return value.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);?/gi, (m, ent: string) => {
    const e = ent.toLowerCase();
    if (e.startsWith("#x")) return String.fromCodePoint(parseInt(e.slice(2), 16) || 0xfffd);
    if (e.startsWith("#")) return String.fromCodePoint(parseInt(e.slice(1), 10) || 0xfffd);
    return NAMED_URL_ENTITIES[e] ?? m;
  });
}

// Allow-list of URL schemes. Relative URLs, fragments and query-only URLs have
// no scheme and are always allowed.
const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

function safeUrl(value: string) {
  const v = value.trim();
  // Normalise the way a browser would before resolving the scheme: decode
  // entities (e.g. "javascript&#58;") and drop whitespace/control characters
  // (e.g. "java\tscript:") that browsers ignore inside the scheme.
  // eslint-disable-next-line no-control-regex
  const normalised = decodeEntities(v).replace(/[\u0000-\u0020\u007f-\u009f]/g, "").toLowerCase();
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(normalised)?.[1];
  if (!scheme) return v;
  if (scheme === "data") return /^data:image\/(png|jpe?g|gif|webp|avif);/.test(normalised) ? v : "";
  return SAFE_SCHEMES.has(scheme) ? v : "";
}

function cleanAttrs(tag: string, raw: string) {
  const out: string[] = [];
  const re = /([a-zA-Z_:][-\w:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) {
    const name = m[1].toLowerCase();
    let value = m[3] ?? m[4] ?? m[5] ?? "";
    if (name.startsWith("on")) continue;
    const allowed = ALLOWED_ATTRS[tag]?.has(name) || ALLOWED_ATTRS["*"].has(name);
    if (!allowed) continue;
    if (name === "href" || name === "src") {
      value = safeUrl(value);
      if (!value) continue;
    }
    out.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
  }
  if (tag === "a") {
    const hasTarget = out.some((a) => a.startsWith("target="));
    if (hasTarget && !out.some((a) => a.startsWith("rel="))) out.push('rel="noopener noreferrer"');
  }
  if (tag === "img") {
    if (!out.some((a) => a.startsWith("loading="))) out.push('loading="lazy"');
    if (!out.some((a) => a.startsWith("decoding="))) out.push('decoding="async"');
    if (!out.some((a) => a.startsWith("alt="))) out.push('alt=""');
  }
  return out.length ? " " + out.join(" ") : "";
}

/**
 * Allow-list sanitizer. Keeps semantic article structure (headings, lists,
 * tables, links, images) and removes scripts, handlers and unsafe URLs.
 * H1 is downgraded to H2 so a post always has exactly one H1 (the title).
 */
export function sanitizeHtml(input: string | null | undefined): string {
  if (!input) return "";
  let html = String(input);
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(STRIP_WITH_CONTENT, "");
  html = html.replace(SELF_CLOSING_DANGEROUS, "");
  html = html.replace(/<h1\b([^>]*)>/gi, "<h2$1>").replace(/<\/h1\s*>/gi, "</h2>");

  html = html.replace(/<\/?([a-zA-Z][-\w]*)((?:[^>"']|"[^"]*"|'[^']*')*)>/g, (match, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase();
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (match.startsWith("</")) return `</${tag}>`;
    const selfClosing = /\/\s*$/.test(rawAttrs);
    return `<${tag}${cleanAttrs(tag, rawAttrs)}${selfClosing || tag === "br" || tag === "hr" || tag === "img" ? " /" : ""}>`;
  });

  return html.trim();
}

export function looksLikeHtml(value: string | null | undefined) {
  if (!value) return false;
  return /<(p|h2|h3|h4|ul|ol|li|table|blockquote|img|figure|div|strong|em|a)\b/i.test(value);
}

/** Backward compatibility: render legacy plain-text posts as paragraphs. */
export function plainTextToHtml(text: string | null | undefined) {
  if (!text) return "";
  return text
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

/** Content coming from the DB may be legacy plain text or rich HTML. */
export function renderableContent(value: string | null | undefined) {
  return looksLikeHtml(value) ? sanitizeHtml(value) : plainTextToHtml(value);
}
