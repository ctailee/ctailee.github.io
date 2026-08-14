---
title: XML 筆記
created_at: 2026-08-14
updated_at: 2026-08-14
tags: [data-format]
---

學習 Java 時，我經常接觸 Maven 專案中的 `pom.xml`；碩士期間也讀過不少 XBRL 報表。雖然大致看得懂檔案內容，對某些細節卻始終一知半解，因此寫下這篇筆記加以整理。

## 目錄

- [Namespace（命名空間）](#namespace命名空間)
- [Schema](#schema)
- [額外說明](#額外說明)
  - [`attributeFormDefault` 如何影響 attribute](#attributeformdefault-如何影響-attribute)
    - [`attributeFormDefault="unqualified"`](#attributeformdefaultunqualified)
    - [`attributeFormDefault="qualified"`](#attributeformdefaultqualified)
  - [使用 `xs:anyAttribute` 接受其他 attribute](#使用-xsanyattribute-接受其他-attribute)

## Namespace（命名空間）

許多程式語言都有 namespace 的概念。以 Java 為例，檔案開頭經常會出現：

```java
package org.example;
```

這表示檔案中的程式碼屬於 `org.example` 這個 package。它的主要作用之一，是避免同名類別彼此衝突。例如：

```java
package org.example.guardians;

class Baseball {}
```

```java
package org.example.brothers;

class Baseball {}
```

如果只說 `Baseball`，沒人知道指的是富邦悍將還是中信兄弟；加上 package 後，就能明確指出 `org.example.guardians.Baseball`。換句話說，namespace 會為名稱補上識別範圍，避免歧義與衝突。

回到 XML，我們經常會看到以下寫法：

```xml
<project 
    xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="
    http://maven.apache.org/POM/4.0.0 
    http://maven.apache.org/xsd/maven-4.0.0.xsd"
>
</project>
```

其中，`xmlns="http://maven.apache.org/POM/4.0.0"` 宣告了預設命名空間。這串字雖然長得像網址，實際上是用來識別命名空間的 URI；它不保證能像一般網址一樣開啟，也不會從裡面下載東西。採用 URI 是為了降低名稱重複的機率，概念上與 Java package 類似。

這項宣告表示 `<project>` 本身及其內部所有未加 prefix 的元素，預設都屬於 `http://maven.apache.org/POM/4.0.0` 命名空間。

```xml
<project 
    xmlns="http://maven.apache.org/POM/4.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:user="http://ctailee.com/user"
    xsi:schemaLocation="
    http://maven.apache.org/POM/4.0.0 
    http://maven.apache.org/xsd/maven-4.0.0.xsd"
>
    <!-- 有 prefix -->
    <user:age>26</user:age>

    <!-- 沒有 prefix -->
    <age>26</age>

</project>
```

由於 `<age>` 沒有 prefix，其展開名稱（expanded name）是 `{http://maven.apache.org/POM/4.0.0}age`；`<user:age>` 的展開名稱則是 `{http://ctailee.com/user}age`。兩者的 local name 都是 `age`，但命名空間不同，因此代表不同的元素。

我們能夠宣告另一個命名空間，並將它綁定至 prefix：

```xml
xmlns:user="http://ctailee.com/user"
```

這行將 prefix `user` 綁定至 `http://ctailee.com/user`。因此，`user:age` 的展開名稱是 `{http://ctailee.com/user}age`。

`xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"` 也是相同用法：它將 prefix `xsi` 綁定至 `http://www.w3.org/2001/XMLSchema-instance`。

> 特別注意：預設命名空間只適用於沒有 prefix 的元素，不會自動套用至 attribute。例如：
>
> ```xml
> <project xmlns="http://ctailee.com/user">
>     <user id="1"></user>
> </project>
> ```
>
> `project` 和 `user` 都是沒有 prefix 的元素，展開名稱分別是 `{http://ctailee.com/user}project` 與 `{http://ctailee.com/user}user`。`id` 則是未加 prefix 的 attribute，因此不屬於任何命名空間，展開名稱是 `{}id`。若要讓 attribute 屬於某個命名空間，必須明確加上 prefix。

## Schema

前面的範例包含以下內容：

```xml
<project 
    ...
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="
    http://maven.apache.org/POM/4.0.0 
    http://maven.apache.org/xsd/maven-4.0.0.xsd"
    ...
>
```

這段內容為 XML 處理工具提供 Schema 位置的提示。首先，`xmlns:xsi` 將 `xsi` 綁定至 `http://www.w3.org/2001/XMLSchema-instance`。`xsi` 是 XML Schema Instance 的慣用 prefix，但 prefix 本身只是別名，也可以換成其他名稱。真正用來識別命名空間的是 URI。

接著，`xsi:schemaLocation` 是 W3C XML Schema 規範定義的 attribute。它的值以空白分隔，內容兩兩一組：前者是命名空間 URI，後者是對應 Schema 文件的位置。例如：

```xml
xsi:schemaLocation="
    http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd
    http://ctailee.com/user ./folder/schema.xsd
"
```

這裡提供了兩組命名空間與 Schema 位置：`http://maven.apache.org/POM/4.0.0` 對應 `http://maven.apache.org/xsd/maven-4.0.0.xsd`（此處確實是可定位資源的 URL），而 `http://ctailee.com/user` 對應 `./folder/schema.xsd`。

`{http://www.w3.org/2001/XMLSchema-instance}schemaLocation` 是標準化的展開名稱。假如每家公司都自行定義 attribute，例如：

- `http://companyA.com:schemaFile`
- `http://companyB.com:schema`
- `http://companyc.com:validation`

XML 處理工具便無法用一致的方式辨識 Schema 的位置。透過標準化的 `xsi:schemaLocation`，支援 Schema 驗證的工具便能讀取各命名空間所對應的 schema file。

Schema 的用途是描述 XML 文件的結構與限制，例如某個元素可包含哪些子元素與 attribute、資料型別為何，以及子元素必須依何種順序出現。以下是一個簡單範例：

```xml
<?xml version="1.0" encoding="UTF-8"?>

<xs:schema
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    targetNamespace="http://ctailee.com/user"
    xmlns="http://ctailee.com/user"
    elementFormDefault="qualified">

    <!-- 定義 user 元素 -->
    <xs:element name="user">
        <xs:complexType>

            <!-- sequence 表示元素必須按照這個順序出現 -->
            <xs:sequence>
                <xs:element name="name" type="xs:string"/>
                <xs:element name="email" type="xs:string"/>
                <xs:element name="age" type="xs:integer" minOccurs="0"/>
            </xs:sequence>

            <!-- user 元素可以有 id 屬性 -->
            <xs:attribute name="id" type="xs:string" use="required"/>

        </xs:complexType>
    </xs:element>

</xs:schema>
```

例如符合這個 Schema 的 XML 可以寫成：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<user xmlns="http://ctailee.com/user" id="u001">
    <name>王小明</name>
    <email>ming@example.com</email>
    <age>25</age>
</user>
```

各項設定的含義如下：

- `<xs:sequence>`：定義 `user` 包含的子元素及其順序；此處依序為 `name`、`email`、`age`。
- `type="xs:string"`：指定元素的資料型別；此處 `name` 和 `email` 都是字串。
- `type="xs:integer"`：規定 `age` 必須是整數。
- `minOccurs="0"`：表示 `age` 是可省略的元素。
- `<xs:attribute>`：定義 `user` 可擁有的 attribute。
- `use="required"`：表示 `id` attribute 不可省略。
- `targetNamespace="http://ctailee.com/user"`：表示這份 Schema 宣告的全域元素與型別屬於 `http://ctailee.com/user` 命名空間。

若只有 XML 文件，一般 parser 只會檢查文件是否符合 XML 的基本語法，例如標籤是否正確成對與巢狀；它不會判斷元素和 attribute 是否符合特定應用的規格。因此，未進行 Schema 驗證時，即使寫成以下內容：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<NonUser xmlns="http://ctailee.com/user" id="u001">
    <name>王小明</name>
    <email>-99</email>
    <age>台灣大學</age>
</NonUser>
```

parser 仍可能判定它是一份語法正確的 XML。只有使用支援 XML Schema 的驗證器，並指定相應的 Schema 後，才能檢查元素、attribute、資料型別與順序是否符合規範。

總結來說，命名空間用來區分同名項目，Schema 則可定義特定命名空間中元素與 attribute 的結構及限制。兩者經常搭配使用，但並非每個命名空間都必須對應一份 Schema，一個 Schema 也可能引用或匯入其他命名空間的 Schema。


## 額外說明

### `attributeFormDefault` 如何影響 attribute

XML Schema 驗證 attribute 時，比對的是展開名稱，也就是 `{namespace URI}local name`，而不是只看 `id` 這個 local name。例如，以下三種寫法代表三個不同的 attribute：

```xml
<!-- 展開名稱：{}id -->
<user
    xmlns="http://ctailee.com/user"
    id="u001"/>

<!-- 展開名稱：{http://ctailee.com/user}id -->
<user
    xmlns="http://ctailee.com/user"
    xmlns:u="http://ctailee.com/user"
    u:id="u001"/>

<!-- 展開名稱：{http://ctailee.com/bbb}id -->
<user
    xmlns="http://ctailee.com/user"
    xmlns:b="http://ctailee.com/bbb"
    b:id="u001"/>
```

第一個 `id` 沒有 prefix，因此不屬於任何命名空間。後兩個 `id` 則分別屬於 `http://ctailee.com/user` 和 `http://ctailee.com/bbb`。這也再次說明：預設命名空間只適用於元素，不會套用至沒有 prefix 的 attribute。

#### `attributeFormDefault="unqualified"`

假設 Schema 如下：

```xml
<xs:schema
    xmlns:xs="http://www.w3.org/2001/XMLSchema"
    targetNamespace="http://ctailee.com/user"
    xmlns="http://ctailee.com/user"
    elementFormDefault="qualified"
    attributeFormDefault="unqualified">

    <xs:element name="user">
        <xs:complexType>
            <xs:attribute name="id" type="xs:string" use="required"/>
        </xs:complexType>
    </xs:element>

</xs:schema>
```

`id` 是宣告在 `user` 內部的 local attribute。由於 `attributeFormDefault` 是 `unqualified`，它不屬於任何命名空間，展開名稱為 `{}id`。

| XML attribute | 展開名稱 | 驗證結果 |
| --- | --- | --- |
| `id="u001"` | `{}id` | 符合 |
| `u:id="u001"` | `{http://ctailee.com/user}id` | 不符合 |
| `b:id="u001"` | `{http://ctailee.com/bbb}id` | 不符合 |

因此，以下 XML 可以通過驗證：

```xml
<user xmlns="http://ctailee.com/user" id="u001"/>
```

若改用 `u:id`，驗證器可能同時回報「`u:id` 未被允許」及「缺少必要的 `id`」。這是因為 `{http://ctailee.com/user}id` 與 `{}id` 是兩個不同的名稱；前者不能取代後者。

#### `attributeFormDefault="qualified"`

若將設定改為：

```xml
attributeFormDefault="qualified"
```

同一個 local attribute `id` 就會屬於 Schema 的 target namespace，展開名稱為 `{http://ctailee.com/user}id`。驗證結果也會隨之改變：

| XML attribute | 展開名稱 | 驗證結果 |
| --- | --- | --- |
| `id="u001"` | `{}id` | 不符合 |
| `u:id="u001"` | `{http://ctailee.com/user}id` | 符合 |
| `b:id="u001"` | `{http://ctailee.com/bbb}id` | 不符合 |

此時，attribute 必須透過 prefix 明確指定命名空間：

```xml
<user
    xmlns="http://ctailee.com/user"
    xmlns:u="http://ctailee.com/user"
    u:id="u001"
/>
```

需要注意的是，`attributeFormDefault` 只決定 local attribute declaration 預設是否屬於 target namespace。直接宣告在 `<xs:schema>` 底下的 global attribute 一律屬於 target namespace；也可以在個別 local attribute 上使用 `form="qualified"` 或 `form="unqualified"` 覆寫預設值。

### 使用 `xs:anyAttribute` 接受其他 attribute

無論 `attributeFormDefault` 設為何，`b:id` 的展開名稱都是 `{http://ctailee.com/bbb}id`，不會與前述 `id` 宣告相符。若 Schema 需要接受其他命名空間的 attribute，可以加入 `xs:anyAttribute`：

```xml
<xs:complexType>
    <xs:attribute name="id" type="xs:string" use="required"/>
    <xs:anyAttribute namespace="##other" processContents="lax"/>
</xs:complexType>
```

其中，`namespace="##other"` 表示可接受非 target namespace 的 attribute；`processContents="lax"` 表示驗證器若找得到對應宣告就進行驗證，找不到時仍可接受該 attribute。

不過，`xs:anyAttribute` 只會讓 `b:id` 成為可接受的額外 attribute，不會讓它取代原本宣告的必要 `id`。以上例而言，文件仍須另外提供符合宣告的 `id`，才能通過完整驗證。
