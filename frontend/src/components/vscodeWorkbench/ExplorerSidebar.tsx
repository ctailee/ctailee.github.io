import { Link } from "react-router";
import ArticleTreeItem from "./ArticleTreeItem";
import { articleTree } from "./articleTree";
import type { ArticleFile } from "./types";
import styles from "./vscodeWorkbench.module.css";

type ExplorerSidebarProps = {
    isArticlesOpen: boolean;
    onSelectNavigationLink: () => void;
    onSelectArticleFile: (file: ArticleFile) => void;
    onToggleArticles: () => void;
    openArticleFolders: Set<string>;
    selectedArticlePath?: string;
    toggleArticleFolder: (path: string) => void;
};

const navLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
];

export default function ExplorerSidebar({
    isArticlesOpen,
    onSelectNavigationLink,
    onSelectArticleFile,
    onToggleArticles,
    openArticleFolders,
    selectedArticlePath,
    toggleArticleFolder,
}: ExplorerSidebarProps) {
    return (
        <aside className={styles.explorer} aria-label="Explorer">
            <div className={styles.explorerTitle}>Explorer</div>
            <div className={styles.folderTitle}>CT</div>
            <nav className={styles.fileLinks}>
                {navLinks.map((link) => (
                    <Link to={link.to} key={link.to} onClick={onSelectNavigationLink}>
                        <span className={styles.linkArrow} aria-hidden="true" />
                        {link.label}
                    </Link>
                ))}
            </nav>
            <div className={styles.articlesExplorer}>
                <button className={styles.articlesToggle} type="button" aria-expanded={isArticlesOpen} onClick={onToggleArticles}>
                    <span className={`${styles.articleArrow} ${isArticlesOpen ? styles.openArticleArrow : ""}`} aria-hidden="true" />
                    <span>Articles</span>
                </button>
                {isArticlesOpen && (
                    <div className={styles.articlesTree}>
                        {articleTree.children.length > 0 ? (
                            articleTree.children.map((node) => (
                                <ArticleTreeItem
                                    key={node.path}
                                    node={node}
                                    onSelectFile={onSelectArticleFile}
                                    openFolders={openArticleFolders}
                                    selectedPath={selectedArticlePath}
                                    toggleFolder={toggleArticleFolder}
                                />
                            ))
                        ) : (
                            <p className={styles.emptyArticles}>No articles</p>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
