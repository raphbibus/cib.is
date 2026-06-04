/**
 * First-paragraph excerpt (R10/R15/AC7, TD4).
 *
 * Derives a plain-text excerpt from the first prose paragraph of a Markdown
 * body. Used both for the index card and the per-post SEO/OG `description`, so
 * the truncation length is shared (EXCERPT_MAX).
 */
export const EXCERPT_MAX = 160;

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → label
    .replace(/`([^`]*)`/g, '$1') // inline code
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // italics
    .replace(/\s+/g, ' ') // collapse soft breaks / runs of whitespace
    .trim();
}

export function firstParagraph(markdown: string): string {
  const blocks = markdown.split(/\n\s*\n/);
  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;
    if (block.startsWith('#')) continue; // skip headings
    const text = stripInlineMarkdown(block);
    if (!text) continue;
    return text.length > EXCERPT_MAX ? text.slice(0, EXCERPT_MAX - 1).trimEnd() + '…' : text;
  }
  return '';
}
