# svue

## 目录

``` md
svue
│   example.html   // 调用vue演示vue对于数组双向绑定的操作 
│   index.html     // 调用svue演示html
|   readme.md
|   svue.js        // suve->small vue文件
│
└───learning       // 学习笔记
    │   DebounceAndThrottle.md
    │   EventLoop.md
    |   vuex.md
    │   vue之slot和slot-scope.md
    |   vue之数组双向绑定.md
    └---剖析+Vue.js+内部运行机制.pdf
```

## svue简介

svue 具有observer、watcher、Dep、Compile、Svue等几部分组成，由于是简单的实现vue的部分原理，所以并不完全照搬vue的所有模块。只是在加深vue源码的理解。

## svue功能

svue是对于尤大vue2.x版本的一次简单尝试，在svue中，目前已经实现以下功能，不定期更新：

- 数据双向绑定
- 数据代理
- method简单实现（包含click的实现）
- 对于数组双向绑定（即将实现）
- 待续。。。。。。

目前项目可能较为粗糙，欢迎各位大佬提出优化之处。

联系方式：1907588771@qq.com