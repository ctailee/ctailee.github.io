import VscodeWorkbench from "../components/vscodeWorkbench";
import styles from "./homePage.module.css";

export default function HomePage() {
    return (
        <VscodeWorkbench ariaLabel="VS Code welcome page" tabTitle="歡迎">
            <div className={styles.welcomeMessage}>Welcome to CT&apos;s Website</div>
        </VscodeWorkbench>
    );
}
