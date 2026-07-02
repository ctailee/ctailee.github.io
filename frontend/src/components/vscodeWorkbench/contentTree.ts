import type { ContentFile, ContentTreeNode } from "./types";

const contentModules = import.meta.glob("../../assets/contents/**/*.md", {
    eager: true,
    import: "default",
    query: "?raw",
}) as Record<string, string>;

export const contentFiles: ContentFile[] = Object.entries(contentModules)
    .map(([path, markdown]) => {
        const relativePath = path.split("/assets/contents/")[1];

        return {
            markdown,
            name: relativePath.split("/").at(-1) ?? relativePath,
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
                    name: segment,
                    path: nodePath,
                    type: "file",
                });
                return;
            }

            currentNode = getOrCreateFolder(currentNode.children, segment, nodePath);
        });
    });

    sortTree(root);

    return root.children;
};

export const contentTree = buildContentTree(contentFiles);
