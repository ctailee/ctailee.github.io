import "highlight.js/styles/github.min.css";
import MarkdownIt from "markdown-it";
import type { ArticleMetadata } from "../vscodeWorkbench/types";
import { highlightMarkdownCode } from "./codeHighlighter";
import styles from "./markdownRenderer.module.css";

type MarkdownRendererProps = {
    markdown: string;
    metadata?: ArticleMetadata;
};

const markdownParser = new MarkdownIt({
    html: false,
    highlight: highlightMarkdownCode,
    linkify: true,
    typographer: true,
});

function createHeadingSlug(heading: string) {
    return heading
        .normalize("NFKC")
        .toLowerCase()
        .trim()
        .replace(/[^\p{Letter}\p{Number}\p{Mark}\s_-]/gu, "")
        .replace(/\s+/g, "-");
}

markdownParser.core.ruler.push("heading_anchors", (state) => {
    const usedSlugs = new Map<string, number>();

    state.tokens.forEach((token, index) => {
        if (token.type !== "heading_open") {
            return;
        }

        const heading = state.tokens[index + 1];
        const baseSlug = createHeadingSlug(heading?.content ?? "") || "section";
        const duplicateCount = usedSlugs.get(baseSlug) ?? 0;
        const slug = duplicateCount === 0 ? baseSlug : `${baseSlug}-${duplicateCount}`;

        usedSlugs.set(baseSlug, duplicateCount + 1);
        token.attrSet("id", slug);
    });
});

const defaultLinkOpenRenderer =
    markdownParser.renderer.rules.link_open ??
    ((tokens, index, options, _env, self) => self.renderToken(tokens, index, options));

markdownParser.renderer.rules.link_open = (tokens, index, options, env, self) => {
    const href = tokens[index].attrGet("href") ?? "";

    if (!href.startsWith("#")) {
        tokens[index].attrSet("target", "_blank");
        tokens[index].attrSet("rel", "noreferrer");
    }

    return defaultLinkOpenRenderer(tokens, index, options, env, self);
};

export default function MarkdownRenderer({ markdown, metadata }: MarkdownRendererProps) {
    const hasMetadata = metadata?.updated_at || (metadata?.tags && metadata.tags.length > 0);
    const html = markdownParser.render(markdown);

    return (
        <article className={styles.markdown}>
            {hasMetadata && (
                <header className={styles.metadata}>
                    {metadata?.updated_at && <time>Updated at {metadata.updated_at}</time>}
                    {metadata?.tags && metadata.tags.length > 0 && (
                        <div className={styles.tags} aria-label="Tags">
                            {metadata.tags.map((tag) => (
                                <span key={tag}>{tag}</span>
                            ))}
                        </div>
                    )}
                </header>
            )}
            <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>
    );
}
