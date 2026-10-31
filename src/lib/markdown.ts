const allowedProtocols = ["http:", "https:", "mailto:", "tel:"];

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(href: string) {
  try {
    if (href.startsWith("/") || href.startsWith("#")) return href;
    const url = new URL(href);
    if (allowedProtocols.includes(url.protocol)) return href;
  } catch {
    return null;
  }
  return null;
}

function inline(text: string) {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, label, href) => {
      const safe = safeHref(href);
      if (!safe) return label;
      return `<a href="${escapeHtml(safe)}">${label}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

export function renderMarkdown(source: string) {
  const blocks = source.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const html = blocks
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("### ")) return `<h3>${inline(trimmed.slice(4))}</h3>`;
      if (trimmed.startsWith("## ")) return `<h2>${inline(trimmed.slice(3))}</h2>`;
      if (trimmed.startsWith("# ")) return `<h2>${inline(trimmed.slice(2))}</h2>`;
      if (trimmed.startsWith("> ")) {
        return `<blockquote>${inline(trimmed.replace(/^> /gm, ""))}</blockquote>`;
      }
      const lines = trimmed.split("\n");
      if (lines.every((line) => line.trim().startsWith("- "))) {
        const items = lines
          .map((line) => `<li>${inline(line.trim().slice(2))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }
      if (lines.every((line) => /^\d+\.\s/.test(line.trim()))) {
        const items = lines
          .map((line) => `<li>${inline(line.trim().replace(/^\d+\.\s/, ""))}</li>`)
          .join("");
        return `<ol>${items}</ol>`;
      }
      return `<p>${inline(lines.join(" "))}</p>`;
    })
    .join("\n");

  return html;
}
