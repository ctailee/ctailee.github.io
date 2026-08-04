---
title: Base64 Encoding
created_at: 2026-07-24
updated_at: 2026-07-24
tags: [encoding]
---

Base64 是一種編碼方式，用來將任意二進位資料轉成可安全儲存和傳輸的 ASCII 文字。它不是加密演算法，不提供安全性。任何人都能將 Base64 字串解碼回原始資料。

## 目錄

- [為什麼需要 Base64](#為什麼需要-base64)
- [Base64 字元表](#base64-字元表)
- [Base64 如何編碼](#base64-如何編碼)
- [Base64 如何解碼](#base64-如何解碼)
- [Padding（填充字元）](#padding填充字元)
  - [範例：編碼 `on`](#範例編碼-on)
  - [可以省略 Padding 嗎](#可以省略-padding-嗎)
- [URL-safe Base64](#url-safe-base64)
- [常見問題](#常見問題)
  - [為什麼要把一個字串轉成另一個字串](#為什麼要把一個字串轉成另一個字串)
  - [為什麼不能用 UTF-8 將任意二進位資料轉成文字](#為什麼不能用-utf-8-將任意二進位資料轉成文字)
- [References](#references)

## 為什麼需要 Base64？

許多系統以文字為主要資料格式，例如 JSON、電子郵件或只能儲存文字的資料庫欄位。然而，圖片、壓縮檔及加密結果等資料都是位元組。

以加密資料為例：

```text
原始文字
→ UTF-8 編碼
→ byte[]
→ AES 加密
→ 加密後的 byte[]
→ Base64 編碼
→ 可儲存的文字
```

AES 加密後可能產生以下位元組：

```text
FB FF 00 8A 13 D4 7E 91
```

這些位元組不一定符合 UTF-8 格式，因此不能直接透過 UTF-8 解碼成文字。若強制轉換，無法識別的資料可能變成替換字元 `�`，導致原始位元組遺失。而 Base64 則能穩定的將它們轉成由 ASCII 字元組成的文字。

如果資料本來就是一般文字，通常不需要再使用 Base64。Base64 會讓資料增加約三分之一的大小。

## Base64 字元表

標準 Base64 使用 64 個字元表示數值 0～63：

| 數值 | 字元 | 數值 | 字元 | 數值 | 字元 | 數值 | 字元 |
|---:|:---:|---:|:---:|---:|:---:|---:|:---:|
| 0 | A | 16 | Q | 32 | g | 48 | w |
| 1 | B | 17 | R | 33 | h | 49 | x |
| 2 | C | 18 | S | 34 | i | 50 | y |
| 3 | D | 19 | T | 35 | j | 51 | z |
| 4 | E | 20 | U | 36 | k | 52 | 0 |
| 5 | F | 21 | V | 37 | l | 53 | 1 |
| 6 | G | 22 | W | 38 | m | 54 | 2 |
| 7 | H | 23 | X | 39 | n | 55 | 3 |
| 8 | I | 24 | Y | 40 | o | 56 | 4 |
| 9 | J | 25 | Z | 41 | p | 57 | 5 |
| 10 | K | 26 | a | 42 | q | 58 | 6 |
| 11 | L | 27 | b | 43 | r | 59 | 7 |
| 12 | M | 28 | c | 44 | s | 60 | 8 |
| 13 | N | 29 | d | 45 | t | 61 | 9 |
| 14 | O | 30 | e | 46 | u | 62 | + |
| 15 | P | 31 | f | 47 | v | 63 | / |

## Base64 如何編碼？

Base64 會將每 3 bytes（24 bits）的原始資料切成 4 組，每組 6 bits。每組 6 bits 可表示 0～63，再依照字元表轉成對應字元：

```text
3 bytes = 24 bits
24 bits ÷ 6 bits = 4 組
```

以下以文字 `one` 為例。

### 1. 將文字編碼成 bytes

先使用 UTF-8 將文字轉成位元組。`one` 中的字元都屬於 ASCII 範圍，因此每個字元各占 1 byte：

```text
o = 111 = 01101111
n = 110 = 01101110
e = 101 = 01100101
```

### 2. 每 6 bits 分成一組

將三個位元組連接後重新分組：

```text
01101111 01101110 01100101
↓
011011 110110 111001 100101
```

### 3. 查表轉成 Base64 字元

```text
011011 = 27 = b
110110 = 54 = 2
111001 = 57 = 5
100101 = 37 = l
```

因此：

```text
one → b25l
```

## Base64 如何解碼？

解碼就是反向執行相同步驟。先將 `b25l` 轉回每組 6 bits：

```text
b = 27 = 011011
2 = 54 = 110110
5 = 57 = 111001
l = 37 = 100101
```

連接後，每 8 bits 還原成一個 byte：

```text
011011 110110 111001 100101
↓
01101111 01101110 01100101
```

最後使用原本的字元編碼（此例為 UTF-8）解讀這些位元組：

```text
01101111 = 111 = o
01101110 = 110 = n
01100101 = 101 = e
```

因此 `b25l` 會還原成 `one`。

## Padding（填充字元）

Base64 每次以 3 bytes 為一組處理資料。如果最後一組不足 3 bytes，編碼時會先在位元尾端補 `0`，再使用 `=` 將輸出補足 4 個 Base64 字元。

規則如下：

| 原始資料長度除以 3 的餘數 | 最後一組資料量 | Padding | 範例 |
|---:|---:|:---:|:---|
| 0 | 3 bytes | 無 | `one → b25l` |
| 1 | 1 byte | `==` | `o → bw==` |
| 2 | 2 bytes | `=` | `on → b24=` |

### 範例：編碼 `on`

`on` 經 UTF-8 編碼後共有 2 bytes：

```text
o = 01101111
n = 01101110
```

連接並每 6 bits 分組：

```text
01101111 01101110
↓
011011 110110 1110
```

最後一組只有 4 bits，因此在尾端補兩個 `0`：

```text
011011 110110 111000
```

查表後得到三個 Base64 字元：

```text
011011 = 27 = b
110110 = 54 = 2
111000 = 56 = 4
```

由於輸出不足 4 個字元，最後補上一個 `=`：

```text
on → b24=
```

解碼器看到 `=`，便知道最後一組包含編碼時補上的位元。移除這些補位後，即可還原原始資料：

```text
b24=
→ 011011 110110 111000
→ 01101111 01101110 00
→ 01101111 01101110
→ on
```

### 可以省略 Padding 嗎？

部分協定與函式庫允許省略 padding：

```text
bw== → bw
b24= → b24
b25l → b25l
```

省略 `=` 不會改變編碼內容。解碼器可根據 Base64 字串的長度推斷省略了多少 padding。例如，`b24` 等同於 `b24=`，兩者都會解碼成 `on`。

不過，是否能省略 padding 取決於使用的協定與解碼器。若格式有明確規範，應依照該規範處理。

Java 可使用 `withoutPadding()` 產生不含 padding 的 Base64 字串：

```java
Base64.getEncoder().encodeToString(bytes); // b24=

Base64.getEncoder()
        .withoutPadding()
        .encodeToString(bytes);             // b24
```

## URL-safe Base64

標準 Base64 使用的 `+` 和 `/` 在 URL 中具有特殊用途。URL-safe Base64 因此改用以下字元：

```text
+ → -
/ → _
```

其餘編碼原理相同。使用時應確認協定要求的是標準 Base64 還是 URL-safe Base64，避免混用。

Java 可透過 `Base64.getUrlEncoder()` 和 `Base64.getUrlDecoder()` 進行 URL-safe Base64 編解碼：

```java
import java.util.Arrays;
import java.util.Base64;

public class UrlSafeBase64Example {
    public static void main(String[] args) {
        byte[] originalBytes = {
                (byte) 0xFB,
                (byte) 0xFF,
                (byte) 0x00
        };

        String encodedText = Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(originalBytes);

        byte[] decodedBytes = Base64.getUrlDecoder().decode(encodedText);

        System.out.println(encodedText);                         // -_8A
        System.out.println(Arrays.equals(originalBytes, decodedBytes)); // true
    }
}
```

相同資料使用標準 Base64 會得到 `+/8A`，URL-safe Base64 則會得到 `-_8A`。`withoutPadding()` 會省略結尾的 `=`。若使用的協定要求保留 padding，移除這個呼叫即可。

## 常見問題

### 為什麼要把一個字串轉成另一個字串？

Base64 的目的不是轉換普通字串，而是將任意 `byte[]` 包裝成文字。

兩者的用途不同：

```text
UTF-8：Unicode 文字 ↔ 二進位資料
Base64：任意二進位資料 ↔ ASCII 文字
```

例如，`ABC你好` 可直接存入支援 UTF-8 的資料庫或 JSON：

```json
{
  "message": "ABC你好"
}
```

將它編碼成 `QUJD5L2g5aW9` 只會增加資料長度，通常沒有好處。相反地，加密結果、圖片或壓縮檔不是普通文字，才適合在文字格式中使用 Base64 表示。

### 為什麼不能用 UTF-8 將任意二進位資料轉成文字？

UTF-8 是 Unicode 的字元編碼，位元組必須符合特定格式：

```text
0xxxxxxx
110xxxxx 10xxxxxx
1110xxxx 10xxxxxx 10xxxxxx
11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
```

任意二進位資料不一定符合這些規則。例如 `FF`（`11111111`）就不是合法的 UTF-8 位元組。若強制解讀，解碼器可能以 `�` 取代無效資料，使原始位元組無法還原。

Base64 只使用以下 ASCII 字元，因此能安全放進文字系統：

```text
A-Z
a-z
0-9
+
/
=
```

例如：

```text
原始 bytes：FB FF 00
Base64：    +/8A
```

接收方將 `+/8A` 解碼後，便能完整還原為 `FB FF 00`。

## References
- https://www.authgear.com/zh-hant/post/base64-encode-decode-guide/
