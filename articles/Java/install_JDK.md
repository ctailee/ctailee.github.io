---
title: 安裝 JDK
created_at: 2026-07-02
updated_at: 2026-07-02
tags: [Java, JDK, Environment]
---
前往 https://www.oracle.com/java/technologies/downloads/ 下載 `x64 Compressed Archive`。這個檔案就是一般的壓縮檔。

接下來將他解壓縮到任意資料夾 (這邊以 `.jdks` 這個資料夾做示範)

解壓縮後他會是 `.jdks/jdk-25.0.3`(以 25.0.3 版本的 JDK 示範)

然後設定環境變數:

```bash
export JAVA_HOME="$HOME/.jdks/jdk-25.0.3"
export PATH="$JAVA_HOME/bin:$PATH"
```

這樣就大功告成了! 未來要切換 JDK 版本只需要下載新的壓縮檔並解壓縮到 `.jdks` 然後換一下 `$JAVA_HOME` 就行 !