import { type FormEvent, useState } from "react";
import VscodeWorkbench from "../components/vscodeWorkbench";
import styles from "./textCipherPage.module.css";

type CipherMode = "encrypt" | "decrypt";
type FieldErrors = Partial<Record<"password" | "plainText" | "encryptedText", string>>;

type ApiError = {
    message?: string;
    errors?: FieldErrors;
};

const TEXT_CIPHER_API_BASE_URL = "https://api.ctailee.com/project/textcipher";

export default function TextCipherPage() {
    const [mode, setMode] = useState<CipherMode>("encrypt");
    const [password, setPassword] = useState("");
    const [input, setInput] = useState("");
    const [result, setResult] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [requestError, setRequestError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [copyLabel, setCopyLabel] = useState("複製");

    const inputField = mode === "encrypt" ? "plainText" : "encryptedText";
    const inputLabel = mode === "encrypt" ? "原始文字" : "加密文字";
    const resultLabel = mode === "encrypt" ? "加密結果" : "解密結果";

    const switchMode = (nextMode: CipherMode) => {
        setMode(nextMode);
        setInput("");
        setResult("");
        setErrors({});
        setRequestError("");
        setCopyLabel("複製");
    };

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const nextErrors: FieldErrors = {};
        if (!password.trim()) nextErrors.password = "請輸入密碼";
        if (!input.trim()) nextErrors[inputField] = mode === "encrypt" ? "請輸入要加密的文字" : "請貼上要解密的文字";

        setErrors(nextErrors);
        setRequestError("");
        setResult("");
        if (Object.keys(nextErrors).length > 0) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`${TEXT_CIPHER_API_BASE_URL}/${mode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, [inputField]: input }),
            });
            const data = await response.json() as ApiError & { encryptedText?: string; plainText?: string };

            if (!response.ok) {
                setErrors(data.errors ?? {});
                setRequestError(data.message === "Unable to process the encrypted text"
                    ? "無法解密：請確認密碼與加密文字是否正確，且內容未被修改。"
                    : data.message ?? "處理失敗，請稍後再試。"
                );
                return;
            }

            setResult(mode === "encrypt" ? data.encryptedText ?? "" : data.plainText ?? "");
        } catch {
            setRequestError("無法連線至服務，請確認網路狀態後再試。")
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyResult = async () => {
        await navigator.clipboard.writeText(result);
        setCopyLabel("已複製");
        window.setTimeout(() => setCopyLabel("複製"), 1600);
    };

    return (
        <VscodeWorkbench ariaLabel="Text Cipher project" tabTitle="text-cipher">
            <div className={styles.page}>
                <header className={styles.intro}>
                    <div className={styles.mark} aria-hidden="true">TC</div>
                    <div>
                        <p className={styles.eyebrow}>PROJECT / SECURITY TOOL</p>
                        <h1>Text Cipher</h1>
                        <p>使用密碼安全地加密文字，或將 Text Cipher 產生的密文還原。</p>
                    </div>
                </header>

                <section className={styles.tool} aria-label="文字加解密工具">
                    <div className={styles.modeTabs} role="tablist" aria-label="操作模式">
                        <button className={mode === "encrypt" ? styles.activeMode : ""} type="button" role="tab" aria-selected={mode === "encrypt"} onClick={() => switchMode("encrypt")}>加密</button>
                        <button className={mode === "decrypt" ? styles.activeMode : ""} type="button" role="tab" aria-selected={mode === "decrypt"} onClick={() => switchMode("decrypt")}>解密</button>
                    </div>

                    <form className={styles.form} onSubmit={submit} noValidate>
                        <div className={styles.field}>
                            <div className={styles.labelRow}>
                                <label htmlFor="cipher-password">密碼</label>
                                <span>必填</span>
                            </div>
                            <div className={`${styles.passwordInput} ${errors.password ? styles.invalid : ""}`}>
                                <input id="cipher-password" type={showPassword ? "text" : "password"} value={password} autoComplete="current-password" placeholder={mode === "encrypt" ? "輸入加密使用的密碼" : "輸入解密使用的密碼"} onChange={(event) => setPassword(event.target.value)} />
                                <button type="button" onClick={() => setShowPassword((show) => !show)}>{showPassword ? "隱藏" : "顯示"}</button>
                            </div>
                            {errors.password && <p className={styles.fieldError}>{errors.password}</p>}
                        </div>

                        <div className={styles.field}>
                            <div className={styles.labelRow}>
                                <label htmlFor="cipher-input">{inputLabel}</label>
                                <span>必填</span>
                            </div>
                            <textarea id="cipher-input" className={errors[inputField] ? styles.invalid : ""} value={input} rows={8} spellCheck={mode === "encrypt"} placeholder={mode === "encrypt" ? "" : "貼上 pte1.pbkdf2-sha256… 格式的密文"} onChange={(event) => setInput(event.target.value)} />
                            {errors[inputField] && <p className={styles.fieldError}>{errors[inputField]}</p>}
                        </div>

                        {requestError && <div className={styles.requestError} role="alert">{requestError}</div>}

                        <div className={styles.actions}>
                            <p>此頁面不會儲存任何資訊</p>
                            <button className={styles.submitButton} type="submit" disabled={isSubmitting}>{isSubmitting ? "處理中…" : mode === "encrypt" ? "加密文字" : "解密文字"}</button>
                        </div>
                    </form>
                </section>

                <section className={`${styles.result} ${result ? styles.hasResult : ""}`} aria-live="polite">
                    <div className={styles.resultHeader}>
                        <div><span className={styles.statusDot} />{resultLabel}</div>
                        <button type="button" onClick={copyResult} disabled={!result}>{copyLabel}</button>
                    </div>
                    <pre>{result || (mode === "encrypt" ? "" : "")}</pre>
                </section>
            </div>
        </VscodeWorkbench>
    );
}
