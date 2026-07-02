import { type ReactNode, useEffect, useState } from "react";
import { Link } from "react-router";
import styles from "./vscodeWorkbench.module.css";

type VscodeWorkbenchProps = {
    ariaLabel: string;
    children?: ReactNode;
    tabTitle: string;
    tabWidth?: "default" | "wide";
};

const navLinks = [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
];

const themeStorageKey = "ct-theme-mode";

const getStoredTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") {
        return "light";
    }

    return window.localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
};

export default function VscodeWorkbench({
    ariaLabel,
    children,
    tabTitle,
    tabWidth = "default",
}: VscodeWorkbenchProps) {
    const [isExplorerOpen, setIsExplorerOpen] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [themeMode, setThemeMode] = useState<"light" | "dark">(getStoredTheme);

    useEffect(() => {
        window.localStorage.setItem(themeStorageKey, themeMode);
    }, [themeMode]);

    return (
        <main className={`${styles.vscode} ${isExplorerOpen ? styles.explorerOpen : ""}`} data-theme={themeMode}>
            <aside className={styles.activityBar} aria-label="VS Code activity bar">
                <div className={styles.primaryActivities}>
                    <button
                        className={`${styles.activityButton} ${isExplorerOpen ? styles.active : ""}`}
                        type="button"
                        aria-label="檔案"
                        aria-expanded={isExplorerOpen}
                        title="檔案"
                        onClick={() => setIsExplorerOpen((open) => !open)}
                    >
                        <span className={styles.fileIcon} aria-hidden="true" />
                    </button>
                    <button className={styles.activityButton} type="button" aria-label="搜尋" title="搜尋">
                        <span className={styles.searchIcon} aria-hidden="true" />
                    </button>
                </div>

                <button
                    className={`${styles.activityButton} ${styles.settingsButton}`}
                    type="button"
                    aria-label="設定"
                    aria-expanded={isSettingsOpen}
                    title="設定"
                    onClick={() => setIsSettingsOpen((open) => !open)}
                >
                    <svg className={styles.settingsIcon} viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
                        <path d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.4-2.4 1a8.4 8.4 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.6A8.4 8.4 0 0 0 7 6.6l-2.4-1-2 3.4 2 1.5c-.1.5-.1 1-.1 1.5s0 1 .1 1.5l-2 1.5 2 3.4 2.4-1a8.4 8.4 0 0 0 2.6 1.5L10 21.5h4l.4-2.6a8.4 8.4 0 0 0 2.6-1.5l2.4 1 2-3.4-2-1.5Z" />
                    </svg>
                </button>
            </aside>

            {isSettingsOpen && (
                <div
                    className={styles.settingsOverlay}
                    role="dialog"
                    aria-label="Settings panel"
                    onClick={() => setIsSettingsOpen(false)}
                >
                    <section className={styles.settingsWindow} onClick={(event) => event.stopPropagation()}>
                        <aside className={styles.settingsSidebar}>
                            <button className={styles.activeSettingSection} type="button">
                                Color
                            </button>
                        </aside>
                        <section className={styles.settingsContent}>
                            <h2>Color</h2>
                            <div className={styles.optionButtons} role="group" aria-label="Theme mode">
                                <button
                                    className={themeMode === "light" ? styles.activeOption : ""}
                                    type="button"
                                    onClick={() => setThemeMode("light")}
                                >
                                    淺色
                                </button>
                                <button
                                    className={themeMode === "dark" ? styles.activeOption : ""}
                                    type="button"
                                    onClick={() => setThemeMode("dark")}
                                >
                                    深色
                                </button>
                            </div>
                        </section>
                    </section>
                </div>
            )}

            {isExplorerOpen && (
                <aside className={styles.explorer} aria-label="Explorer">
                    <div className={styles.explorerTitle}>EXPLORER</div>
                    <div className={styles.folderTitle}>CT</div>
                    <nav className={styles.fileLinks}>
                        {navLinks.map((link) => (
                            <Link to={link.to} key={link.to}>
                                <span className={styles.linkArrow} aria-hidden="true" />
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </aside>
            )}

            <section className={styles.shell} aria-label={ariaLabel}>
                <header className={styles.tabBar}>
                    <div className={`${styles.tab} ${tabWidth === "wide" ? styles.wideTab : ""}`}>
                        <span className={styles.smallLogo} aria-hidden="true" />
                        <span className={styles.tabTitle}>{tabTitle}</span>
                        <span className={styles.closeMark}>×</span>
                    </div>
                </header>

                <section className={styles.editor} aria-label={`${tabTitle} editor area`}>
                    {children}
                </section>
            </section>
        </main>
    );
}
