import Skills from "../components/skills";
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

type QuestRecord = {
    id: string;
    type: "academy" | "work";
    title: string;
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

const questRecords: QuestRecord[] = [
    {
        id: "academy-ntu",
        type: "academy",
        title: education[0].school,
        period: education[0].degree,
        items: education[0].focus ? [education[0].focus] : [],
    },
    {
        id: "work-twm",
        type: "work",
        title: experiences[1].company,
        period: experiences[1].period,
        items: experiences[1].items,
    },
    {
        id: "work-yuanta",
        type: "work",
        title: experiences[0].company,
        period: experiences[0].period,
        items: experiences[0].items,
    },
    {
        id: "academy-nctu",
        type: "academy",
        title: education[1].school,
        period: education[1].degree,
        items: ["學習進階資訊技能，包括程式設計、資料庫管理、資料結構、演算法、網路、資安、作業系統等。"],
    },
    {
        id: "academy-pcsh",
        type: "academy",
        title: education[2].school,
        period: education[2].degree,
        items: ["完成主要學習階段，累積下一段冒險所需的基礎能力。"],
    },
];

export default function AboutMePage() {
    return (
        <main className={styles.realm}>
            <div className={styles.skyGlow} />

            <section className={styles.guildDesk} aria-label="About me adventurer profile">
                <section className={styles.openTome}>
                    <div className={styles.bookStrap} />

                    <section className={`${styles.bookPage} ${styles.skillPage}`}>
                        <div className={styles.pageHeader}>
                            <h2>技能</h2>
                        </div>
                        <Skills />
                    </section>

                    <section className={`${styles.bookPage} ${styles.questPage}`}>
                        <div className={styles.pageHeader}>
                            <h2>任務委託紀錄</h2>
                        </div>

                        <div className={styles.questLedger}>
                            {questRecords.map((record) => (
                                <article
                                    className={`${styles.questEntry} ${
                                        record.type === "work" ? styles.workQuest : styles.academyQuest
                                    }`}
                                    key={record.id}
                                >
                                    <div className={styles.questCopy}>
                                        <div className={styles.questMeta}>
                                            <time>{record.period}</time>
                                        </div>
                                        <h3>{record.title}</h3>
                                        <ul>
                                            {record.items.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                </section>
            </section>
        </main>
    );
}
