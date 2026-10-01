---
title: Go defer 語法
created_at: 2026-10-01
updated_at: 2026-10-01
tags: [golang, basic]
---

`defer` 用來延後函式呼叫。被延後的呼叫會在外層函式即將結束時執行，常用於關閉檔案、釋放鎖或清理其他資源。

## 目錄

- [基本用法](#基本用法)
- [多個 defer 以 LIFO 順序執行](#多個-defer-以-lifo-順序執行)
- [defer 的參數會立刻計算](#defer-的參數會立刻計算)
- [defer 與 return](#defer-與-return)
- [常見用途](#常見用途)
- [迴圈中的 defer](#迴圈中的-defer)
- [重點整理](#重點整理)

## 基本用法

在函式呼叫前加上 `defer`，該呼叫便會延後到外層函式結束前執行：

```go
func example() {
    defer fmt.Println("最後執行")

    fmt.Println("先執行")
}
```

輸出為：

```text
先執行
最後執行
```

無論函式執行到結尾、提早 `return`，或因 `panic` 中止，已註冊的 `defer` 都會執行。不過，若程式直接呼叫 `os.Exit`，`defer` 不會執行。

## 多個 defer 以 LIFO 順序執行

多個 `defer` 會按照 LIFO（Last In, First Out，後進先出）的順序執行，類似堆疊：

```go
func example() {
    defer fmt.Println("第一個註冊")
    defer fmt.Println("第二個註冊")
    defer fmt.Println("第三個註冊")
}
```

輸出為：

```text
第三個註冊
第二個註冊
第一個註冊
```

這種順序很適合用來成對處理資源：越晚取得的資源，越早被釋放。

## defer 的參數會立刻計算

執行到 `defer` 陳述句時，函式本身會延後呼叫，但傳入的參數會立刻計算並保存：

```go
func example() {
    x := 10
    defer fmt.Println(x)

    x = 20
    fmt.Println("end")
}
```

輸出為：

```text
end
10
```

若希望在函式結束時才讀取變數，可以改用匿名函式：

```go
func example() {
    x := 10
    defer func() {
        fmt.Println(x)
    }()

    x = 20
}
```

這次輸出為 `20`，因為匿名函式執行時才會讀取 `x`。

## defer 與 return

`return` 不會讓函式立刻結束。實際順序是：

1. 計算 `return` 後方的運算式。
2. 將結果存入回傳值。
3. 執行已註冊的 `defer`。
4. 正式離開函式並回傳結果。

因此，`defer` 可以修改具名回傳值：

```go
func answer() (result int) {
    defer func() {
        result++
    }()

    return 41
}

fmt.Println(answer()) // 42
```

執行 `return 41` 時，`41` 會先存入 `result`；接著 `defer` 將它加一，最後才回傳 `42`。

只有具名回傳值能被 `defer` 直接修改，因為它是函式作用域內可被匿名函式存取的變數。非具名回傳值也會先被保存，但它沒有可供程式碼使用的變數名稱，因此 `defer` 無法直接修改它：

```go
func answer() int {
    result := 41
    defer func() {
        result++
    }()

    return result
}

fmt.Println(answer()) // 41
```

執行過程可概念化為：

```text
回傳位置 = result  // 複製 41
result++            // defer 將 result 改成 42
return 回傳位置     // 仍然回傳 41
```

`回傳位置` 只是用來解釋的名稱，不能在 Go 程式中直接存取。因為 `41` 已被複製到該位置，之後修改區域變數 `result`，不會改變已保存的回傳值。

雖然在 `defer` 中修改具名回傳值是合法語法，但可能使流程難以理解，應謹慎使用。

## 常見用途

`defer` 最常用來把清理動作放在取得資源的位置附近，降低忘記釋放資源的風險：

```go
file, err := os.Open("data.txt")
if err != nil {
    return err
}
defer file.Close()

// 使用 file
```

同樣的寫法也適用於解鎖：

```go
mu.Lock()
defer mu.Unlock()

// 存取需要保護的資料
```

## 迴圈中的 defer

`defer` 會等到外層函式結束才執行，而不是等到當次迴圈結束。若在長迴圈中持續註冊 `defer`，資源可能長時間無法釋放。

可將每次迴圈的工作拆成一個函式，讓資源在該函式結束時釋放：

```go
for _, name := range names {
    if err := processFile(name); err != nil {
        return err
    }
}

func processFile(name string) error {
    file, err := os.Open(name)
    if err != nil {
        return err
    }
    defer file.Close()

    // 處理 file
    return nil
}
```

## 重點整理

- `defer` 將函式呼叫延後到外層函式結束前執行。
- 多個 `defer` 會按照 LIFO，也就是後進先出的順序執行。
- `defer` 的參數會立刻計算，而不是等到呼叫時才計算。
- `return` 會先決定回傳值，再執行 `defer`。
- `defer` 適合用於關閉檔案、釋放鎖及其他清理工作。
- 避免直接在長迴圈中累積 `defer`。
