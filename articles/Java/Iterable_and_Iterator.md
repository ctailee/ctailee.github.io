---
title: Iterable 和 Iterator
created_at: 2026-08-04
updated_at: 2026-08-04
tags: [java, advanced-feature]
---

在 Java 中，`Iterable` 和 `Iterator` 都跟「逐一取出元素」有關，但負責的事情不同：

- `Iterable<T>`：代表物件可以被迭代，負責保存資料，能產生 iterator。
- `Iterator<T>`：記錄迭代進度，逐一回傳元素。

## 目錄

- [Iterable 是什麼](#iterable-是什麼)
- [Iterator 是什麼](#iterator-是什麼)
- [enhanced for 迴圈如何迭代](#enhanced-for-迴圈如何迭代)
- [為什麼要分成 Iterable 和 Iterator](#為什麼要分成-iterable-和-iterator)
- [自己實作 Iterable 和 Iterator](#自己實作-iterable-和-iterator)
  - [使用匿名 Iterator](#使用匿名-iterator)
  - [使用獨立的 Iterator 類別](#使用獨立的-iterator-類別)
- [Iterator 只能消耗一次](#iterator-只能消耗一次)
- [常見錯誤](#常見錯誤)
  - [重複使用同一個 Iterator](#重複使用同一個-iterator)

## Iterable 是什麼

`Iterable<T>` 表示一個物件可以被逐一走訪。它最重要的方法是：

```java
Iterator<T> iterator();
```

只要 class 實作 `Iterable<T>`，並透過 `iterator()` 提供 iterator，就能交給 enhanced `for` 迴圈：

```java
List<String> languages = List.of("Java", "Kotlin", "Scala");

for (String language : languages) {
    System.out.println(language);
}
```

Java Collections Framework 中常見的 `List`、`Set` 和 `Queue` 都是 iterable。`Map` 本身沒有實作 `Iterable`，但可以迭代它的 `keySet()`、`values()` 或 `entrySet()`：

```java
Map<String, Integer> scores = Map.of(
    "Amy", 90,
    "Bob", 80
);

for (Map.Entry<String, Integer> entry : scores.entrySet()) {
    System.out.println(entry.getKey() + ": " + entry.getValue());
}
```

> Java array 也能使用 enhanced `for`，但 array 並沒有實作 `Iterable`。這是 Java 語言對 array 提供的特殊語法支援。

## Iterator 是什麼

`Iterator<T>` 負責保存迭代進度。它的兩個主要方法是：

```java
boolean hasNext();
T next();
```

- `hasNext()`：判斷是否還有下一個元素。
- `next()`：回傳下一個元素，並將進度往前推進。

例如，可以從 `List` 取得 iterator，再手動走訪元素：

```java
List<Integer> numbers = List.of(10, 20, 30);
Iterator<Integer> iterator = numbers.iterator();

while (iterator.hasNext()) {
    System.out.println(iterator.next());
}
```

如果已經沒有元素卻繼續呼叫 `next()`，必須拋出 `NoSuchElementException`：

```java
Iterator<Integer> iterator = List.of(10).iterator();

System.out.println(iterator.next());  // 10
System.out.println(iterator.next());  // 拋出 NoSuchElementException
```

`Iterator` 還提供 `remove()` 和 `forEachRemaining()`。不過，並非所有 iterator 都支援刪除元素；不支援時，呼叫 `remove()` 會拋出 `UnsupportedOperationException`。

## enhanced for 迴圈如何迭代

當 enhanced `for` 迴圈走訪一個 `Iterable` 時，Java 會先呼叫 `iterator()`，再透過 `hasNext()` 和 `next()` 逐一取得元素：

```java
for (Integer number : numbers) {
    System.out.println(number);
}
```

概念上相當於：

```java
Iterator<Integer> iterator = numbers.iterator();

while (iterator.hasNext()) {
    Integer number = iterator.next();
    System.out.println(number);
}
```

因此，enhanced `for` 並沒有使用另一套神祕機制，只是替我們處理了取得 iterator、檢查元素和推進位置的過程。

## 為什麼要分成 Iterable 和 Iterator

`Iterable` 和 `Iterator` 之所以分開，是因為「保存資料」和「記錄迭代進度」是兩件不同的事。

以 `List` 為例，它負責保存元素，本身沒有唯一的「目前走到哪裡」。每次呼叫 `iterator()`，都會得到一個各自記錄進度的 iterator：

```java
List<Integer> numbers = List.of(10, 20, 30);

Iterator<Integer> iterator1 = numbers.iterator();
Iterator<Integer> iterator2 = numbers.iterator();

System.out.println(iterator1.next());  // 10
System.out.println(iterator1.next());  // 20

System.out.println(iterator2.next());  // 10
```

雖然兩個 iterator 來自同一個 `List`，它們的進度卻互不影響。如果把進度直接存在 `List` 裡，同一份資料就只能有一個進度，多個迴圈也會彼此干擾。

## 自己實作 Iterable 和 Iterator

若資料不是放在標準集合中，例如由 class 自行管理數值範圍或陣列，可以自行實作 `Iterable` 和 `Iterator`。

### 使用匿名 Iterator

以下的 `NumberRange` 代表一段包含起點與終點的整數範圍：

```java
import java.util.Iterator;
import java.util.NoSuchElementException;

public class NumberRange implements Iterable<Integer> {

    private final int start;
    private final int end;

    public NumberRange(int start, int end) {
        if (start > end) {
            throw new IllegalArgumentException(
                "start 不可大於 end"
            );
        }

        this.start = start;
        this.end = end;
    }

    @Override
    public Iterator<Integer> iterator() {
        return new Iterator<>() {

            private int current = start;

            @Override
            public boolean hasNext() {
                return current <= end;
            }

            @Override
            public Integer next() {
                if (!hasNext()) {
                    throw new NoSuchElementException(
                        "沒有下一個元素"
                    );
                }

                return current++;
            }
        };
    }

    public static void main(String[] args) {
        NumberRange range = new NumberRange(3, 7);

        for (int number : range) {
            System.out.println(number);
        }
    }
}
```

`NumberRange` 只保存 `start` 和 `end`。每次呼叫 `iterator()`，匿名類別都會建立新的 `current`，所以不同 iterator 擁有各自的迭代進度。

### 使用獨立的 Iterator 類別

當迭代邏輯變得複雜，與其把所有內容塞進匿名類別，不如建立獨立的 iterator class：

```java
import java.util.Iterator;
import java.util.NoSuchElementException;

public class StringArray implements Iterable<String> {

    private final String[] values;

    public StringArray(String... values) {
        this.values = values.clone();
    }

    @Override
    public Iterator<String> iterator() {
        return new StringArrayIterator(values);
    }

    private static class StringArrayIterator
            implements Iterator<String> {

        private final String[] values;
        private int index;

        private StringArrayIterator(String[] values) {
            this.values = values;
        }

        @Override
        public boolean hasNext() {
            return index < values.length;
        }

        @Override
        public String next() {
            if (!hasNext()) {
                throw new NoSuchElementException();
            }

            return values[index++];
        }
    }

    public static void main(String[] args) {
        StringArray languages =
            new StringArray("Java", "Kotlin", "Scala");

        for (String language : languages) {
            System.out.println(language);
        }
    }
}
```

這裡的分工很明確：

- `StringArray` 保存資料並實作 `Iterable<String>`。
- `StringArrayIterator` 保存 `index` 並實作 `Iterator<String>`。
- 每次呼叫 `StringArray.iterator()`，都會建立新的 `StringArrayIterator`。

## Iterator 只能消耗一次

Iterator 會持續更新自己的進度，因此走到結尾後不會自動回到起點：

```java
List<Integer> numbers = List.of(1, 2, 3);
Iterator<Integer> iterator = numbers.iterator();

iterator.forEachRemaining(System.out::println);  // 1、2、3
iterator.forEachRemaining(System.out::println);  // 沒有輸出
```

如果想重新迭代，應該向 `Iterable` 取得新的 iterator：

```java
Iterator<Integer> first = numbers.iterator();
Iterator<Integer> second = numbers.iterator();

System.out.println(first == second);  // false
```

這也是同一個集合可以重複交給 enhanced `for` 的原因。每次進入迴圈時，都會重新呼叫 `iterator()`：

```java
for (Integer number : numbers) {
    System.out.println(number);
}

for (Integer number : numbers) {
    System.out.println(number);
}
```

兩次迴圈各自使用新的 iterator，所以都會完整輸出 `1、2、3`。

## 常見錯誤

### 重複使用同一個 Iterator

實作 `Iterable` 時，不要讓 `iterator()` 每次都回傳同一個 iterator：

```java
// 不建議
private final Iterator<String> iterator = names.iterator();

@Override
public Iterator<String> iterator() {
    return iterator;
}
```

第一次迭代結束後，這個 iterator 已經耗盡。之後即使再次進入 enhanced `for`，也拿不到任何元素。

正確方式是每次呼叫 `iterator()`，都建立或取得一個新的 iterator：

```java
@Override
public Iterator<String> iterator() {
    return names.iterator();
}
```