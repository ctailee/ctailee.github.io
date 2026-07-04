export type ArticleFile = {
    displayName: string;
    markdown: string;
    metadata: ArticleMetadata;
    name: string;
    path: string;
};

export type ArticleMetadata = {
    created_at?: string;
    tags?: string[];
    title?: string;
    updated_at?: string;
};

export type ArticleTreeNode = {
    children: ArticleTreeNode[];
    file?: ArticleFile;
    name: string;
    path: string;
    type: "folder" | "file";
};

export type ThemeMode = "light" | "dark";
