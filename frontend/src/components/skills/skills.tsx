import styles from "./skills.module.css";
import { useRef, useState } from "react";

// Import images
import RunningImg from "../../assets/skill_images/life/running.png";
import SwimmingImg from "../../assets/skill_images/life/swimming.png";
import BadmintonImg from "../../assets/skill_images/life/badminton.png";
import BaseballImg from "../../assets/skill_images/life/baseball.png";
import GameImg from "../../assets/skill_images/life/gaming.png";
import PythonImg from "../../assets/skill_images/programming/python.png";
import JAVAImg from "../../assets/skill_images/programming/java.png";
import GolangImg from "../../assets/skill_images/programming/golang.png";
import CSharpImg from "../../assets/skill_images/programming/csharp.png";
import CPlusPlusImg from "../../assets/skill_images/programming/cplusplus.png";
import ReactImg from "../../assets/skill_images/frontend/react.png";
import FlaskImg from "../../assets/skill_images/backend/flask.png";
import FastAPIImg from "../../assets/skill_images/backend/fastapi.png";
import SpringBootImg from "../../assets/skill_images/backend/springboot.png";
import GinImg from "../../assets/skill_images/backend/gin.png";
import DockerImg from "../../assets/skill_images/cloudAndDevops/docker.png";
import K8sImg from "../../assets/skill_images/cloudAndDevops/k8s.png";
import GCPImg from "../../assets/skill_images/cloudAndDevops/gcp.png";
import MySQLImg from "../../assets/skill_images/database/mysql.png";
import PostgreSQLImg from "../../assets/skill_images/database/postgresql.png";
import SQLiteImg from "../../assets/skill_images/database/sqlite.png";
import RedisImg from "../../assets/skill_images/database/redis.png";

type SkillItem = {
  id: number;
  name: string;
  image: string;
};

type SkillTab = {
  id: string;
  label: string;
  skills: SkillItem[];
};

const skillTabs: SkillTab[] = [
  {
    id: "life",
    label: "生活",
    skills: [
      {
        id: 1,
        name: "跑步",
        image: RunningImg,
      },
      {
        id: 2,
        name: "游泳",
        image: SwimmingImg,
      },
      {
        id: 3,
        name: "羽球",
        image: BadmintonImg,
      },
      {
        id: 4,
        name: "棒球",
        image: BaseballImg,
      },
      {
        id: 5,
        name: "遊戲",
        image: GameImg,
      },
    ],
  },
  {
    id: "programming",
    label: "程式語言",
    skills: [
      {
        id: 1,
        name: "Python",
        image: PythonImg,
      },
      {
        id: 2,
        name: "JAVA",
        image: JAVAImg,
      },
      {
        id: 3,
        name: "Golang",
        image: GolangImg,
      },
      {
        id: 4,
        name: "C#",
        image: CSharpImg,
      },
      {
        id: 5,
        name: "C++",
        image: CPlusPlusImg,
      },
    ],
  },
  {
    id: "frontend",
    label: "Frontend",
    skills: [
      {
        id: 1,
        name: "React",
        image: ReactImg,
      },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    skills: [
      {
        id: 1,
        name: "Flask",
        image: FlaskImg,
      },
      {
        id: 2,
        name: "FastAPI",
        image: FastAPIImg, // Placeholder image for FastAPI
      },
      {
        id: 3,
        name: "Spring Boot",
        image: SpringBootImg,
      },
      {
        id: 4,
        name: "Gin",
        image: GinImg,
      },
    ],
  },
  {
    id: "CloudAndDevOps",
    label: "Cloud & DevOps",
    skills: [
      {
        id: 1,
        name: "Docker",
        image: DockerImg,
      },
      {
        id: 2,
        name: "k8s",
        image: K8sImg,
      },
      {
        id: 3,
        name: "GCP",
        image: GCPImg,
      },
    ],
  },
  {
    id: "database",
    label: "Database",
    skills: [
      {
        id: 1,
        name: "MySQL",
        image: MySQLImg,
      },
      {
        id: 2,
        name: "PostgreSQL",
        image: PostgreSQLImg,
      },
      {
        id: 3,
        name: "SQLite",
        image: SQLiteImg,
      },
      {
        id: 4,
        name: "Redis",
        image: RedisImg,
      },
    ],
  },
];

export default function Skills() {
  const [activeTabId, setActiveTabId] = useState(skillTabs[0].id);
  const tabListRef = useRef<HTMLDivElement>(null);
  const activeTab = skillTabs.find((tab) => tab.id === activeTabId) ?? skillTabs[0];

  const scrollTabs = (direction: -1 | 1) => {
    tabListRef.current?.scrollBy({
      left: direction * 180,
      behavior: "smooth",
    });
  };

  return (
    <div className={styles.skillWindow}>
      <div className={styles.tabControls}>
        <button
          aria-label="Scroll tabs left"
          className={styles.tabArrow}
          onClick={() => scrollTabs(-1)}
          type="button"
        >
          ◀
        </button>

        <div className={styles.tabViewport}>
          <div className={styles.tabBar} ref={tabListRef}>
            {skillTabs.map((tab) => (
              <button
                className={`${styles.tabButton} ${
                  tab.id === activeTabId ? styles.activeTab : ""
                }`}
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <button
          aria-label="Scroll tabs right"
          className={styles.tabArrow}
          onClick={() => scrollTabs(1)}
          type="button"
        >
          ▶
        </button>
      </div>

      <div className={styles.skillGrid}>
        {activeTab.skills.map((skill) => (
          <div className={styles.skillItem} key={skill.id}>
            <div className={styles.skillIcon}>
              <img src={skill.image} alt={skill.name} />
            </div>

            <div className={styles.skillName}>{skill.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
