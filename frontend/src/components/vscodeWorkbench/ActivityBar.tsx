import documentSearchIcon from "../../assets/images/document_search.svg";
import folderIcon from "../../assets/images/folder.svg";
import styles from "./vscodeWorkbench.module.css";

type ActivityBarProps = {
    isExplorerOpen: boolean;
    isSettingsOpen: boolean;
    onToggleExplorer: () => void;
    onToggleSettings: () => void;
};

export default function ActivityBar({
    isExplorerOpen,
    isSettingsOpen,
    onToggleExplorer,
    onToggleSettings,
}: ActivityBarProps) {
    return (
        <aside className={styles.activityBar} aria-label="VS Code activity bar">
            <div className={styles.primaryActivities}>
                <button
                    className={`${styles.activityButton} ${isExplorerOpen ? styles.active : ""}`}
                    type="button"
                    aria-label="檔案"
                    aria-expanded={isExplorerOpen}
                    title="檔案"
                    onClick={onToggleExplorer}
                >
                    <img className={styles.activityIcon} src={folderIcon} alt="" aria-hidden="true" />
                </button>
                <button className={styles.activityButton} type="button" aria-label="搜尋" title="搜尋">
                    <img className={styles.activityIcon} src={documentSearchIcon} alt="" aria-hidden="true" />
                </button>
            </div>

            <button
                className={`${styles.activityButton} ${styles.settingsButton}`}
                type="button"
                aria-label="設定"
                aria-expanded={isSettingsOpen}
                title="設定"
                onClick={onToggleSettings}
            >
                <svg className={styles.settingsIcon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                    <path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.4-2.4 1a8.4 8.4 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.6A8.4 8.4 0 0 0 7 6.6l-2.4-1-2 3.4 2 1.5c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2 1.5 2 3.4 2.4-1a8.4 8.4 0 0 0 2.6 1.5L10 21.5h4l.4-2.6a8.4 8.4 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5Z" />
                </svg>
            </button>
        </aside>
    );
}
