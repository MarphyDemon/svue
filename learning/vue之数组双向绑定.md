---
title: "vue之数组"
author: lddldd
date: 2019-3-14
---

# vue之数组

## vue拦截数组变异方法的思路

``` js

function push () {
    console.log('push')
}
let pushFun = push;
push = function () {
    console.log('resetPush')
    pushFun();
}

```

## 响应式数据之处理数组

 数组是一个特殊的数据结构，它有很多实例方法，并且有些方法会改变数组自身的值，我们称其为变异方法，这些方法有：push、pop、shift、unshift、splice、sort 以及 reverse 等。这个时候我们就要考虑一件事，即当用户调用这些变异方法改变数组时需要触发依赖。换句话说我们需要知道开发者何时调用了这些变异方法，只有这样我们才有可能在这些方法被调用时做出反应。

``` js
// observer.js
export class Observer {
  value: any;
  dep: Dep;
  vmCount: number; // number of vms that has this object as root $data

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.vmCount = 0
    def(value, '__ob__', this)  
    if (Array.isArray(value)) { //判断是否为数组
      const augment = hasProto  // hasProto 判断是否兼容__proto__
        ? protoAugment
        : copyAugment
      augment(value, arrayMethods, arrayKeys)
      this.observeArray(value)
    } else {
      this.walk(value)
    }
  }
}
```

## 拦截数组在vue中的实现

``` js
// array.js
/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype  
//  获取数组__proto__的数组构造函数的原型
export const arrayMethods = Object.create(arrayProto)
// 缓存数组原型
// 创建一个新的对象arrayMethods，并且该对象的原型为数组构造函数的原型

const methodsToPatch = [    //所要重写的数组变异方法
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  // 缓存数组本身的方法
  const original = arrayProto[method]
  // def函数
  def(arrayMethods, method, function mutator (...args) {
    // 优先调用数组原有的方法，或者返回值result，在函数末尾return result；保证拦截功能与数组原有方法一致
    const result = original.apply(this, args)

    // 将数组的实例本身的__ob__定义到ob，每个对象或者数组都会有一个__ob__
    // __ob__.dep中包含了数组或者对象的所有观察者，当执行变异方法时
    // 数组必然发生改变时，调用dep的notify方法进行执行
    const ob = this.__ob__
    let inserted
    switch (method) {
    // 修改数组内值的方法无非是增删，而在增加的时候，新增的元素是非响应式的
    // 此处新增inserted变量用来保存新增的值
    // 然后调用observeArray函数进行观察
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.dep.notify()
    return result
  })
})
```

从上述代码我们可以看到，array.js只有一个导出即arrayMethods对象。

``` js
// observer.js
const arrayKeys = Object.getOwnPropertyNames(arrayMethods)
// 获取我们定义在arrayMethods上的所有变异函数的名字
if (Array.isArray(data)) {
    const augment = hasProto
    ? protoAugment
    : copyAugment
    augment(data, arrayMethods, arrayKeys)
    this.observeArray(data)
}
// 通过判断是否支持__proto__，调取了两个不同的函数，protoAugment/copyAugment，
// 将数组实例与定义的代理原型中的函数联系起来，从而拦截数组变异方法
function protoAugment (target, src, keys) {
    /* eslint-disable no-proto */
    target.__proto__ = src
    /* eslint-enable no-proto */
}
// 使用 def 函数在数组实例上定义与数组变异方法同名的且不可枚举的函数，这样就实现了拦截操作。
function copyAugment (target: Object, src: Object, keys: Array<string>) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key])
  }
}
```

最后还调用了 this.observeArray(data) 方法，这里调用observeArray的作用是当数组内包含数组/对象时，递归观测是数组/对象类型的数组元素。

``` js
observeArray: function(items) {
    for (let i = 0, l = items.length; i < l; i++) {
        observe(items[i])
    }
},
```

## 数组的特殊性（defineReactive）

defineReactive 函数的核心就是 将数据对象的数据属性转换为访问器属性
为数据对象的属性设置一对 getter/setter


``` js
defineReactive: function(data, key, val) {
    const dep = new Dep();
    var childObj = observe(val);
    Object.defineProperty(data, key, {
        enumerable: true, // 可枚举
        configurable: true, // 不能再define
        get: function() {
            if (Dep.target) {
                dep.depend();
                if (childObj) {
                    childObj.dep.depend()
                    // 当被读取的数据属性是数组时调用dependArray方法
                    if (Array.isArray(data)) {
                        dependArray(data)
                    }
                }
            }
            return val;
        }
    });
}
/**
 * 因为数组的索引是非响应式的，
 * 所以dependArray的作用就是判断数组的每一个元素的值是否拥有
 * __ob__ 对象和 __ob__.dep 对象
 * 如果有，说明该元素也是一个对象或数组，此时只需要手动
 * 执行 __ob__.dep.depend() 即可达到收集依赖的目的。
 * 如果发现数组的元素仍然是一个数组
 * 那么需要递归调用 dependArray 继续收集依赖。
*/

function dependArray (value) {
    for (let e, i = 0, l = value.length; i < l; i++) {
      e = value[i]
      e && e.__ob__ && e.__ob__.dep.depend()
      if (Array.isArray(e)) {
        dependArray(e)
      }
    }
  }
```