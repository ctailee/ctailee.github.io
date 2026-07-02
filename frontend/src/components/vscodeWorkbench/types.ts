export type ContentFile = {
    markdown: string;
    name: string;
    path: string;
};

export type ContentTreeNode = {
    children: ContentTreeNode[];
    file?: ContentFile;
    name: string;
    path: string;
    type: "folder" | "file";
};

export type ThemeMode = "light" | "dark";
