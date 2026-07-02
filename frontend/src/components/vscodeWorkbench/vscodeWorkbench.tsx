import { type ReactNode, useState } from "react";
import documentIcon from "../../assets/images/document.svg";
import MarkdownRenderer from "../markdownRenderer";
import ActivityBar from "./ActivityBar";
import ExplorerSidebar from "./ExplorerSidebar";
import SettingsDialog from "./SettingsDialog";
import type { ContentFile } from "./types";
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
    const [isContentsOpen, setIsContentsOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [openContentFolders, setOpenContentFolders] = useState<Set<string>>(() => new Set(["contents"]));
    const [selectedContentFile, setSelectedContentFile] = useState<ContentFile>();
    const [themeMode, setThemeMode] = useThemeMode();

    const toggleContentFolder = (path: string) => {
        setOpenContentFolders((currentFolders) => {
            const nextFolders = new Set(currentFolders);

            if (nextFolders.has(path)) {
                nextFolders.delete(path);
            } else {
                nextFolders.add(path);
            }

            return nextFolders;
        });
    };

    const activeTabTitle = selectedContentFile?.name ?? tabTitle;

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
                    isContentsOpen={isContentsOpen}
                    onSelectContentFile={setSelectedContentFile}
                    onToggleContents={() => setIsContentsOpen((open) => !open)}
                    openContentFolders={openContentFolders}
                    selectedContentPath={selectedContentFile?.path}
                    toggleContentFolder={toggleContentFolder}
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
                    {selectedContentFile ? <MarkdownRenderer markdown={selectedContentFile.markdown} /> : children}
                </section>
            </section>
        </main>
    );
}
