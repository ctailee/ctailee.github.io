---
title: lifecycle, phase, and goal
created_at: 2026-07-14
updated_at: 2026-07-14
tags: [java, maven]
---

## 目錄

- [目錄](#目錄)
- [Lifecycle 與 phase](#lifecycle-與-phase)
  - [default lifecycle](#default-lifecycle)
  - [clean lifecycle](#clean-lifecycle)
  - [site lifecycle](#site-lifecycle)
- [執行 phase](#執行-phase)
- [Goal 與 Mojo](#goal-與-mojo)
  - [直接執行 goal](#直接執行-goal)
    - [Maven 如何找到 prefix 對應的 plugin](#maven-如何找到-prefix-對應的-plugin)
    - [沒有 prefix 時如何執行 goal](#沒有-prefix-時如何執行-goal)
- [Goal 如何綁定到 phase](#goal-如何綁定到-phase)
  - [Plugin 與 execution 層級的 configuration](#plugin-與-execution-層級的-configuration)
- [同一個 phase 綁定多個 goals](#同一個-phase-綁定多個-goals)
  - [同一個 execution 執行多個 goals](#同一個-execution-執行多個-goals)
  - [使用不同 configuration](#使用不同-configuration)
  - [不同 plugins 綁定到同一個 phase](#不同-plugins-綁定到同一個-phase)
- [補充資訊：建立自己的 Maven Plugin](#補充資訊建立自己的-maven-plugin)
  - [普通 JAR 不會建立 prefix metadata](#普通-jar-不會建立-prefix-metadata)
  - [建立 Maven Plugin 的必要資訊](#建立-maven-plugin-的必要資訊)
  - [`mvn install` 如何產生 metadata](#mvn-install-如何產生-metadata)
  - [Prefix 如何產生](#prefix-如何產生)
  - [Metadata 儲存位置](#metadata-儲存位置)
  - [Maven 不會掃描整個 local repository](#maven-不會掃描整個-local-repository)
  - [將自訂 plugin group 加入搜尋範圍](#將自訂-plugin-group-加入搜尋範圍)
- [References](#references)

Maven 的 build lifecycle 像一條流水線，由一連串 phase（階段）組成，每個 phase 再透過 plugin goal 執行具體工作。

Maven 內建三個 lifecycle：

1. `default`：編譯、測試、打包與部署專案。
2. `clean`：清除前一次 build 產生的檔案。
3. `site`：產生並部署專案網站。

## Lifecycle 與 phase

### default lifecycle

`default` 是最常用的 lifecycle，包含以下 phase：

1. `validate`
2. `initialize`
3. `generate-sources`
4. `process-sources`
5. `generate-resources`
6. `process-resources`
7. `compile`
8. `process-classes`
9. `generate-test-sources`
10. `process-test-sources`
11. `generate-test-resources`
12. `process-test-resources`
13. `test-compile`
14. `process-test-classes`
15. `test`
16. `prepare-package`
17. `package`
18. `pre-integration-test`
19. `integration-test`
20. `post-integration-test`
21. `verify`
22. `install`
23. `deploy`

### clean lifecycle

1. `pre-clean`
2. `clean`
3. `post-clean`

### site lifecycle

1. `pre-site`
2. `site`
3. `post-site`
4. `site-deploy`

完整說明可參考 [Introduction to the Build Lifecycle – Maven](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html#Lifecycle_Reference)。

## 執行 phase

執行某個 phase 時，Maven 會找到它所屬的 lifecycle，再從第一個 phase 依序執行到指定位置：

```bash
mvn [phase]
```

例如：

```bash
mvn package
```

`package` 屬於 `default` lifecycle，因此 Maven 會從 `validate` 一路執行到 `package`。

命令也可以包含多個 phase：

```bash
mvn clean package
```

Maven 會先執行 `clean` lifecycle 的 `pre-clean` 與 `clean`，再執行 `default` lifecycle 的 `validate` 至 `package`。

> 不建議直接執行 `mvn integration-test`。這會跳過之後的 `post-integration-test` 與 `verify`，可能使測試環境沒有被清理，或沒有產生測試報告。通常應執行 `mvn verify`。

## Goal 與 Mojo

Goal 是 Maven 執行的具體工作。一個 phase 可以綁定零個、一個或多個 goals。沒有綁定 phase 的 goal 也可以從命令列直接執行。

可以用 Maven Help Plugin 查看 phase 的資訊：

```bash
mvn help:describe -Dcmd=[phase]
```

例如查看 `clean` phase：

```bash
mvn help:describe -Dcmd=clean
```

輸出大致如下：

```text
'clean' is a phase within the 'clean' lifecycle, which has the following phases:
* pre-clean: Not defined
* clean: org.apache.maven.plugins:maven-clean-plugin:3.2.0:clean
* post-clean: Not defined
```

`Not defined` 表示該 phase 目前沒有綁定 goal，執行到這裡時不會進行任何動作。

`clean` phase 則綁定了以下 goal：

```text
org.apache.maven.plugins:maven-clean-plugin:3.2.0:clean
```

前三段是 plugin artifact 的 Maven 座標，最後的 `clean` 是 goal 名稱。該 goal 由 plugin 中的 `CleanMojo` 類別實作，並透過 `@Mojo(name = "clean")` 命名。Maven 執行 goal 時，會載入 plugin artifact 並呼叫 `execute` 方法。

```java
@Mojo(name = "clean", threadSafe = true)
public class CleanMojo extends AbstractMojo {
    public void execute() throws MojoExecutionException {
        // Do something
    }
}
```

一個 plugin 可以提供多個 Mojo 實作，因此也可以提供多個 goals。

### 直接執行 goal

除了透過 phase 觸發 goal，也可以使用 plugin prefix 直接執行：

```bash
mvn [plugin-prefix]:[goal]
```

例如：

```bash
mvn exec:java
mvn spring-boot:run
```

Prefix 是 plugin 的短名。例如 `exec:java` 中的 `exec` 會對應到 `org.codehaus.mojo:exec-maven-plugin`，`java` 則是該 plugin 提供的 goal。

#### Maven 如何找到 prefix 對應的 plugin

當我們執行 `mvn exec:java` 時，Maven 必須先將 `exec` 解析成 plugin 的 `groupId` 與 `artifactId`。這個對應關係記錄在 Maven repository 的 `maven-metadata.xml` 中。

Maven 預設會搜尋以下兩個 plugin groups：

1. `org.apache.maven.plugins`
2. `org.codehaus.mojo`

以 `exec:java` 為例，`exec-maven-plugin` 屬於 `org.codehaus.mojo` group，因此 Maven 會從 Maven Central 取得以下 group-level metadata：

```text
https://repo.maven.apache.org/maven2/org/codehaus/mojo/maven-metadata.xml
```

metadata 中包含以下內容：

```xml
<metadata>
    <plugins>
        <!-- 其他 plugins -->
        <plugin>
            <name>Exec Maven Plugin</name>
            <prefix>exec</prefix>
            <artifactId>exec-maven-plugin</artifactId>
        </plugin>
        <!-- 其他 plugins -->
    </plugins>
</metadata>
```

Maven 會在 `<plugin>` 清單中尋找 `<prefix>exec</prefix>`，然後讀取同一筆資料的 `<artifactId>exec-maven-plugin</artifactId>`。由於 Maven 目前正在搜尋 `org.codehaus.mojo` group，因此可以組合出 plugin 座標：

```text
org.codehaus.mojo:exec-maven-plugin
```

最後，Maven 將命令中冒號後面的 `java` 當作 goal，得到：

```text
org.codehaus.mojo:exec-maven-plugin:[version]:java
```

這裡的 `[version]` 還需要另外解析，prefix metadata 只負責找出 `artifactId`，不負責決定 plugin version。

遠端 metadata 下載後，通常會以 repository ID 命名，儲存在本機 repository。若 repository ID 是 `central`，路徑會是：

```text
~/.m2/repository/org/codehaus/mojo/maven-metadata-central.xml
```

`maven-metadata-local.xml` 則是本機安裝 plugin 時產生的 group-level metadata。例如開發一個尚未 deploy 到遠端 repository 的 plugin，並執行 `mvn install`，Maven 會將它的 prefix 對應關係寫入該 plugin groupId 目錄下的 `maven-metadata-local.xml`。其內容與遠端 group-level metadata 類似：

```xml
<metadata>
    <plugins>
        <plugin>
            <name>My Local Maven Plugin</name>
            <prefix>my-local</prefix>
            <artifactId>my-local-maven-plugin</artifactId>
        </plugin>
    </plugins>
</metadata>
```

Maven 解析 prefix 時，會合併以下資料：

1. 從各個遠端 repositories 下載的 `maven-metadata-${repoId}.xml`。
2. 本機 install 產生的 `maven-metadata-local.xml`（如果存在）。

**Plugin version 從哪裡來？**

若命令已明確指定 version，Maven 會直接使用該版本：

```bash
mvn org.codehaus.mojo:exec-maven-plugin:3.6.3:java
```

執行 `mvn exec:java` 而沒有指定 version 時，Maven 會按以下順序解析：

1. 查找 effective POM 的 `<build><plugins>` 中是否已指定 `org.codehaus.mojo:exec-maven-plugin` 的 version。
2. 如果沒有，再查找 effective POM 的 `<build><pluginManagement>`。
3. 如果 POM 仍沒有指定，再從 repository 的 artifact-level metadata 解析可用版本。

Effective POM 是 Maven 合併當前 POM、parent POM 與啟用的 profiles 後得到的最終設定。因此，plugin version 不一定直接寫在當前專案的 `pom.xml`，也可能繼承自 parent POM。

例如，這個 POM 會讓 `mvn exec:java` 使用 `3.6.3`：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.codehaus.mojo</groupId>
            <artifactId>exec-maven-plugin</artifactId>
            <version>3.6.3</version>
        </plugin>
    </plugins>
</build>
```

若 effective POM 沒有 plugin version，Maven 會查詢以下 artifact-level metadata：

```text
https://repo.maven.apache.org/maven2/org/codehaus/mojo/exec-maven-plugin/maven-metadata.xml
```

它與前面的 group-level metadata 用途不同：

- `org/codehaus/mojo/maven-metadata.xml`：將 prefix `exec` 對應到 artifactId `exec-maven-plugin`。
- `org/codehaus/mojo/exec-maven-plugin/maven-metadata.xml`：記錄 `exec-maven-plugin` 的可用版本，供 Maven 解析 version。

因此，預設 plugin groups 下的 plugins 通常可以直接使用 `prefix:goal` 執行。若 Maven 找不到對應關係，會出現類似以下錯誤：

```text
No plugin found for prefix 'example' in the current project and in the plugin groups
```

#### 沒有 prefix 時如何執行 goal

Prefix 只是縮寫，不是執行 goal 的必要條件。若 plugin 沒有 prefix，或 Maven 無法解析 prefix，可以直接使用完整座標：

```bash
mvn [groupId]:[artifactId]:[version]:[goal]
```

例如：

```bash
mvn org.codehaus.mojo:exec-maven-plugin:3.6.3:java
```

直接執行 goal 時也可以省略 version：

```bash
mvn [groupId]:[artifactId]:[goal]
mvn org.codehaus.mojo:exec-maven-plugin:java
```

不過，明確指定 version 可避免不同環境解析到不同版本，有助於重現 build 結果。

## Goal 如何綁定到 phase

`default` lifecycle 的預設綁定取決於專案的 `<packaging>`。例如 `jar` packaging 會將 `compiler:compile` 綁定到 `compile` phase，`pom` packaging 則沒有這項綁定。

除了 packaging 提供的預設綁定，parent POM、當前 POM 與啟用的 profile 也可以新增 plugin execution。以下範例將 Maven Antrun Plugin 的 `run` goal 綁定到 `pre-clean` 與 `post-clean`：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-antrun-plugin</artifactId>
    <version>3.2.0</version>

    <executions>
        <execution>
            <id>before-clean</id>
            <phase>pre-clean</phase>
            <goals>
                <goal>run</goal>
            </goals>
            <configuration>
                <target>
                    <echo message="===== 執行 pre-clean goal ====="/>
                </target>
            </configuration>
        </execution>

        <execution>
            <id>after-clean</id>
            <phase>post-clean</phase>
            <goals>
                <goal>run</goal>
            </goals>
            <configuration>
                <target>
                    <echo message="===== 執行 post-clean goal ====="/>
                </target>
            </configuration>
        </execution>
    </executions>
</plugin>
```

基本結構如下：

```xml
<plugin>
    <!-- 指定 plugin -->

    <executions>
        <execution>
            <!-- 命名這次 execution -->
            <id>execution-name</id>

            <!-- 指定執行時機 -->
            <phase>phase-name</phase>

            <!-- 指定要執行的 goals -->
            <goals>
                <goal>goal-one</goal>
                <goal>goal-two</goal>
            </goals>

            <!-- 設定 goal 參數 -->
            <configuration>
                ...
            </configuration>
        </execution>
    </executions>
</plugin>
```

### Plugin 與 execution 層級的 configuration

若 plugin 只用於 CLI 直接呼叫，不需要建立 execution。例如：

```xml
<plugin>
    <groupId>org.codehaus.mojo</groupId>
    <artifactId>exec-maven-plugin</artifactId>
    <version>3.6.3</version>
    <configuration>
        <mainClass>com.example.Main</mainClass>
    </configuration>
</plugin>
```

之後可以直接執行：

```bash
mvn exec:java
```

`<configuration>` 的位置會影響它的適用範圍：

- 寫在 `<plugin>` 下面：作為 plugin 的共用設定，通常會套用到 CLI 呼叫與該 plugin 的各個 executions。
- 寫在 `<execution>` 下面：只套用到該 execution，並會與 plugin 層級的設定合併。

## 同一個 phase 綁定多個 goals

### 同一個 execution 執行多個 goals

若多個 goals 使用相同的 configuration，可以放在同一個 execution。例如在 `verify` phase 同時產生 main 與 test source JAR：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-source-plugin</artifactId>
    <version>3.4.0</version>

    <executions>
        <execution>
            <id>attach-main-and-test-sources</id>
            <phase>verify</phase>
            <goals>
                <goal>jar-no-fork</goal>
                <goal>test-jar-no-fork</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

執行 `mvn verify` 時，goals 會按照 POM 中的宣告順序執行：

1. `maven-source-plugin:jar-no-fork`
2. `maven-source-plugin:test-jar-no-fork`

Packaging 預設綁定的 goals 會先執行，接著才執行 POM 額外設定的 goals。

### 使用不同 configuration

若 goals 需要不同設定，應拆成多個 executions。例如在 `package` phase 複製與解壓 dependencies，並使用不同的輸出目錄：

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-dependency-plugin</artifactId>
    <version>3.11.0</version>

    <executions>
        <execution>
            <id>copy-project-dependencies</id>
            <phase>package</phase>
            <goals>
                <goal>copy-dependencies</goal>
            </goals>
            <configuration>
                <outputDirectory>${project.build.directory}/lib</outputDirectory>
            </configuration>
        </execution>

        <execution>
            <id>unpack-project-dependencies</id>
            <phase>package</phase>
            <goals>
                <goal>unpack-dependencies</goal>
            </goals>
            <configuration>
                <outputDirectory>${project.build.directory}/unpacked-dependencies</outputDirectory>
            </configuration>
        </execution>
    </executions>
</plugin>
```

若將兩個 goals 放在同一個 execution，它們會共用該 execution 的 `<configuration>`，無法分別指定 `outputDirectory`。

### 不同 plugins 綁定到同一個 phase

`<goal>` 一定屬於外層的 `<plugin>`，因此不同 plugins 的 goals 必須分開設定。例如在 `verify` phase 產生 source JAR 與 Javadoc JAR：

```xml
<build>
    <plugins>
        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-source-plugin</artifactId>
            <version>3.4.0</version>
            <executions>
                <execution>
                    <id>attach-sources</id>
                    <phase>verify</phase>
                    <goals>
                        <goal>jar-no-fork</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>

        <plugin>
            <groupId>org.apache.maven.plugins</groupId>
            <artifactId>maven-javadoc-plugin</artifactId>
            <version>3.12.0</version>
            <executions>
                <execution>
                    <id>attach-javadocs</id>
                    <phase>verify</phase>
                    <goals>
                        <goal>jar</goal>
                    </goals>
                </execution>
            </executions>
        </plugin>
    </plugins>
</build>
```

執行 `mvn verify` 時，Maven 會依 POM 中的宣告順序產生 source JAR，再產生 Javadoc JAR。

## 補充資訊：建立自己的 Maven Plugin

### 普通 JAR 不會建立 prefix metadata

不是所有專案執行 `mvn install` 都會產生 plugin prefix metadata。例如以下是一般 Java library：

```xml
<groupId>com.example</groupId>
<artifactId>hello-library</artifactId>
<version>1.0.0</version>
<packaging>jar</packaging>
```

對這個專案執行：

```bash
mvn install
```

Maven 只會將 JAR 與 POM 安裝到 local repository，不會建立 plugin prefix mapping。

只有 Maven Plugin 專案才需要 plugin descriptor 與 prefix metadata。最關鍵的差異是 packaging：

```xml
<groupId>com.example.maven</groupId>
<artifactId>hello-maven-plugin</artifactId>
<version>1.0-SNAPSHOT</version>
<packaging>maven-plugin</packaging>
```

`maven-plugin` packaging 會啟用建立 Maven Plugin 所需的 lifecycle bindings，包括產生 plugin descriptor、封裝 plugin JAR 與產生 plugin metadata。

### 建立 Maven Plugin 的必要資訊

一個基本的 Maven Plugin 專案至少需要以下三類資訊。

1. 將 packaging 設為 `maven-plugin`：

   ```xml
   <packaging>maven-plugin</packaging>
   ```

2. 使用符合慣例的 artifactId。第三方 plugin 建議使用 `${prefix}-maven-plugin`：

   ```xml
   <artifactId>hello-maven-plugin</artifactId>
   ```

   Maven 會根據命名慣例，將 `hello-maven-plugin` 的 prefix 推導為 `hello`。Apache Maven 官方 plugins 則使用 `maven-${prefix}-plugin`，這個命名模式保留給官方 plugins。

3. 定義至少一個 Mojo goal：

   ```java
   package com.example.maven;

   import org.apache.maven.plugin.AbstractMojo;
   import org.apache.maven.plugin.MojoExecutionException;
   import org.apache.maven.plugins.annotations.Mojo;

   @Mojo(name = "say")
   public class SayMojo extends AbstractMojo {

       @Override
       public void execute() throws MojoExecutionException {
           getLog().info("Hello from my Maven Plugin!");
       }
   }
   ```

`@Mojo(name = "say")` 將 goal 命名為 `say`。加上前面推導出的 `hello` prefix，簡寫指令就是：

```bash
mvn hello:say
```

其中：

- `hello`：plugin prefix。
- `say`：plugin goal。

POM 還需要提供編譯 Mojo 所需的 Maven Plugin API 與 annotations dependencies。

### `mvn install` 如何產生 metadata

`mvn install` 不是只執行 `install` phase，而是從 `default` lifecycle 的第一個 phase 一路執行到 `install`。

對 `maven-plugin` packaging 而言，關鍵的 lifecycle bindings 是：

```text
process-classes
    → maven-plugin-plugin:descriptor

package
    → maven-jar-plugin:jar
    → maven-plugin-plugin:addPluginArtifactMetadata

install
    → maven-install-plugin:install
```

這些 goals 分別負責：

1. 在 `target/classes/META-INF/maven/plugin.xml` 產生 plugin descriptor。
2. 封裝 plugin JAR，並將 prefix mapping 等 plugin-specific metadata 加入專案 artifact。
3. 將 JAR、POM 與相關 metadata 安裝到 local repository。

因為這些是 `maven-plugin` packaging 提供的預設 bindings，通常不需要自己在 `<executions>` 中重複綁定。

### Prefix 如何產生

若沒有明確設定 `goalPrefix`，Maven Plugin Plugin 會從專案的 artifactId 推導 prefix。概念上的原始碼邏輯如下：

```java
if (goalPrefix == null) {
    goalPrefix = PluginDescriptor.getGoalPrefixFromArtifactId(
        project.getArtifactId()
    );
}
```

因此：

```text
artifactId = hello-maven-plugin
              ↓
prefix = hello
```

若不想使用自動推導的結果，可在 Maven Plugin Plugin 的 configuration 中明確設定 `<goalPrefix>`。

### Metadata 儲存位置

假設 plugin 座標是：

```text
com.example.maven:hello-maven-plugin:1.0-SNAPSHOT
```

執行 `mvn install` 後，JAR 與 POM 會放在 artifact version 目錄：

```text
~/.m2/repository/
└── com/
    └── example/
        └── maven/
            └── hello-maven-plugin/
                └── 1.0-SNAPSHOT/
                    ├── hello-maven-plugin-1.0-SNAPSHOT.jar
                    └── hello-maven-plugin-1.0-SNAPSHOT.pom
```

Prefix mapping 是 group-level metadata，所以不會放在 artifact 或 version 目錄，而是放在 groupId 對應的目錄：

```text
~/.m2/repository/
└── com/
    └── example/
        └── maven/
            ├── maven-metadata-local.xml <-- Here!
            └── hello-maven-plugin/
```

`maven-metadata-local.xml` 內容大致如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<metadata>
    <groupId>com.example.maven</groupId>
    <plugins>
        <plugin>
            <name>hello-maven-plugin</name>
            <prefix>hello</prefix>
            <artifactId>hello-maven-plugin</artifactId>
        </plugin>
    </plugins>
</metadata>
```

這筆資料表示：在 `com.example.maven` group 中，prefix `hello` 對應到 artifactId `hello-maven-plugin`。

### Maven 不會掃描整個 local repository

執行 `mvn hello:say` 時，Maven 不會逐一打開 local repository 中的所有 JAR。它只會查詢已知的 group-level metadata。

Maven 預設會搜尋以下兩個 plugin groups：

- `org.apache.maven.plugins`
- `org.codehaus.mojo`

對每個已知的 plugin group，Maven 會：

1. 取得該 groupId 的遠端 metadata。
2. 讀取該 groupId 目錄下的本機 metadata。
3. 合併 metadata。
4. 尋找 requested prefix。
5. 若找不到，再檢查下一個 plugin groupId。

### 將自訂 plugin group 加入搜尋範圍

`com.example.maven` 不在預設範圍內，因此需要在 `~/.m2/settings.xml` 中加入：

```xml
<settings>
    <pluginGroups>
        <pluginGroup>com.example.maven</pluginGroup>
    </pluginGroups>
</settings>
```

這是告訴 Maven：解析 `prefix:goal` 時，也要搜尋 `com.example.maven` group。

## References

1. [Introduction to the Build Lifecycle – Maven](https://maven.apache.org/guides/introduction/introduction-to-the-lifecycle.html)
2. [Guide to Configuring Plug-ins – Maven](https://maven.apache.org/guides/mini/guide-configuring-plugins.html)
3. [Introduction to Plugin Prefix Resolution – Maven](https://maven.apache.org/guides/introduction/introduction-to-plugin-prefix-mapping.html)
4. [Settings Reference – Maven](https://maven.apache.org/settings.html#plugin-groups)
5. [Maven Plugin Plugin Usage – Maven](https://maven.apache.org/plugin-tools/maven-plugin-plugin/usage.html)
6. [Plugin Bindings for Default Lifecycle – Maven](https://maven.apache.org/ref/current/maven-core/default-bindings.html)
7. [廖雪峰的官方網站](https://liaoxuefeng.com/books/java/maven/process/index.html)
8. [(1) Maven 的生命週期（Phase, Plugin, Goal）](https://medium.com/learning-from-jhipster/1-maven%E7%9A%84%E7%94%9F%E5%91%BD%E9%80%B1%E6%9C%9F-phase-plugin-goal-d69a2591dc45)
