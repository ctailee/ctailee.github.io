import documentIcon from "../../assets/images/document.svg";
import type { ContentFile, ContentTreeNode } from "./types";
import styles from "./vscodeWorkbench.module.css";

type ContentTreeItemProps = {
    node: ContentTreeNode;
    onSelectFile: (file: ContentFile) => void;
    openFolders: Set<string>;
    selectedPath?: string;
    toggleFolder: (path: string) => void;
};

export default function ContentTreeItem({
    node,
    onSelectFile,
    openFolders,
    selectedPath,
    toggleFolder,
}: ContentTreeItemProps) {
    if (node.type === "file" && node.file) {
        return (
            <button
                className={`${styles.contentFile} ${selectedPath === node.file.path ? styles.activeContentFile : ""}`}
                type="button"
                onClick={() => onSelectFile(node.file!)}
            >
                <img className={styles.contentIcon} src={documentIcon} alt="" aria-hidden="true" />
                <span>{node.name}</span>
            </button>
        );
    }

    const isOpen = openFolders.has(node.path);

    return (
        <div>
            <button className={styles.contentFolder} type="button" onClick={() => toggleFolder(node.path)}>
                <span className={`${styles.contentArrow} ${isOpen ? styles.openContentArrow : ""}`} aria-hidden="true" />
                <span>{node.name}</span>
            </button>
            {isOpen && (
                <div className={styles.contentChildren}>
                    {node.children.map((child) => (
                        <ContentTreeItem
                            key={child.path}
                            node={child}
                            onSelectFile={onSelectFile}
                            openFolders={openFolders}
                            selectedPath={selectedPath}
                            toggleFolder={toggleFolder}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
