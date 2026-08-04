---
title: Decorator 裝飾器
created_at: 2026-08-04
updated_at: 2026-08-04
tags: [python, advanced-feature]
---

## 目錄

- [沒有參數的 decorator](#沒有參數的-decorator)
- [帶參數的 decorator](#帶參數的-decorator)
- [為什麼叫 wrapper](#為什麼叫-wrapper)
- [References](#references)

## 沒有參數的 decorator

先從最常見的 decorator 寫法開始：

```python
@stop_1_second
def do_something():
    print("Do something...")
```

這段語法看起來很神奇，但它其實等同於 Python 直譯器在背後做了這件事：

```python
def do_something():
    print("Do something...")

# @stop_1_second 等同於：
do_something = stop_1_second(do_something)
```

沒錯，它把 `do_something` 傳進 `stop_1_second`，再將回傳值指定回 `do_something`。從這一刻起，`do_something` 再也不是原來的它啦！

那它到底變成了什麼？得先看看 `stop_1_second` 裡面長什麼樣子：

```python
def stop_1_second(func):
    def wrapper():
        time.sleep(1)
        func()

    return wrapper
```

真相大白！`stop_1_second` 在裡面定義了一個新的 function，也就是 `wrapper`。它會先暫停 1 秒，再呼叫傳進來的 `do_something`，最後由 `stop_1_second` 將它回傳。

因此，現在的 `do_something` 其實就是 `wrapper`。當我們呼叫 `do_something()` 時，真正執行的是 `wrapper()`。

把整個過程放在一起看，就會是這樣：

```python
def stop_1_second(func):
    def wrapper():
        time.sleep(1)
        func()

    return wrapper

@stop_1_second
def do_something():
    print("Do something...")

# @stop_1_second 等同於：
# do_something = stop_1_second(do_something)
# do_something = wrapper
```

## 帶參數的 decorator

看完沒有參數的版本，接著來幫 decorator 加上參數。

decorator 本身也是 function，當然也能傳參數呀！寫法就跟平常呼叫 function 一樣：

```python
@stop_x_second(5)
def do_something():
    print("Do something...")
```

那對應的 decorator 該怎麼寫？結構會有億點點變化⋯⋯

```python
def stop_x_second(x):
    def wrapper1(func):
        def wrapper2():
            time.sleep(x)
            func()

        return wrapper2

    return wrapper1
```

哇哩！怎麼又多了一個 function，看起來好複雜⋯⋯別急，只要拆開 Python 直譯器在背後做的事，就會知道這一層是從哪裡冒出來的。

當 decorator 帶有參數時，這段程式：

```python
def do_something():
    print("Do something...")

# @stop_x_second(5) 等同於：
do_something = stop_x_second(5)(do_something)
```

會先執行 `stop_x_second(5)`，把 `5` 傳進去並取得 `wrapper1`。因此可以先看成：

```python
do_something = wrapper1(do_something)
```

接著，它把 `do_something` 傳進 `wrapper1`，並取得 `wrapper2`：

```python
do_something = wrapper2
```

所以繞了一圈，最後的 `do_something` 就是 `wrapper2`！把整個過程攤開來看：

```python
def stop_x_second(x):
    def wrapper1(func):
        def wrapper2():
            time.sleep(x)
            func()

        return wrapper2

    return wrapper1

@stop_x_second(5)
def do_something():
    print("Do something...")

# @stop_x_second(5) 等同於：
# do_something = stop_x_second(5)(do_something)
# -> do_something = wrapper1(do_something)
# -> do_something = wrapper2
```

## 為什麼叫 wrapper

看到這裡，應該就不難理解為什麼內部的 function 經常叫做 `wrapper`（包裝）了：它把原本的 function 包在裡面，再將包裝後的新 function 回傳。

至於使用方式，還是照老樣子呼叫 `do_something()` 就行了。只是它現在已經不是原本的 `do_something`，而是包裝過後的 `wrapper2` 囉～

## References

- [【python】装饰器超详细教学，用尽毕生所学给你解释清楚，以后再也不迷茫了！- 码农高天](https://www.youtube.com/watch?v=GSdEK-JTKiw&t=407s)
- [Python進階技巧 (3) — 神奇又美好的 Decorator ，嗷嗚！- Jack Cheng](https://medium.com/citycoddee/python%E9%80%B2%E9%9A%8E%E6%8A%80%E5%B7%A7-3-%E7%A5%9E%E5%A5%87%E5%8F%88%E7%BE%8E%E5%A5%BD%E7%9A%84-decorator-%E5%97%B7%E5%97%9A-6559edc87bc0)
