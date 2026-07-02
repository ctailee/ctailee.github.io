import type { ReactNode } from "react";
import type { ContentMetadata } from "../vscodeWorkbench/types";
import styles from "./markdownRenderer.module.css";

type MarkdownRendererProps = {
    markdown: string;
    metadata?: ContentMetadata;
};

const renderInline = (text: string) => {
    const nodes: ReactNode[] = [];
    const tokenPattern = /(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/g;
    let cursor = 0;
    let match: RegExpExecArray | null;

    while ((match = tokenPattern.exec(text)) !== null) {
        if (match.index > cursor) {
            nodes.push(text.slice(cursor, match.index));
        }

        const token = match[0];

        if (token.startsWith("`")) {
            nodes.push(<code key={`${token}-${match.index}`}>{token.slice(1, -1)}</code>);
        } else {
            const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
            if (linkMatch) {
                nodes.push(
                    <a href={linkMatch[2]} key={`${token}-${match.index}`} rel="noreferrer" target="_blank">
                        {linkMatch[1]}
                    </a>,
                );
            }
        }

        cursor = match.index + token.length;
    }

    if (cursor < text.length) {
        nodes.push(text.slice(cursor));
    }

    return nodes;
};

export default function MarkdownRenderer({ markdown, metadata }: MarkdownRendererProps) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const blocks: React.ReactNode[] = [];
    let index = 0;

    while (index < lines.length) {
        const line = lines[index];

        if (!line.trim()) {
            index += 1;
            continue;
        }

        if (line.startsWith("```")) {
            const codeLines: string[] = [];
            index += 1;

            while (index < lines.length && !lines[index].startsWith("```")) {
                codeLines.push(lines[index]);
                index += 1;
            }

            blocks.push(
                <pre key={`code-${index}`}>
                    <code>{codeLines.join("\n")}</code>
                </pre>,
            );
            index += 1;
            continue;
        }

        const headingMatch = /^(#{1,3})\s+(.+)$/.exec(line);
        if (headingMatch) {
            const HeadingTag = `h${headingMatch[1].length}` as "h1" | "h2" | "h3";
            blocks.push(<HeadingTag key={`heading-${index}`}>{renderInline(headingMatch[2])}</HeadingTag>);
            index += 1;
            continue;
        }

        if (line.startsWith("> ")) {
            const quoteLines: string[] = [];

            while (index < lines.length && lines[index].startsWith("> ")) {
                quoteLines.push(lines[index].slice(2));
                index += 1;
            }

            blocks.push(<blockquote key={`quote-${index}`}>{quoteLines.map(renderInline)}</blockquote>);
            continue;
        }

        if (/^[-*]\s+/.test(line)) {
            const items: string[] = [];

            while (index < lines.length && /^[-*]\s+/.test(lines[index])) {
                items.push(lines[index].replace(/^[-*]\s+/, ""));
                index += 1;
            }

            blocks.push(
                <ul key={`list-${index}`}>
                    {items.map((item) => (
                        <li key={item}>{renderInline(item)}</li>
                    ))}
                </ul>,
            );
            continue;
        }

        const paragraphLines: string[] = [];

        while (
            index < lines.length &&
            lines[index].trim() &&
            !lines[index].startsWith("```") &&
            !/^(#{1,3})\s+/.test(lines[index]) &&
            !lines[index].startsWith("> ") &&
            !/^[-*]\s+/.test(lines[index])
        ) {
            paragraphLines.push(lines[index]);
            index += 1;
        }

        blocks.push(<p key={`paragraph-${index}`}>{renderInline(paragraphLines.join(" "))}</p>);
    }

    const hasMetadata = metadata?.updated_at || (metadata?.tags && metadata.tags.length > 0);

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
            {blocks}
        </article>
    );
}
