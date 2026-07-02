import { type ReactNode, useState } from "react";
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

export default function VscodeWorkbench({
    ariaLabel,
    children,
    tabTitle,
    tabWidth = "default",
}: VscodeWorkbenchProps) {
    const [isExplorerOpen, setIsExplorerOpen] = useState(true);

    return (
        <main className={`${styles.vscode} ${isExplorerOpen ? styles.explorerOpen : ""}`}>
            <aside className={styles.activityBar} aria-label="VS Code activity bar">
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
            </aside>

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
