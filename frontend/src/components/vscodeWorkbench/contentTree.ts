import type { ContentFile, ContentMetadata, ContentTreeNode } from "./types";

const contentModules = import.meta.glob("../../assets/contents/**/*.md", {
    eager: true,
    import: "default",
    query: "?raw",
}) as Record<string, string>;

const parseFrontmatter = (markdown: string) => {
    const match = /^---\n([\s\S]*?)\n---\n?/.exec(markdown);

    if (!match) {
        return {
            body: markdown,
            metadata: {},
        };
    }

    const metadata: ContentMetadata = {};

    match[1].split("\n").forEach((line) => {
        const separatorIndex = line.indexOf(":");

        if (separatorIndex === -1) {
            return;
        }

        const key = line.slice(0, separatorIndex).trim();
        const rawValue = line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

        if (!key) {
            return;
        }

        if (key === "tags") {
            metadata.tags = rawValue
                .replace(/^\[|\]$/g, "")
                .split(",")
                .map((tag) => tag.trim().replace(/^["']|["']$/g, ""))
                .filter(Boolean);
            return;
        }

        if (key === "title" || key === "created_at" || key === "updated_at") {
            metadata[key] = rawValue;
        }
    });

    return {
        body: markdown.slice(match[0].length),
        metadata,
    };
};

export const contentFiles: ContentFile[] = Object.entries(contentModules)
    .map(([path, markdown]) => {
        const relativePath = path.split("/assets/contents/")[1];
        const { body, metadata } = parseFrontmatter(markdown);
        const heading = body.match(/^#\s+(.+)$/m)?.[1].trim();
        const filename = relativePath.split("/").at(-1) ?? relativePath;
        const title = metadata.title;

        return {
            displayName: title || heading || filename.replace(/\.md$/i, ""),
            markdown: body,
            metadata,
            name: filename,
            path: relativePath,
        };
    })
    .sort((a, b) => a.path.localeCompare(b.path));

const getOrCreateFolder = (children: ContentTreeNode[], name: string, path: string) => {
    let folder = children.find((child) => child.type === "folder" && child.path === path);

    if (!folder) {
        folder = {
            children: [],
            name,
            path,
            type: "folder",
        };
        children.push(folder);
    }

    return folder;
};

const sortTree = (node: ContentTreeNode) => {
    node.children.sort((a, b) => {
        if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
        }

        return a.name.localeCompare(b.name);
    });
    node.children.forEach(sortTree);
};

export const buildContentTree = (files: ContentFile[]) => {
    const root: ContentTreeNode = {
        children: [],
        name: "contents",
        path: "contents",
        type: "folder",
    };

    files.forEach((file) => {
        const segments = file.path.split("/");
        let currentNode = root;

        segments.forEach((segment, index) => {
            const nodePath = segments.slice(0, index + 1).join("/");
            const isFile = index === segments.length - 1;

            if (isFile) {
                currentNode.children.push({
                    children: [],
                    file,
                    name: file.displayName,
                    path: nodePath,
                    type: "file",
                });
                return;
            }

            currentNode = getOrCreateFolder(currentNode.children, segment, nodePath);
        });
    });

    sortTree(root);

    return root;
};

export const contentTree = buildContentTree(contentFiles);
