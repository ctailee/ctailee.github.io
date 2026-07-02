export type ContentFile = {
    displayName: string;
    markdown: string;
    metadata: ContentMetadata;
    name: string;
    path: string;
};

export type ContentMetadata = {
    created_at?: string;
    tags?: string[];
    title?: string;
    updated_at?: string;
};

export type ContentTreeNode = {
    children: ContentTreeNode[];
    file?: ContentFile;
    name: string;
    path: string;
    type: "folder" | "file";
};

export type ThemeMode = "light" | "dark";
