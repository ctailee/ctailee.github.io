import { Link } from "react-router";
import ContentTreeItem from "./ContentTreeItem";
import { contentTree } from "./contentTree";
import type { ContentFile } from "./types";
import styles from "./vscodeWorkbench.module.css";

type ExplorerSidebarProps = {
    isContentsOpen: boolean;
    onSelectContentFile: (file: ContentFile) => void;
    onToggleContents: () => void;
    openContentFolders: Set<string>;
    selectedContentPath?: string;
    toggleContentFolder: (path: string) => void;
};

const navLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
];

export default function ExplorerSidebar({
    isContentsOpen,
    onSelectContentFile,
    onToggleContents,
    openContentFolders,
    selectedContentPath,
    toggleContentFolder,
}: ExplorerSidebarProps) {
    return (
        <aside className={styles.explorer} aria-label="Explorer">
            <div className={styles.explorerTitle}>Explorer</div>
            <div className={styles.folderTitle}>CT</div>
            <nav className={styles.fileLinks}>
                {navLinks.map((link) => (
                    <Link to={link.to} key={link.to}>
                        <span className={styles.linkArrow} aria-hidden="true" />
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div className={styles.contentsExplorer}>
                <button className={styles.contentsToggle} type="button" aria-expanded={isContentsOpen} onClick={onToggleContents}>
                    <span className={`${styles.contentArrow} ${isContentsOpen ? styles.openContentArrow : ""}`} aria-hidden="true" />
                    <span>Contents</span>
                </button>
                {isContentsOpen && (
                    <div className={styles.contentsTree}>
                        {contentTree.length > 0 ? (
                            contentTree.map((node) => (
                                <ContentTreeItem
                                    key={node.path}
                                    node={node}
                                    onSelectFile={onSelectContentFile}
                                    openFolders={openContentFolders}
                                    selectedPath={selectedContentPath}
                                    toggleFolder={toggleContentFolder}
                                />
                            ))
                        ) : (
                            <p className={styles.emptyContents}>No markdown files</p>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
