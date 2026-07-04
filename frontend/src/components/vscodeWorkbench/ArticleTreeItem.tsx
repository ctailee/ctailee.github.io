import documentIcon from "../../assets/images/document.svg";
import type { ArticleFile, ArticleTreeNode } from "./types";
import styles from "./vscodeWorkbench.module.css";

type ArticleTreeItemProps = {
    node: ArticleTreeNode;
    onSelectFile: (file: ArticleFile) => void;
    openFolders: Set<string>;
    selectedPath?: string;
    toggleFolder: (path: string) => void;
};

export default function ArticleTreeItem({
    node,
    onSelectFile,
    openFolders,
    selectedPath,
    toggleFolder,
}: ArticleTreeItemProps) {
    if (node.type === "file" && node.file) {
        return (
            <button
                className={`${styles.articleFile} ${selectedPath === node.file.path ? styles.activeArticleFile : ""}`}
                type="button"
                onClick={() => onSelectFile(node.file!)}
            >
                <img className={styles.articleIcon} src={documentIcon} alt="" aria-hidden="true" />
                <span>{node.name}</span>
            </button>
        );
    }

    const isOpen = openFolders.has(node.path);

    return (
        <div>
            <button className={styles.articleFolder} type="button" onClick={() => toggleFolder(node.path)}>
                <span className={`${styles.articleArrow} ${isOpen ? styles.openArticleArrow : ""}`} aria-hidden="true" />
                <span>{node.name}</span>
            </button>
            {isOpen && (
                <div className={styles.articleChildren}>
                    {node.children.map((child) => (
                        <ArticleTreeItem
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
