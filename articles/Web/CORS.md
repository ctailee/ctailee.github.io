---
title: CORS
created_at: 2026-07-23
updated_at: 2026-07-23
tags: [web, security]
---

前端明明收到了後端的 response，瀏覽器卻跳出 CORS 錯誤，JavaScript 也讀不到資料。這通常不是 API 壞了，而是瀏覽器正在執行同源政策。

CORS（Cross-Origin Resource Sharing，跨來源資源共享）是一套以 HTTP header為基礎的機制。伺服器透過它告訴瀏覽器：「哪些來源可以讀取我的 response。」。

## 目錄

- [什麼是來源](#什麼是來源)
- [為什麼需要 CORS](#為什麼需要-cors)
- [瀏覽器如何處理跨來源 request](#瀏覽器如何處理跨來源-request)
  - [簡單 request](#簡單-request)
  - [預檢 request](#預檢-request)
- [在 Spring Boot 設定 CORS](#在-spring-boot-設定-cors)
- [常見誤解](#常見誤解)
- [參考資料](#參考資料)

## 什麼是來源

一個來源（origin）由三部分組成：

```text
[https]://[example.com]:[443]
   ↓            ↓         ↓
通訊協定     主機名稱    連接埠
```

只要通訊協定（scheme）、主機名稱（host）或連接埠（port）有一項不同，就是不同來源。以下網址與 `https://example.com` 都不屬於同一來源：

- `http://example.com`：通訊協定不同
- `https://api.example.com`：主機名稱不同
- `https://example.com:8443`：連接埠不同

路徑不屬於來源的一部分，因此 `https://example.com/products` 與 `https://example.com/api/orders` 仍是同一來源。

> URL 省略連接埠時，瀏覽器會使用該通訊協定的預設值。例如 `https://example.com` 與 `https://example.com:443` 是同一來源。

## 為什麼需要 CORS

假設使用者開啟 `https://shop.example`，頁面中的 JavaScript 想向另一個來源取得資料：

```javascript
fetch("https://api.example/data");
```

瀏覽器的同源政策（Same-Origin Policy）預設會限制程式讀取跨來源 response，避免網站讀取其他來源中的敏感資料。不過，現代網站經常將前端與 API 部署在不同來源，因此需要一種安全、明確的放行方式。CORS 正是伺服器用來放寬同源政策的機制。

若要允許 `https://shop.example` 讀取 response，可以在 response header 加入：

```http
Access-Control-Allow-Origin: https://shop.example
```

瀏覽器確認 header 符合發出 request 的來源後，才會把 response 交給 JavaScript。若 header 缺少或不符，JavaScript 只會得到失敗結果，瀏覽器主控台則會顯示 CORS 錯誤。

## 瀏覽器如何處理跨來源 request

CORS request 大致分為「簡單 request」與需要預檢的 request。

### 簡單 request

符合特定條件的 `GET`、`HEAD` 或 `POST` request 可直接送往伺服器。例如：

```javascript
fetch("https://api.example/data");
```

瀏覽器會在 request 中自動加入來源：

```http
Origin: https://shop.example
```

伺服器照常處理 request，再以 `Access-Control-Allow-Origin` 表明是否允許該來源讀取 response。要注意：即使瀏覽器最後不讓 JavaScript 讀取 response，request 本身仍可能已經抵達伺服器並產生效果。

### 預檢 request

當 request 超出「簡單 request」的範圍，例如使用 `PUT`、`DELETE`、`Content-Type: application/json` 或自訂 header 時，瀏覽器通常會先送出一個 `OPTIONS` 預檢 request：

```http
OPTIONS /data HTTP/1.1
Origin: https://shop.example
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: content-type
```

伺服器可透過 response header 允許來源、方法與 header：

```http
Access-Control-Allow-Origin: https://shop.example
Access-Control-Allow-Methods: PUT
Access-Control-Allow-Headers: Content-Type
```

只有預檢通過後，瀏覽器才會送出真正的 `PUT` request。因此，排查 CORS 問題時，除了實際 API，也要確認 `OPTIONS` request 是否成功。

## 在 Spring Boot 設定 CORS

假設前端位於 `https://example.com`，API 位於 `https://api.example.com`。由於兩者的主機名稱不同，API 必須允許前端的來源：

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // ** 表示任意路徑
                .allowedOrigins(
                        "https://example.com",
                        "http://localhost:5173",
                        "http://127.0.0.1:5173"
                )
                .allowedMethods(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE"
                )
                .allowedHeaders("Content-Type", "Authorization");
    }
}
```

這份設定代表：

- 只對 `/api/**` 路徑套用規則。
- 允許前端與本機開發環境存取。
- 只開放列出的 HTTP 方法與 request header。

## 常見誤解

**CORS 錯誤代表後端沒有收到 request 嗎？**

不一定。簡單 request 可能已由伺服器處理，只是瀏覽器不讓 JavaScript 讀取 response；需要預檢的 request 則可能在 `OPTIONS` 階段就被擋下。

**使用 Postman 或後端程式呼叫 API，為什麼沒有 CORS 問題？**

CORS 是瀏覽器對網頁程式實施的限制，不是伺服器之間的通用網路限制。Postman、`curl` 與後端服務不會替網頁執行同源政策。

**前端可以自行修正 CORS 嗎？**

通常不行。允許哪些來源必須由 API 的 response header 決定。關閉瀏覽器安全機制或使用 `mode: "no-cors"`，都不能讓 JavaScript 正常讀取受限制的 response。

**同源 request 需要 CORS 嗎？**

不需要。例如頁面與 API 都位於 `https://example.com`，即使路徑分別是 `/products` 與 `/api/orders`，仍屬於同一來源。

## 參考資料

- [MDN：Cross-Origin Resource Sharing（CORS）](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS)
- [MDN：Same-origin policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
- [Spring Framework：CORS](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)
