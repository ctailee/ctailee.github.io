import { type FormEvent, useState } from "react";
import VscodeWorkbench from "../components/vscodeWorkbench";
import styles from "./urlShortenerPage.module.css";

type ShortenUrlResponse = {
    shortCode: string;
};

type ApiErrorResponse = {
    message: string;
    errors: Record<string, string>;
};

const URL_SHORTENER_API_URL = "https://api.ctailee.com/project/shorturl/shortenurl";
const SHORT_URL_BASE = "https://s.ctailee.com";

export default function UrlShortenerPage() {
    const [originalUrl, setOriginalUrl] = useState("");
    const [shortUrl, setShortUrl] = useState("");
    const [fieldError, setFieldError] = useState("");
    const [requestError, setRequestError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copyLabel, setCopyLabel] = useState("複製");

    const submit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const normalizedUrl = originalUrl.trim();

        setFieldError("");
        setRequestError("");
        setShortUrl("");
        setCopyLabel("複製");

        if (!normalizedUrl) {
            setFieldError("請輸入要縮短的網址");
            return;
        }

        try {
            const parsedUrl = new URL(normalizedUrl);
            if (!["http:", "https:"].includes(parsedUrl.protocol)) {
                setFieldError("網址必須使用 http 或 https");
                return;
            }
        } catch {
            setFieldError("請輸入完整且有效的網址");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(URL_SHORTENER_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ originalUrl: normalizedUrl }),
            });
            const data = await response.json() as ShortenUrlResponse | ApiErrorResponse;

            if (!response.ok) {
                const error = data as ApiErrorResponse;
                if (response.status === 400 && error.errors?.originalUrl) {
                    setFieldError(error.errors.originalUrl);
                } else {
                    setRequestError(error.message ?? "建立短網址失敗，請稍後再試。");
                }
                return;
            }

            const { shortCode } = data as ShortenUrlResponse;
            if (!shortCode) {
                setRequestError("後端未傳回 shortcode，請稍後再試。");
                return;
            }

            setShortUrl(`${SHORT_URL_BASE}/${shortCode}`);
        } catch {
            setRequestError("無法連線至服務，請確認網路狀態後再試。");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyShortUrl = async () => {
        if (!shortUrl) return;
        await navigator.clipboard.writeText(shortUrl);
        setCopyLabel("已複製");
        window.setTimeout(() => setCopyLabel("複製"), 1600);
    };

    return (
        <VscodeWorkbench ariaLabel="URL Shortener project" tabTitle="url-shortener">
            <div className={styles.page}>
                <header className={styles.intro}>
                    <div className={styles.mark} aria-hidden="true">↗</div>
                    <div>
                        <p className={styles.eyebrow}>PROJECT / WEB TOOL</p>
                        <h1>URL Shortener</h1>
                        <p>貼上冗長網址，快速建立一個容易分享的短連結。</p>
                    </div>
                </header>

                <section className={styles.tool} aria-label="網址縮短工具">
                    <div className={styles.toolHeader}>
                        <span className={styles.statusDot} aria-hidden="true" />
                        <span>建立短網址</span>
                    </div>

                    <form className={styles.form} onSubmit={submit} noValidate>
                        <div className={styles.field}>
                            <div className={styles.labelRow}>
                                <label htmlFor="original-url">原始網址</label>
                                <span>必填</span>
                            </div>
                            <input
                                id="original-url"
                                className={fieldError ? styles.invalid : ""}
                                type="url"
                                inputMode="url"
                                autoComplete="url"
                                placeholder="https://example.com/your/very/long/url"
                                value={originalUrl}
                                onChange={(event) => setOriginalUrl(event.target.value)}
                            />
                            {fieldError && <p className={styles.fieldError}>{fieldError}</p>}
                        </div>

                        <div className={styles.field}>
                            <div className={styles.labelRow}>
                                <label htmlFor="short-url">短網址</label>
                                <span>由系統產生</span>
                            </div>
                            <div className={`${styles.resultInput} ${shortUrl ? styles.hasResult : ""}`}>
                                <input
                                    id="short-url"
                                    type="text"
                                    readOnly
                                    value={shortUrl}
                                    placeholder="https://s.ctailee.com/shortcode"
                                    aria-live="polite"
                                />
                                <button type="button" onClick={copyShortUrl} disabled={!shortUrl}>
                                    {copyLabel}
                                </button>
                            </div>
                        </div>

                        {requestError && <div className={styles.requestError} role="alert">{requestError}</div>}

                        <div className={styles.actions}>
                            <p>短網址將使用 s.ctailee.com 網域</p>
                            <div className={styles.actionButtons}>
                                {shortUrl && (
                                    <a href={shortUrl} target="_blank" rel="noreferrer">
                                        開啟連結
                                    </a>
                                )}
                                <button className={styles.submitButton} type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "建立中…" : "建立短網址"}
                                </button>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
        </VscodeWorkbench>
    );
}
