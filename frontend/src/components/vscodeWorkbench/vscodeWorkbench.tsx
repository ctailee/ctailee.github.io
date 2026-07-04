import { type ReactNode, useState } from "react";
import documentIcon from "../../assets/images/document.svg";
import MarkdownRenderer from "../markdownRenderer";
import ActivityBar from "./ActivityBar";
import ExplorerSidebar from "./ExplorerSidebar";
import SettingsDialog from "./SettingsDialog";
import type { ArticleFile } from "./types";
import { useThemeMode } from "./useThemeMode";
import styles from "./vscodeWorkbench.module.css";

type VscodeWorkbenchProps = {
    ariaLabel: string;
    children?: ReactNode;
    tabTitle: string;
    tabWidth?: "default" | "wide";
};

export default function VscodeWorkbench({
    ariaLabel,
    children,
    tabTitle,
    tabWidth = "default",
}: VscodeWorkbenchProps) {
    const [isExplorerOpen, setIsExplorerOpen] = useState(true);
    const [isArticlesOpen, setIsArticlesOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [openArticleFolders, setOpenArticleFolders] = useState<Set<string>>(() => new Set(["articles"]));
    const [selectedArticleFile, setSelectedArticleFile] = useState<ArticleFile>();
    const [themeMode, setThemeMode] = useThemeMode();

    const toggleArticleFolder = (path: string) => {
        setOpenArticleFolders((currentFolders) => {
            const nextFolders = new Set(currentFolders);

            if (nextFolders.has(path)) {
                nextFolders.delete(path);
            } else {
                nextFolders.add(path);
            }

            return nextFolders;
        });
    };

    const activeTabTitle = selectedArticleFile ? `${selectedArticleFile.displayName}.md` : tabTitle;

    return (
        <main className={`${styles.vscode} ${isExplorerOpen ? styles.explorerOpen : ""}`} data-theme={themeMode}>
            <ActivityBar
                isExplorerOpen={isExplorerOpen}
                isSettingsOpen={isSettingsOpen}
                onToggleExplorer={() => setIsExplorerOpen((open) => !open)}
                onToggleSettings={() => setIsSettingsOpen((open) => !open)}
            />

            {isSettingsOpen && (
                <SettingsDialog
                    onClose={() => setIsSettingsOpen(false)}
                    onThemeChange={setThemeMode}
                    themeMode={themeMode}
                />
            )}

            {isExplorerOpen && (
                <ExplorerSidebar
                    isArticlesOpen={isArticlesOpen}
                    onSelectNavigationLink={() => setSelectedArticleFile(undefined)}
                    onSelectArticleFile={setSelectedArticleFile}
                    onToggleArticles={() => setIsArticlesOpen((open) => !open)}
                    openArticleFolders={openArticleFolders}
                    selectedArticlePath={selectedArticleFile?.path}
                    toggleArticleFolder={toggleArticleFolder}
                />
            )}

            <section className={styles.shell} aria-label={ariaLabel}>
                <header className={styles.tabBar}>
                    <div className={`${styles.tab} ${tabWidth === "wide" ? styles.wideTab : ""}`}>
                        <img className={styles.tabIcon} src={documentIcon} alt="" aria-hidden="true" />
                        <span className={styles.tabTitle}>{activeTabTitle}</span>
                        <span className={styles.closeMark}>×</span>
                    </div>
                </header>

                <section className={styles.editor} aria-label={`${activeTabTitle} editor area`}>
                    {selectedArticleFile ? (
                        <MarkdownRenderer markdown={selectedArticleFile.markdown} metadata={selectedArticleFile.metadata} />
                    ) : (
                        children
                    )}
                </section>
            </section>
        </main>
    );
}
