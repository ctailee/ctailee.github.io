import styles from "./aboutMePage.module.css";

type Education = {
    school: string;
    degree: string;
    focus?: string;
};

type Experience = {
    company: string;
    period: string;
    items: string[];
};

const education: Education[] = [
    {
        school: "國立臺灣大學 - 資訊管理研究所",
        degree: "碩士（2024.09 ~ Now）",
        focus: "研究方向：LLM、Agent、RAG、Knowledge Graph、XBRL、財報分析",
    },
    {
        school: "國立交通大學 - 資訊管理與財務金融學系 資管組",
        degree: "學士（2020.09 ~ 2024.06）",
    },
    {
        school: "新北市立板橋高中",
        degree: "高中（2016.09 ~ 2019.06）",
    },
];

const experiences: Experience[] = [
    {
        company: "元大證券 | 資訊系統開發部實習生",
        period: "2023.07 - 2023.09",
        items: [
            "使用 C# 開發交易 Log 異常監控系統，負責監視目錄內檔案變化。當有新的 Log 產生時，系統根據篩選條件將其發送至 gRPC Server，再由 Server 根據 Log 的 Topic 分發給訂閱該 Topic 的 Client。",
            "開發 Grpc 後端邏輯",
            "使用 winform 建立圖形化介面供使用者操作",
        ],
    },
    {
        company: "臺灣大哥大 | 智慧家庭開發課實習生",
        period: "2024.05 - 2024.09",
        items: [
            "撰寫 MyMoji 專案 API 測試",
            "報表工具的 PoC 研究，並使用 RPA 進行整合",
            "學習使用雲端平台",
        ],
    },
];

const skills = [
    { label: "Database", value: "MySQL, PostgreSQL, Redis" },
    { label: "Frontend", value: "React" },
    { label: "Backend", value: "Flask, FastAPI, Spring Boot, Gin" },
    { label: "Cloud & DevOps", value: "Docker, GCP, k8s" },
    { label: "Programming Languages", value: "Python, JAVA, Golang, C++" },
];

export default function AboutMePage() {
    return (
        <main className={styles.var}>
            <div className={styles.skyGlow} />

            <div className={styles.page}>
                <section className={styles.sectionPanel}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionLabel}>ACADEMY LOG</span>
                    </div>

                    <div className={styles.cardGrid}>
                        {education.map((item) => (
                            <article className={styles.card} key={item.school}>
                                <h3>{item.school}</h3>
                                <p>{item.degree}</p>
                                {item.focus && <p>{item.focus}</p>}
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.sectionPanel}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionLabel}>WORK QUESTS</span>
                    </div>

                    <div className={styles.cardGrid}>
                        {experiences.map((experience) => (
                            <article className={`${styles.card} ${styles.wideCard}`} key={experience.company}>
                                <h3>{experience.company}</h3>
                                <p>{experience.period}</p>
                                <ul>
                                    {experience.items.map((item) => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            </article>
                        ))}
                    </div>
                </section>

                <section className={styles.sectionPanel}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionLabel}>SKILL TREE</span>
                    </div>

                    <article className={`${styles.card} ${styles.wideCard}`}>
                        <ul className={styles.skillList}>
                            {skills.map((skill) => (
                                <li key={skill.label}>
                                    <strong>{skill.label}：</strong>
                                    {skill.value}
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>

                <section className={styles.sectionPanel}>
                    <div className={styles.sectionHeader}>
                        <span className={styles.sectionLabel}>PROJECT BOARD</span>
                    </div>

                    <article className={`${styles.card} ${styles.emptyQuest}`}>
                        <h3>Coming Soon</h3>
                        <p>作品與專案資訊預留於此區塊</p>
                    </article>
                </section>
            </div>
        </main>
    );
}
