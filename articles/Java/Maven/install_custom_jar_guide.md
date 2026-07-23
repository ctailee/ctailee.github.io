---
title: 使用 Maven 安裝自製或第三方 JAR
created_at: 2026-07-21
updated_at: 2026-07-21
tags: [java, maven, jar]
---

本文說明如何將 Maven Central 找不到的 JAR 安裝到本機 Maven repository。做法取決於手上是否有完整的 Maven 專案：

1. 有完整專案：執行 `mvn install`。
2. 只有 JAR：執行 Maven Install Plugin 的 `install-file` goal。

## 目錄

- [有完整的 Maven 專案](#有完整的-maven-專案)
- [只有一個 JAR](#只有一個-jar)
- [在其他 Maven 專案中引用](#在其他-maven-專案中引用)
- [JAR 還有其他依賴](#jar-還有其他依賴)
- [使用限制](#使用限制)
- [參考資料](#參考資料)

## 有完整的 Maven 專案

假設 `my-utils` 的目錄結構如下：

```text
my-utils/
├── pom.xml
├── mvnw
├── mvnw.cmd
├── .mvn/
└── src/
    └── main/
        └── java/
            └── com/
                └── example/
                    └── myutils/
                        └── TextUtils.java
```

`pom.xml` 內容如下：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>my-utils</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.release>17</maven.compiler.release>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>
</project>
```

`groupId`、`artifactId` 和 `version` 合稱 Maven 座標，用來識別這個 artifact。

在專案根目錄執行：

```bash
mvn install
```

Maven 會依序執行 `install` 之前的 lifecycle phases，包括編譯、測試、打包與驗證。成功後，JAR 會出現在：

```text
target/my-utils-1.0.0.jar
```

JAR 與 POM 也會安裝到本機 repository。預設位置是：

```text
~/.m2/repository/com/example/my-utils/1.0.0/
```

本機 repository 的實際位置可以在 Maven 的 `settings.xml` 中修改，因此不一定是 `~/.m2/repository`。

## 只有一個 JAR

假設手上只有以下檔案：

```text
libs/my-utils.jar
```

不能執行 `mvn install libs/my-utils.jar`。應使用 Maven Install Plugin 的 `install-file` goal：

```bash
mvn org.apache.maven.plugins:maven-install-plugin:3.1.4:install-file \
  -Dfile=libs/my-utils.jar \
  -DgroupId=com.example \
  -DartifactId=my-utils \
  -Dversion=1.0.0 \
  -Dpackaging=jar
```

這些參數會為 JAR 指定 Maven 座標與 packaging。該 JAR 不必由 Maven 建置，也可以來自 `jar`、`javac`、Gradle 或其他工具。

沒有提供 POM 時，Install Plugin 預設會產生一份最基本的 POM。這份 POM 只包含座標等基本資訊，不會自動找出 JAR 的其他依賴。

## 在其他 Maven 專案中引用這個 JAR

安裝完成後，在使用端專案的 `pom.xml` 加入 dependency：

```xml
<dependencies>
    <dependency>
        <groupId>com.example</groupId>
        <artifactId>my-utils</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>
```

這三個值必須與安裝 JAR 時使用的 Maven 座標一致。接著便可在 Java 程式中引用其 class：

```java
import com.example.myutils.TextUtils;
```

## 假如 JAR 還有其他依賴

- 如果從完整的 Maven 專案執行 `mvn install`，Maven 會一併安裝專案的 POM。使用端便能根據 POM 解析 transitive dependencies。

- 如果手上只有 JAR，最好一併取得原始 POM：

    ```bash
    mvn org.apache.maven.plugins:maven-install-plugin:3.1.4:install-file \
    -Dfile=libs/my-utils.jar \
    -DpomFile=libs/my-utils-pom.xml
    ```

    Install Plugin 會從 POM 讀取座標、packaging 與 dependencies，因此不必再傳入 `groupId`、`artifactId` 和 `version`。

    如果沒有原始 POM，就必須確認該 JAR 依賴哪些套件，再選擇以下其中一種做法：

    1. 自行建立正確的 POM，並透過 `-DpomFile` 一併安裝。
    2. 在每個使用端專案中明確宣告缺少的 dependencies。


## 參考資料

- [Guide to installing 3rd party JARs – Apache Maven](https://maven.apache.org/guides/mini/guide-3rd-party-jars-local.html)
- [Maven Install Plugin: `install-file`](https://maven.apache.org/plugins/maven-install-plugin/install-file-mojo.html)
- [Maven Local Repositories](https://maven.apache.org/repositories/local.html)
