import VscodeWorkbench from "../components/vscodeWorkbench";
import styles from "./aboutMePage.module.css";

type Experience = {
    period: string;
    institution: string;
    department?: string;
    position?: string;
    isSimple?: boolean;
    items: string[];
};

const skillGroups = [
    {
        title: "Programming",
        items: ["Python", "Java", "Golang", "C#", "C++"],
    },
    {
        title: "Frontend",
        items: ["React", "TypeScript", "CSS Modules"],
    },
    {
        title: "Backend",
        items: ["Flask", "FastAPI", "Spring Boot", "Gin", "gRPC"],
    },
    {
        title: "Cloud / Data",
        items: ["Docker", "Kubernetes", "GCP", "MySQL", "PostgreSQL", "Redis"],
    },
    {
        title: "Research",
        items: ["LLM", "Agent", "RAG", "Knowledge Graph", "XBRL", "Financial Reports"],
    },
];

const experiences: Experience[] = [
    {
        period: "2024-09 ~ 2026-06",
        institution: "國立臺灣大學",
        department: "資訊管理研究所",
        position: "碩士",
        items: [
            "研究方向：LLM、Agent、RAG、Knowledge Graph、XBRL、財報分析",
        ],
    },
    {
        period: "2024-05 ~ 2024-09",
        institution: "臺灣大哥大",
        department: "智慧家庭開發課",
        position: "實習生",
        items: [
            "撰寫 MyMoji 專案 API 測試",
            "報表工具的 PoC 研究，並使用 RPA 進行整合",
            "學習使用雲端平台",
        ],
    },
    {
        period: "2023-07 ~ 2023-09",
        institution: "元大證券",
        department: "資訊系統開發部",
        position: "實習生",
        items: [
            "使用 C# 開發交易 Log 異常監控系統，負責監視目錄內檔案變化",
            "開發 gRPC 後端邏輯",
            "使用 WinForms 建立圖形化介面供使用者操作",
        ],
    },
    {
        period: "2020-09 ~ 2024-06",
        institution: "國立交通大學",
        department: "資訊管理與財務金融學系 資管組",
        position: "學士",
        items: [
            "學習進階資訊技能，包括程式設計、資料庫管理、資料結構、演算法、網路、資安、作業系統等",
        ],
    },
    {
        period: "2016-09 ~ 2019-06",
        institution: "新北市立板橋高中",
        isSimple: true,
        items: [
            "完成主要學習階段，累積下一段學習與開發所需的基礎能力",
        ],
    },
];

export default function AboutMePage() {
    return (
        <VscodeWorkbench ariaLabel="VS Code about page" tabTitle="about_me.ts" tabWidth="wide">
            <div className={styles.contentPanel}>
                <div className={styles.profileActions}>
                    <a className={styles.githubButton} href="https://github.com/CT-12" target="_blank" rel="noreferrer">
                        GitHub
                    </a>
                </div>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <span>01</span>
                        <h1>Skills</h1>
                    </div>
                    <div className={styles.skillGrid}>
                        {skillGroups.map((group) => (
                            <article className={styles.skillGroup} key={group.title}>
                                <h2>{group.title}</h2>
                                <div className={styles.tags}>
                                    {group.items.map((item) => (
                                        <span key={item}>{item}</span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <span>02</span>
                        <h1>Experience</h1>
                    </div>
                    <div className={styles.timeline}>
                        {experiences.map((experience) => (
                            <article className={styles.experienceCard} key={`${experience.period}-${experience.institution}`}>
                                <div className={styles.experienceMeta}>
                                    <time>{experience.period}</time>
                                    <h2>{experience.institution}</h2>
                                    {!experience.isSimple && experience.department && <p>{experience.department}</p>}
                                    {!experience.isSimple && experience.position && <p>{experience.position}</p>}
                                </div>
                                <ul>
                                    {experience.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </VscodeWorkbench>
    );
}
