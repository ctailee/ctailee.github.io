---
title: pom.xml 內的元素解釋
created_at: 2026-07-09
updated_at: 2026-07-09
tags: [java, maven, pom.xml]
---

## 目錄

- [專案座標：groupId、artifactId、version](#專案座標groupidartifactidversion)
- [modelVersion](#modelversion)
- [packaging](#packaging)
- [properties](#properties)
- [dependencies](#dependencies)
- [build 與 plugins](#build-與-plugins)
- [parent](#parent)
- [dependencyManagement](#dependencymanagement)
- [parent and BOM](#parent-and-bom)
- [modules](#modules)
- [repositories](#repositories)
- [常用 Maven 指令](#常用-maven-指令)

`pom.xml` 是 Maven 專案的設定檔。它描述這個專案是什麼、需要哪些依賴、如何編譯、測試與打包。

最常見的 `pom.xml` 大致會長這樣：

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>first-project</artifactId>
    <version>1.0-SNAPSHOT</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.release>21</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>3.2.5</version>
            </plugin>
        </plugins>
    </build>
</project>
```

## 專案座標：groupId、artifactId、version

```xml
<groupId>com.example</groupId>
<artifactId>first-project</artifactId>
<version>1.0-SNAPSHOT</version>
```

這三個欄位合稱為 Maven 的座標，用來唯一識別一個套件。

1. `groupId`：通常代表組織、公司或專案群組，常見寫法是反向網域，例如 `com.example`。
2. `artifactId`：專案或模組名稱，例如 `first-project`。
3. `version`：版本號，例如 `1.0.0` 或 `1.0-SNAPSHOT`。

執行 `mvn package` 後，Maven 會依照 `artifactId` 和 `version` 產生檔名。例如：

```text
target/first-project-1.0-SNAPSHOT.jar
```

如果這個套件被安裝到本機 Maven repository，路徑會包含完整座標。例如：

```text
~/.m2/repository/
└── com/
    └── example/
        └── first-project/
            └── 1.0-SNAPSHOT/
                └── first-project-1.0-SNAPSHOT.jar
```

其中 `com.example` 會被轉成目錄路徑 `com/example`。

## modelVersion

```xml
<modelVersion>4.0.0</modelVersion>
```

`modelVersion` 表示這份 POM 使用的模型版本。目前一般 Maven 專案幾乎都使用 `4.0.0`。

Maven 需要這個資訊，是因為它要先知道「這份 XML 要用哪一種 POM 規格來解析」。如果未來 POM 模型有新的版本，Maven 就能透過這個欄位判斷要用哪一套規格讀取檔案。

目前 Maven 官方文件列出的 POM 版本是 `4.0.0`，這也是日常開發幾乎都會看到的寫法：

```xml
<modelVersion>4.0.0</modelVersion>
```

## packaging

```xml
<packaging>jar</packaging>
```

`packaging` 表示專案最後要打包成什麼形式。常見值有：

| packaging | 用途 |
| --- | --- |
| `jar` | 一般 Java library 或 application，預設值 |
| `war` | 傳統 Java Web application |
| `pom` | 父 POM 或多模組專案的聚合 POM |

如果沒有寫 `packaging`，Maven 預設會使用 `jar`。

## properties

```xml
<properties>
    <maven.compiler.release>25</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <junit.version>5.10.2</junit.version>
    <maven-surefire-plugin.version>3.2.5</maven-surefire-plugin.version>
</properties>
```

`properties` 用來集中管理設定值。常見用途包含：

1. 設定 Java 版本 (e.g, 25)。
    
    例如 `maven.compiler.release` 會告訴 compiler plugin 使用哪個 Java release 進行編譯。
    
    如果專案還在使用舊寫法，也可能看到：

    ```xml
    <maven.compiler.source>25</maven.compiler.source>
    <maven.compiler.target>25</maven.compiler.target>
    ```

    通常新專案優先使用 `maven.compiler.release`，因為它同時處理 source、target 和可用 API 的限制。詳情可以去看 `Java/Maven/pom.xml 中的 source、target 和 release`
2. 設定編碼 (e.g, UTF-8)。
3. 集中管理依賴或 plugin 的版本號。

    如果很多地方都會用到同一個版本號，可以先放在 `properties` 裡，再用 `${...}` 引用：

    ```xml
    <properties>
        <junit.version>5.10.2</junit.version>
        <maven-surefire-plugin.version>3.2.5</maven-surefire-plugin.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>${junit.version}</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-surefire-plugin</artifactId>
                <version>${maven-surefire-plugin.version}</version>
            </plugin>
        </plugins>
    </build>
    ```

    這樣未來要升級 JUnit 或 Surefire plugin 時，只要改 `properties` 裡的版本號，不用到處找 `<version>`。

     管理版本號的範例可以去看 [spring-boot-dependencies](https://central.sonatype.com/artifact/org.springframework.boot/spring-boot-dependencies) 的 `pom.xml`。裡面可以清楚看到他在 `<properties>...</properties>` 裡面定義了很多依賴的版本號。

## dependencies

```xml
<dependencies>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
        <version>5.10.2</version>
        <scope>test</scope>
    </dependency>
</dependencies>
```

`dependencies` 用來宣告專案需要的外部套件。每一個 dependency 通常也會有自己的 `groupId`、`artifactId` 和 `version`。

Maven 會依照這些資訊到 repository 下載套件，並放到本機的 `~/.m2/repository`。

### scope

`scope` 表示這個依賴在哪些階段會被使用。常見值如下：

| scope | 說明 |
| --- | --- |
| `compile` | 預設值，編譯、測試、執行都會使用 |
| `test` | 只在測試時使用，例如 JUnit |
| `runtime` | 編譯時不需要，執行時才需要 |
| `provided` | 編譯時需要，但執行環境會提供，例如 Servlet API |

沒有特別指定時，預設是 `compile`。

`runtime` 常見例子是資料庫 driver。你的程式碼通常只依賴 JDBC API，例如 `java.sql.Connection`，編譯時不一定需要 MySQL driver 的類別；但程式真正連線到 MySQL 時，就需要 driver 出現在 runtime classpath。

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.4.0</version>
    <scope>runtime</scope>
</dependency>
```

這表示：測試或執行程式時要帶上這個 jar，但編譯主要程式碼時不把它當成直接依賴。

## build 與 plugins

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-surefire-plugin</artifactId>
            <version>3.2.5</version>
        </plugin>
    </plugins>
</build>
```

`build` 用來設定建置流程。`plugins` 則是 Maven 執行編譯、測試、打包等工作的工具。

常見 plugin 包含：

| plugin | 用途 |
| --- | --- |
| `maven-compiler-plugin` | 編譯 Java 原始碼 |
| `maven-surefire-plugin` | 執行單元測試 |
| `maven-failsafe-plugin` | 執行整合測試 |
| `maven-jar-plugin` | 建立 jar |
| `maven-shade-plugin` | 打包 fat jar，將依賴一起包進 jar |

有些 plugin 不一定要手動宣告，因為 Maven lifecycle 已經有預設綁定。但在正式專案中，通常會明確寫出重要 plugin 的版本，避免 Maven 或 plugin 版本變動造成行為不一致。

## parent

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.1</version>
    <relativePath />
</parent>
```

`parent` 表示目前專案繼承另一份 POM 的設定。常見用途是：

1. 統一 dependency 版本。
2. 統一 plugin 版本。
3. 共用 properties 與 build 設定。

例如 Spring Boot 專案常透過 [parent](https://central.sonatype.com/artifact/org.springframework.boot/spring-boot-starter-parent) 取得一組預先整理好的版本管理設定。

`relativePath` 則是告訴 Maven 去本機相對路徑找 parent POM 檔案。

預設情況下，Maven 會嘗試從這個位置找 parent：

```text
../pom.xml
```

如果是多模組專案，這通常很合理，因為子模組的 parent POM 常常就在上一層目錄。

你也可以明確指定別的位置，例如：

```xml
<parent>
    <groupId>com.example</groupId>
    <artifactId>my-parent</artifactId>
    <version>1.0.0</version>
    <relativePath>../../parent/pom.xml</relativePath>
</parent>
```

那 Maven 就會從目前 pom.xml 所在位置出發，去找：

```text
../../parent/pom.xml
```

但 Spring Boot 這種 parent 不是你本機專案上一層的 `pom.xml`，而是要從 Maven repository 下載。因此常會看到：

```xml
<relativePath />
```

空的 `relativePath` 表示不要從本機找 parent，直接去 repository 透過 `groupId`、`artifact`、`version` 找對應的 `pom.xml`。這可以避免 Maven 誤讀到剛好存在的其他 `pom.xml`。

如果是公司內部或多模組專案，也常會建立自己的 parent POM。

## dependencyManagement

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.2</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

`dependencyManagement` 只負責管理版本與預設設定，不會真的把 dependency 加進專案。

也就是說，放在 `dependencyManagement` 裡的套件，仍然需要在 `dependencies` 裡宣告後才會生效。

它的重要性在多模組專案會特別明顯。假設一個專案有 `api`、`service`、`web` 三個模組，而且每個模組都會用到 JUnit。如果每個模組都自己寫版本號，很容易出現版本不一致：

```xml
<!-- api/pom.xml -->
<version>5.9.3</version>

<!-- service/pom.xml -->
<version>5.10.2</version>

<!-- web/pom.xml -->
<version>5.8.2</version>
```

這種情況會讓測試行為、相依套件版本、甚至錯誤訊息變得不一致。`dependencyManagement` 的目的就是把版本決策集中到一個地方，通常是父 POM。

常見情境是父 POM 統一管理版本，子模組只需要寫：

```xml
<dependencies>
    <dependency>
        <groupId>org.junit.jupiter</groupId>
        <artifactId>junit-jupiter</artifactId>
    </dependency>
</dependencies>
```

這樣子模組就不用重複寫版本號。

Spring Boot 的 dependency management 也是同樣概念。使用 Spring Boot parent 或 BOM 時，很多 Spring 相關 dependency 不需要自己寫版本，因為版本已經由 Spring Boot 統一管理。

### 匯入 BOM：type pom 與 scope import

有時候會在 `dependencyManagement` 裡看到這種寫法：

```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>3.3.1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

這不是在加入一個普通 jar dependency，而是在匯入一份 BOM。

BOM 是 Bill of Materials 的縮寫，可以理解成「一份整理好的 dependency 版本清單」。它本身通常是一個 `pom`，裡面管理了一組彼此相容的套件版本。

這兩個欄位要一起看：

| 欄位 | 意思 |
| --- | --- |
| `<type>pom</type>` | 表示這個 dependency 指向的是一份 POM，不是一般 jar |
| `<scope>import</scope>` | 表示把那份 POM 裡的 `dependencyManagement` 匯入到目前專案 |

匯入 BOM 後，下面這種 dependency 就可以不寫版本：

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

版本會在 `spring-boot-dependencies` 的 `pom.xml` 被定義好。

這種寫法常用在「不想繼承某個 parent，但又想使用它整理好的 dependency 版本」的情境。例如你不繼承 `spring-boot-starter-parent`，但仍然想用 Spring Boot 定義好的依賴版本，就可以匯入 `spring-boot-dependencies` BOM。

要注意的是，`scope=import` 只用在 `dependencyManagement` 裡，而且通常會搭配 `type=pom`。它不是一般 dependency 可以任意使用的 scope。

## parent and BOM

`parent` 用來繼承另一個 `pom.xml` 的設定，例如 dependency 版本、plugin 版本、properties，以及 build 相關設定。一個 `pom.xml` 只能指定一個 `parent`。

BOM 則主要用來匯入其他 `pom.xml` 中 `dependencyManagement` 所管理的依賴版本，而且一個專案可以同時匯入多個 BOM。

因此，該使用 `parent` 還是 BOM，需要依照專案需求決定。當 `parent` 與 BOM 同時管理相同的依賴時，一般可以理解為：`parent` 中定義的版本，會優先於透過 BOM 匯入的版本。


## modules

```xml
<packaging>pom</packaging>

<modules>
    <module>api</module>
    <module>service</module>
    <module>web</module>
</modules>
```

`modules` 用在多模組專案。最外層的 POM 通常會使用 `packaging` 為 `pom`，並列出底下有哪些子模組。

執行 Maven 指令時，如果在最外層專案執行，Maven 會依照模組之間的依賴順序建置。

## repositories

```xml
<repositories>
    <repository>
        <id>company-repo</id>
        <url>https://repo.example.com/maven2</url>
    </repository>
</repositories>
```

`repositories` 用來指定 Maven 要去哪裡下載 dependencies。

如果沒有特別設定，Maven 預設會使用 Maven Central。一般公開套件通常都能從 Maven Central 下載，因此多數專案不需要額外設定 `repositories`。

公司內部套件或私有套件才比較常需要另外指定 repository。

## 常用 Maven 指令

| 指令 | 用途 |
| --- | --- |
| `mvn compile` | 編譯原始碼 |
| `mvn test` | 執行測試 |
| `mvn package` | 編譯、測試並打包 |
| `mvn install` | 打包後安裝到本機 repository |
| `mvn clean` | 清除 `target` 目錄 |

常見組合是：

```bash
mvn clean package
```

這會先清除舊的建置結果，再重新編譯、測試與打包。
