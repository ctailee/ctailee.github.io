---
title: switch
created_at: 2026-10-01
updated_at: 2026-10-01
tags: [golang, basic]
---

Go 的 `switch` 會依序檢查各個 `case`，執行第一個符合條件的分支。它不只能比對固定值，也能處理多個值、條件運算式與型別判斷，因此常可取代冗長的 `if-else`。核心邏輯就是在 `switch` 後面的那個值，會一一去比對 `case` 後面的值，也就是 `a == b`, `a == c`, `a == d`。

```go
switch a {
case b: // ...
case c: // ...
case d: // ...
default: // ...
}
```

## 目錄

- [基本語法](#基本語法)
- [一個 case 比對多個值](#一個-case-比對多個值)
- [省略 switch 運算式](#省略-switch-運算式)
- [在 switch 中宣告變數](#在-switch-中宣告變數)
- [使用 fallthrough](#使用-fallthrough)
- [Type switch：判斷型別](#type-switch判斷型別)
- [重點整理](#重點整理)

## 基本語法

`switch` 會將運算式的結果與每個 `case` 比對。找到相等的分支後便執行其內容；若都不符合，則執行可選的 `default`。

```go
day := "Sunday"

switch day {
case "Monday":
    fmt.Println("星期一")
case "Sunday":
    fmt.Println("星期日")
default:
    fmt.Println("其他日子")
}
```

Go 在分支執行完畢後會自動離開 `switch`，所以一般情況不需要撰寫 `break`。這與 C、Java 等語言的預設行為不同。

## 一個 case 比對多個值

以逗號分隔多個值，表示其中任何一個值符合時都執行該分支：

```go
day := "Saturday"

switch day {
case "Saturday", "Sunday":
    fmt.Println("週末")
default:
    fmt.Println("平日")
}
```

## 省略 switch 運算式

省略 `switch` 後方的運算式時，效果等同於 `switch true`。每個 `case` 可直接放布林條件，適合取代多層 `if-else`：

```go
score := 85

switch {
case score >= 90:
    fmt.Println("A")
case score >= 80:
    fmt.Println("B")
case score >= 60:
    fmt.Println("C")
default:
    fmt.Println("不及格")
}
```

條件會由上而下檢查，並只執行第一個符合的分支。因此範圍有重疊時，應將限制較嚴格的條件放在前面。

## 在 switch 中宣告變數

可以在 `switch` 的運算式前加入簡短陳述句（short statement）。其中宣告的變數只在該 `switch` 內有效：

```go
func statusCode() int {
    return 200
}

switch code := statusCode(); code {
case 200:
    fmt.Println("成功")
case 404:
    fmt.Println("找不到資源")
default:
    fmt.Println("其他狀態")
}
```

這種寫法能讓暫時使用的變數留在最小作用域內。

## 使用 fallthrough

若分支最後寫上 `fallthrough`，程式會直接執行下一個 `case` 的內容，不會再判斷下一個 `case` 是否符合：

```go
n := 1

switch n {
case 1:
    fmt.Println("one")
    fallthrough
case 2:
    fmt.Println("one or two")
}
```

輸出為：

```text
one
one or two
```

`fallthrough` 容易讓控制流程變得難以理解，通常只在確實需要共用下一個分支行為時使用。它不能出現在最後一個 `case`，也不能用於 type switch。

## Type switch：判斷型別

Type switch 用來判斷 interface 值實際存放的型別。語法是在型別斷言中使用 `.(type)`：

```go
func printValue(value any) {
    switch v := value.(type) {
    case int:
        fmt.Printf("整數：%d\n", v)
    case string:
        fmt.Printf("字串：%s\n", v)
    case nil:
        fmt.Println("nil")
    default:
        fmt.Printf("其他型別：%T\n", v)
    }
}
```

在 `case int` 中，`v` 是 `int`；在 `case string` 中，`v` 則是 `string`。這能避免逐一撰寫多次型別斷言。

## 重點整理

- `case` 由上而下比對，只執行第一個符合的分支。
- Go 的 `switch` 預設不會自動落入下一個分支，因此通常不需要 `break`。
- 同一個 `case` 可以用逗號列出多個值。
- 省略運算式的 `switch` 適合表達多組條件判斷。
- 簡短陳述句可用來建立僅限 `switch` 內使用的變數。
- `fallthrough` 會無條件執行下一個分支，應謹慎使用。
- Type switch 可依 interface 值的實際型別分流。
