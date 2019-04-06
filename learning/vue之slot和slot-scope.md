# 深入理解vue中的slot与slot-scope

slot: 插槽，是组件的一块HTML模版。这块模版显示及不显示，以及怎么显示、显示内容由父组件决定。
从模版种类的角度来区分可以分为非插槽模版和插槽模版，非插槽模版指的是html模版，比如div、span、ul等。插槽模版是slot，是一个空壳，他的显示与隐藏及内容都是由父组件控制。但是插槽的位置是由插槽自身决定，slot可以写在template的什么位置，父组件传递过来的模版就展示在什么位置。

## 单个插槽/默认插槽/匿名插槽

单个插槽是vue的官方叫法，也可以叫默认插槽，或匿名插槽与具名插槽相对应。它不用设置name属性并且一个子组件下只有一个匿名插槽，但是具名插槽可以有多个，只要名字不相同即可。

匿名插槽例子如下：

``` html
<!-- 父组件 -->
<template>
    <div class="father">
        <h3>父组件<h3>
        <child>
            <div class="slot-template">
                <ul>
                    <li>*</li>
                    <li>**</li>
                    <li>***</li>
                <ul>
            <div>
        </child>
    </div>
</template>
```

``` html
<!-- 子组件 -->
<template>
    <div class="child">
        <h3>子组件<h3>
        <slot></slot>
    </div>
</template>
```

在上面两段代码中，父组件里写了html模版，子组件的匿名插槽将被替换。即子组件如下所示：

``` html
    <div class="child">
        <h3>子组件<h3>
        <!-- <slot></slot> -->
        <div class="slot-template">
                <ul>
                    <li>*</li>
                    <li>**</li>
                    <li>***</li>
                <ul>
            <div>
    </div>
```

最终渲染将如下：

``` html
<div class="father">
    <h3>父组件<h3>
    <div class="child">
        <h3>子组件<h3>
        <!-- <slot></slot> -->
        <div class="slot-template">
            <ul>
                <li>*</li>
                <li>**</li>
                <li>***</li>
            <ul>
        <div>
    </div>
</div>
```

## 具名插槽

上面我们看到，匿名插槽slot没有name属性，而具名插槽就是增加了name属性。具名插槽可以在组件中出现多次，出现在不同位置。

``` html
<!-- 父组件 -->
<template>
    <div class="father">
        <h3>父组件</h3>
        <child>
            <div class="slot-template" slot="slot1">
                <ul>
                    <li>*</li>
                    <li>**</li>
                    <li>***</li>
                <ul>
            <div>
            <div class="slot-template" slot="slot2">
                <ul>
                    <li>#</li>
                    <li>##</li>
                    <li>###</li>
                <ul>
            <div>
            <div class="slot-template">
                <ul>
                    <li>@</li>
                    <li>@@</li>
                    <li>@@@</li>
                <ul>
            <div>
        </child>
    </div>
</template>
```

在父组件中有两个具名插槽，分别为slot1，slot2，一个匿名插槽。

``` html
<template>
    <div class="child">
        <h3>子组件</h3>
        <slot name="slot1"></slot>
        <slot name="slot2"></slot>
        <slot></slot>
    <div>
</template>
```

最终渲染将如下：

```html
<div class="father">
        <h3>父组件</h3>
        <div class="child">
            <h3>子组件</h3>
            <div class="slot-template" slot="slot1">
                <ul>
                    <li>*</li>
                    <li>**</li>
                    <li>***</li>
                <ul>
            <div>
            <div class="slot-template" slot="slot2">
                <ul>
                    <li>#</li>
                    <li>##</li>
                    <li>###</li>
                <ul>
            <div>
            <div class="slot-template">
                <ul>
                    <li>@</li>
                    <li>@@</li>
                    <li>@@@</li>
                <ul>
            <div>
        <div>
    </div>
```

## 作用域插槽/带数据的插槽

作用域插槽即带数据的插槽，父组件只负责样式，数据内容由子组件决定。

``` html
<!-- 父组件 -->
<template>
    <div class="father">
        <h3>父组件</h3>
        <child>
            <template slot-scope="data">
                <span>{{data.user}}</span>
            </template>
        </child>
        <child>
            <template slot-scope="data">
                <span>{{data.id}}</span>
            </template>
        </child>
        <child>
            这是模版
        </child>
    </div>
</template>
```

``` html
<!-- 子组件 -->
<template>
    <div>
        <h3>子组件</h3>
        作用域插槽
        <slot :data="data"></slot>
    </div>
</template>
```

``` js
export default {
    data: function(){
      return {
        data: {
            id: 1213132,
            user: '我是用户'
        }
      }
    }
}
```

渲染将如下：

``` html
<!-- 父组件 -->
<template>
    <div class="father">
        <h3>父组件</h3>
        <div>
            <h3>子组件</h3>
            <span>{{data.user}}</span>
        </div>
        <div>
            <h3>子组件</h3>
            <span>{{data.id}}</span>
        </div>
        <div>
            <h3>子组件</h3>
            这是模版
        </div>
    </div>
</template>
```

参考：[https://juejin.im/post/5a69ece0f265da3e5a5777ed](https://juejin.im/post/5a69ece0f265da3e5a5777ed)