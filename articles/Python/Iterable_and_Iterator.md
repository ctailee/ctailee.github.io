---
title: Iterable 和 Iterator
created_at: 2026-08-04
updated_at: 2026-08-04
tags: [python, advanced-feature]
---

Iterable 和 iterator 都跟「逐一取出元素」有關，但負責的事情不同：

- **Iterable（可迭代物件）**：代表物件可以被迭代，負責保存資料，能產生 iterator。
- **Iterator（迭代器）**：記錄迭代進度，逐一回傳元素。

## 目錄

- [Iterable 是什麼](#iterable-是什麼)
- [Iterator 是什麼](#iterator-是什麼)
- [for 迴圈如何迭代](#for-迴圈如何迭代)
- [為什麼要分成 Iterable 和 Iterator](#為什麼要分成-iterable-和-iterator)
- [自己實作 Iterator](#自己實作-iterator)
- [將 Iterable 與 Iterator 分開實作](#將-iterable-與-iterator-分開實作)
- [使用 Generator 建立 Iterator](#使用-generator-建立-iterator)

## Iterable 是什麼

Iterable 指的是可以被 `for` 迴圈迭代的物件。常見的 iterable 包括：

- `list`
- `tuple`
- `set`
- `dict`
- `str`

Iterable 必須能透過 `iter()` 取得 iterator：

```python
numbers = [10, 20, 30]
iterator = iter(numbers)
```

`numbers` 是 iterable，`iterator` 則負責實際走訪裡面的元素。

## Iterator 是什麼

Iterator 會記錄目前的迭代位置，並在每次呼叫 `next()` 時回傳下一個元素：

```python
numbers = [10, 20, 30]
iterator = iter(numbers)

print(next(iterator))  # 10
print(next(iterator))  # 20
print(next(iterator))  # 30
```

Iterator 包含兩個方法：

- `__iter__()`：回傳 iterator 本身。
- `__next__()`：回傳下一個元素；沒有元素時拋出 `StopIteration`。

因此，iterator 本身也是 iterable。
不過，iterable 不一定是 iterator。以 `list` 為例，它能產生 iterator，卻不能直接交給 `next()`：

```python
numbers = [10, 20, 30]
next(numbers)
```

這會出現：

```text
TypeError: 'list' object is not an iterator
```

## for 迴圈如何迭代

當我們使用 `for` 迴圈時，Python 會先透過 `iter()` 取得 iterator，再不斷呼叫 `next()`：

```python
for number in numbers:
    print(number)
```

概念上相當於：

```python
iterator = iter(numbers)

while True:
    try:
        number = next(iterator)
        print(number)
    except StopIteration:
        break
```

當 iterator 拋出 `StopIteration`，`for` 迴圈就會自動停止。

## 為什麼要分成 Iterable 和 Iterator

Iterable 和 iterator 之所以分開，是因為「保存資料」和「記錄迭代進度」是兩件不同的事。

以 `list` 為例，它只負責保存資料，沒有唯一的「目前走到哪裡」。每次呼叫 `iter()`，都會產生一個各自記錄進度的 iterator：

```python
numbers = [10, 20, 30]

iterator1 = iter(numbers)
iterator2 = iter(numbers)

print(next(iterator1))  # 10
print(next(iterator1))  # 20

print(next(iterator2))  # 10
```

雖然兩個 iterator 來自同一個 `list`，但它們的進度互不影響。如果把進度直接存在 `list` 裡，同一份資料就只能有一個進度，多個迴圈也會互相干擾。

## 自己實作 Iterator

我們可以實作 `__iter__()` 和 `__next__()`，建立自己的 iterator：

```python
class NumberIterator:
    def __init__(self, start, end):
        self.current = start
        self.end = end

    def __iter__(self):
        return self

    def __next__(self):
        if self.current > self.end:
            raise StopIteration

        value = self.current
        self.current += 1
        return value
```

它可以直接交給 `for` 迴圈：

```python
for number in NumberIterator(1, 3):
    print(number)
```

也能手動呼叫 `next()`：

```python
iterator = NumberIterator(1, 3)

print(next(iterator))  # 1
print(next(iterator))  # 2
print(next(iterator))  # 3
print(next(iterator))  # 拋出 StopIteration
```

要注意，iterator 會保存並消耗自己的進度。走到結尾後，iterator 不會自動回到起點。

## 將 Iterable 與 Iterator 分開實作

前面的 `NumberIterator` 同時是 iterable 和 iterator，因為它的 `__iter__()` 會回傳自己。

第一次迭代結束後，進度已經走到終點，因此第二次不會再產生任何元素:

```python
numbers = NumberIterator(1, 3)

print(list(numbers))  # [1, 2, 3]
print(list(numbers))  # []
```

> 這裡的 `list()` 所做的事情概念上相當於:
>```python
>iterator = iter(numbers)
>
>result = []
>
>while True:
>    try:
>        result.append(next(iterator))
>    except StopIteration:
>        break
>```

如果希望同一個物件能被重複迭代，可以另外建立一個 iterable，專門保存範圍設定；每次呼叫 `iter()` 時，再產生新的 iterator：

```python
class NumberRange:
    def __init__(self, start, end):
        self.start = start
        self.end = end

    def __iter__(self):
        return NumberIterator(self.start, self.end)
```

`NumberRange` 本身不記錄迭代進度。每次呼叫 `iter()`，都會得到一個全新的 `NumberIterator`：

```python
numbers = NumberRange(1, 3)

iterator1 = iter(numbers)
iterator2 = iter(numbers)

print(iterator1 is iterator2)  # False

print(next(iterator1))  # 1
print(next(iterator1))  # 2
print(next(iterator2))  # 1
```

因為每次迭代都有獨立的進度，所以 `numbers` 可以重複使用：

```python
print(list(numbers))  # [1, 2, 3]
print(list(numbers))  # [1, 2, 3]
```

巢狀迴圈也不會互相干擾：

```python
for a in numbers:
    for b in numbers:
        print(a, b)
```

這裡的重點不是「重設同一個 iterator」，而是每次開始迭代時，都建立一個新的 iterator。

## 使用 Generator 建立 Iterator

除了手動實作 iterator protocol，也可以使用 generator。只要 function 中出現 `yield`，它就會成為 generator function：

```python
def number_range(start, end):
    current = start

    while current <= end:
        yield current
        current += 1
```

呼叫 generator function 不會立刻執行函式內容，而是建立一個 generator object：

```python
iterator = number_range(1, 3)

print(type(iterator))               # <class 'generator'>
```

Generator object 自動實作了 `__iter__()` 和 `__next__()`，所以它本身就是 iterator。換句話說：

> 所有 generator 都是 iterator，但不是所有 iterator 都是 generator。

Generator 同樣能透過 `for` 或 `next()` 使用：

```python
for number in number_range(1, 3):
    print(number)
```

```python
iterator = number_range(1, 3)

print(next(iterator))  # 1
print(next(iterator))  # 2
print(next(iterator))  # 3
```

### yield 如何保存狀態

建立 generator object 時，函式主體還不會開始執行。第一次呼叫 `next()`，程式會執行到 `yield`，回傳值後暫停在該位置：

```text
建立 generator object
        ↓
next() → 執行到 yield 1，暫停
        ↓
next() → 從暫停處繼續，執行到 yield 2，暫停
        ↓
next() → 從暫停處繼續，執行到 yield 3，暫停
        ↓
next() → 函式結束，拋出 StopIteration
```

每次恢復執行時，區域變數和目前位置都會被保留下來。因此第二次呼叫 `next()` 時，程式會從上一個 `yield` 的下一行繼續，而不是重新執行整個 function。

### Generator 的優點

手動實作 iterator 時，我們得自己維護狀態，並在資料用完時拋出 `StopIteration`。Generator 則讓 Python 自動處理這些細節：

```python
def number_range(start, end):
    while start <= end:
        yield start
        start += 1
```

兩者都能建立 iterator，但 generator 通常更簡潔，也更容易閱讀。

### Generator 也只能消耗一次

Generator 也會保存自己的進度，因此耗盡後不會自動重新開始：

```python
generator = number_range(1, 3)

print(list(generator))  # [1, 2, 3]
print(list(generator))  # []
```

要重新迭代，必須建立新的 generator：

```python
print(list(number_range(1, 3)))  # [1, 2, 3]
print(list(number_range(1, 3)))  # [1, 2, 3]
```

這兩次呼叫建立的是不同物件：

```python
first = number_range(1, 3)
second = number_range(1, 3)

print(first is second)  # False
```