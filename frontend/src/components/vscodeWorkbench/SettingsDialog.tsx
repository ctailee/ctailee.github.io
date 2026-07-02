import type { ThemeMode } from "./types";
import styles from "./vscodeWorkbench.module.css";

type SettingsDialogProps = {
    onClose: () => void;
    onThemeChange: (themeMode: ThemeMode) => void;
    themeMode: ThemeMode;
};

export default function SettingsDialog({ onClose, onThemeChange, themeMode }: SettingsDialogProps) {
    return (
        <div className={styles.settingsOverlay} role="dialog" aria-label="Settings panel" onClick={onClose}>
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
                            onClick={() => onThemeChange("light")}
                        >
                            Light
                        </button>
                        <button
                            className={themeMode === "dark" ? styles.activeOption : ""}
                            type="button"
                            onClick={() => onThemeChange("dark")}
                        >
                            Dark
                        </button>
                    </div>
                </section>
            </section>
        </div>
    );
}
