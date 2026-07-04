---
title: Maven 中的 source、target 和 release
created_at: 2026-07-04
updated_at: 2026-07-04
tags: [Java, Maven, pom.xml]
--- 

在 Maven 的 `pom.xml` 中，常會看到這樣的設定：

```xml
<properties>
    <maven.compiler.source>XX</maven.compiler.source>
    <maven.compiler.target>YY</maven.compiler.target>
</properties>
```

這裡的 `source` 和 `target` 是給 Java 編譯器看的設定。

簡單來說：

* `source`：限制你可以使用哪一個 Java 版本的語法。
* `target`：限制編譯出來的 `.class` 檔案，要給哪一個版本的 JVM 執行。

例如：

```xml
<properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
</properties>
```

意思是：

* 只能使用 Java 8 支援的語法。
* 編譯出來的 `.class` 能被 Java 8 (及以上)的 JVM 執行。

`source` 主要控制「你能不能寫某個 Java 語法」。

例如 `var` 是 Java 10 才加入的區域變數語法。

如果設定：

```xml
<properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
</properties>
```

然後寫：

```java
var name = "Tai";
```

這會編譯失敗。
原因是 Java 8 不支援 `var` 這個語法。

也就是說，`source=8` 的意思是「用 Java 8 的語法規則檢查程式」，不是「用 JDK 8 編譯」。

---
雖然 `source` 和 `target` 可以分開設定，但通常不建議把它們設成不同版本。

因為這樣容易讓語法版本、class 版本和實際執行環境變得不一致。



### 問題一：`source` 比 `target` 新

```xml
<properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
</properties>
```

這個設定的意思是：

```text
我想使用 Java 17 的語法，
但我想編譯成 Java 8 可以執行的 .class。
```

這通常是不合理的。例如 Java 16 才正式加入 `record`：

```java
public record User(String name, int age) {
}
```

因為 Java 8 沒有 `record` 這個語言特性，也沒有對應的執行支援。所以這種設定很容易編譯失敗。

### 問題二：`source` 比 `target` 舊


```xml
<properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
</properties>
```

這個設定的意思是：

```text
我只允許自己使用 Java 8 語法，
但編譯出來的 .class 要 Java 17 才能執行。
```

這通常可以編譯，但意義不大。因為你明明只使用 Java 8 語法，卻產生 Java 17 才能執行的 `.class`。這會讓你的程式失去相容性。

### 問題三：`source=8`、`target=8` 也不一定真的能在 Java 8 執行

這是最容易被忽略的問題。

假設你用 JDK 17 編譯專案，並且設定：

```xml
<properties>
    <maven.compiler.source>8</maven.compiler.source>
    <maven.compiler.target>8</maven.compiler.target>
</properties>
```

你可能會以為這樣編譯出來的程式一定可以在 Java 8 執行。

但其實不一定。

因為 `source` 和 `target` 主要限制的是：

* 語法版本
* `.class` 檔案版本

它們不一定會限制你使用的 Java 標準 API 版本。

例如你寫：

```java
import java.util.List;

public class Demo {
    public static void main(String[] args) {
        List<String> names = List.of("Tom", "Mary");
        System.out.println(names);
    }
}
```

這段程式使用了：

```java
List.of(...)
```

但是 `List.of(...)` 是 Java 9 才加入的 API。

如果你用 JDK 17 編譯，並且設定 `source=8`、`target=8`，編譯器可能會讓它通過。因為他在編譯的時候的確有這個方法，只是執行的時候沒有這個方法。

當把程式拿到 Java 8 執行時，Java 8 的 `List` 裡面沒有 `of(...)` 這個方法。因此執行時可能會發生：

```text
java.lang.NoSuchMethodError
```

也就是說，編譯成功，不代表真的能在目標 Java 版本執行。


### `release` 是比較新的建議寫法

如果使用比較新的 JDK，通常建議使用 `release`。

例如：

```xml
<properties>
    <maven.compiler.release>25</maven.compiler.release>
</properties>
```

`release` 可以同時處理三件事情：

* 檢查你使用的語法是否被 Java 25 支援。
* 編譯出可以在 Java 25 JVM 執行的 `.class`。
* 檢查你使用的 Java 標準 API 是否存在於 Java 25。

也就是說，`release` 比單獨設定 `source` 和 `target` 更完整。

### `release` 的意思不是「使用哪個 JDK 編譯」

例如你電腦安裝的是 JDK 25，但你設定：

```xml
<properties>
    <maven.compiler.release>17</maven.compiler.release>
</properties>
```

意思不是「使用 JDK 17 編譯」。

它的意思是：

```text
用目前的 JDK 編譯，但請按照 Java 17 的規則產生結果。
```

也就是：

* 只能使用 Java 17 支援的語法。
* 產生 Java 17 可以執行的 `.class`。
* 只能使用 Java 17 已經存在的標準 API。

所以，如果你想發布一個支援 Java 17 以上的 library，可以設定：

```xml
<properties>
    <maven.compiler.release>17</maven.compiler.release>
</properties>
```