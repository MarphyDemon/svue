# Event Loop

![可视化描述](https://developer.mozilla.org/files/4617/default.svg)

## 堆

>堆是一种数据结构，是通过完全二叉树维护的一组数据。

堆分为两类，根结点最大的称为最大堆或大根堆，根结点最小的称为最小堆或小根堆。
堆是线性数据结构，相当于一维数组，有唯一继承。

## 栈

>栈是一种数据结构，仅在表尾进行插入或删除操作的线性表。

栈是按照后进先出的原则存储数据（LIFO）。

```js
    function foo(b) {
        var a = 10;
        return a + b + 11;
    }
    function bar(c) {
        var y = 3;
        return foo(c * y);
    }
    console.log(bar(7))
```

函数调用形成了一个栈帧。
当调用bar时，创建第一个帧进入栈，帧中包含bar的参数和局部变量（例如一个羽毛球筒，此时装入第一个球），当bar调用foo时，创建第二个帧进入栈，并被压到第一个帧上，帧中包含了foo的参数和局部变量（第二个羽毛球装入）。当foo返回之后，最上层的帧被弹出栈。当bar返回之后，栈空。

## 队列

>队列是一种先进先出的线性表，在队列的两端分别进行插入和删除操作（FIFO）。

队列的数据元素又成为队列元素，队列中没有元素时称为空队列。

## 事件循环

在JavaScript中，任务被分为两种，一种宏任务（MacroTask），一种叫微任务（MicroTask）。

### MacroTask（宏任务）

Script全部代码（console.log）、setTimeOut、setInterval、setImmediate(游览器暂不支持，只有ie10支持)、I/O、UI Rendering。

### MicroTask（微任务）

Process.nextTick(Node独有)、promise、object.observe(废弃)、[MutationObserver](http://javascript.ruanyifeng.com/dom/mutationobserver.html)

## 游览器中的Event Loop

JavaScript有一个main thread主线程和call-stack调用栈（执行栈），所有的任务都会被放到调用栈的等待主线程执行。

### JS掉用栈

JS调用采用后进先出，函数执行时，添加在栈的顶部，当执行栈执行完成后，从栈顶移出，直到栈内被清空。
例如：

``` js
    console.log(1)
    console.log(2)
    // 1
    // 2
```

### 同步任务和异步任务

JavaScript单线程任务被分为同步任务和异步任务。同步任务会在调用栈中按照顺序等待主线程依次执行，异步任务会在异步任务有了结果后，将注册的回掉函数放入任务队列中等待主线程空闲的时候（调用栈被清空），被读取到栈内等待主线程的执行。
