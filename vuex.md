# Vuex

## vuex

vuex 一个专门为 vue 应用程序开发的状态管理模式,集中式存储管理应用的所有组件的状态,以相应的规则保证状态以一种可预测的方式发生变化.
状态自管理应用包含 state views action 组成一个单向数据流
当多个组件共享状态时,单向数据流的简洁性容易破坏: 1.多个视图依赖于同一状态. 2.来自不同视图的行为需要变更统一状态.

Vuex 可以管理共享状态,但会附带更多的概念及框架.
不开发大型单叶应用,vuex 可能会繁琐冗余.构建中大型单叶应用,需要考虑如何更好的在组件外部管理状态,vuex 将会成为自然而然的选择.

Vuex 应用的核心是 store,其中包含着应用中的大部分状态.
**Vuex 和单纯的全局对象有两点不同:**

- 1.vuex 的状态存储是响应式的.当 store 中的状态发生变化,相应的 vue 组件也会得到-更新.

- 2.不能直接改变 store 的状态,唯一的改变方法就是通过 commit 提交 mutation.(更好的记录每次状态的改变)

例:

```js
const store = new Vuex.Store({
  state: {
    count: 0
  },
  mutations: {
    increment(state) {
      state.count++;
    }
  }
});

store.commit("increment");
console.log(store.state.count); // -> 1
```

## State

vuex 使用单一状态树,唯一数据源.
mapState 辅助函数
在单独构建的版本中辅助函数为 Vuex.mapState

```js
import { mapState } from 'vuex'

export default {
// ...
    computed: mapState({
    // 箭头函数可使代码更简练
        count: state => state.count,

        // 传字符串参数 'count' 等同于 `state => state.count`
        countAlias: 'count',

        // 为了能够使用 `this` 获取局部状态，必须使用常规函数
        countPlusLocalState (state) {
            return state.count + this.localCount
        }

    })
}
//当映射的计算属性的名称与 state 的子节点名称相同时，我们也可以给  mapState  传一个字符串数组。
computed: mapState([
    // 映射 this.count 为 store.state.count
    'count'
])

//对象展开运算符
mapState 返回的对象与局部对象混合使用:
computed: {
    localComputed () { /_ ... _/ },
    // 使用对象展开运算符将此对象混入到外部对象中
    ...mapState({
        // ...
    })
}

```

## Getter

从 store 中的 state 派生出一些状态时,多个组件需要用的时,一般需要多次复制这个函数,要不抽取到一个共享函数然后多处导入.
vuex 中允许我们在 store 中定义 getter,相当于 store 的计算属性.当其依赖的值改变时被重新计算.
Getter 接收 state 作为第一个参数:

```js
const store = new Vuex.state({
  state: {
    todos: [
      { id: 1, text: "111", done: true },
      { id: 2, text: "222", done: false }
    ]
  },
  getters: {
    doneTodos: state => {
      return state.todos.filter(todo => todo.done);
    }
  }
});
```

### 通过属性访问

store 会暴露 getters 的对象,可以以对象的形式访问这些值: store.getters.doneTodos //[{id:1, text: "111", done: true}]

Getter 也可以接收其他 getter 作为第二个参数:

```js
getters: {
  doneTodosCount: (state, getters) => {
    return getters.doneTodos.length;
  };
}
```

组件中调用 doneTodosCount: store.getters.doneTodosCount

### 通过方法访问

让 getter 返回一个函数,来实现给 getter 传参. 在对 store 的数组进行查询时有用.

```js
getters: {
  getTodoById: state => id => {
    return state.store.find(todo => todo.id === id);
  };
}
//访问
store.getters.getTodoById(2); //  {id:2, text: "222", done: false}
```

### mapGetters 辅助函数

mapGetters 辅助函数仅仅是将 store 中的 getter 映射到局部计算属性：

```js
import { mapGetters } from "vuex";
export default {
  // ...
  computed: {
    // 使用对象展开运算符将 getter 混入 computed 对象中
    ...mapGetters([
      "doneTodosCount",
      "anotherGetter"
      // ...
    ])
  }
};
//如果你想将一个 getter 属性另取一个名字，使用对象形式：

mapGetters({
  // 把 `this.doneCount` 映射为 `this.$store.getters.doneTodosCount`
  doneCount: "doneTodosCount"
});
```

## Mutation

更改 store 中状态的唯一方法是提交 mutation,vuex 中的每个 mutation 都有一个字符串的事件类型和一个回调函数,这个回调函数为实际进行状态修改的地方,并且会接收 state 为第一个参数:
`const store = new Vuex.store({ state: { count: 1 }, mutation: { increment(state) { //变更状态 state.count++ } } }) // 调用 store.commit('increment')` ##提交载荷(payload)
store.commit 传入额外的参数,即 mutation 的载荷;载荷大多数情况下应为一个对象,包含多个字段.

```js
mutation: {
    increment(state, obj){
        state.count = state.count + obj.amount
    }
}

//调用
store.coummit('increment', {amount: 10});
//对象风格的提交方式,使用包含type属性的对象
store.commit({
    type: 'increment',
    amount: 10
})
```

## 注意点

### Mutation 需遵循 vue 的响应原则

提前在 store 中初始化所有属性,需要在对象上添加新属性时,

```js
Vue.set(obj, 'newProp', 123)
//或者新对象替换老对象:
state.obj = {...state.obj, newProp: 123}`
//使用常量替代 mutation 事件类型
```

```js
//mutation-types.js
export const SOME_MUTATION = 'SOME_MUTATION'

//store.js
import Vuex from 'vuex'
import { SOME_MUTATION } from './mutation-types'

    const store = new Vuex.Store({
        state: { ... },
        mutations: {
            // 我们可以使用 ES2015 风格的计算属性命名功能来使用一个常量作为函数名
            [SOME_MUTATION] (state) {
                // mutate state
            }
        }
    })
```

### Mutation 必须是同步函数

```js
mutations: {
    someMutation(state) {
        api.callMethod(()=>{ state.count++ })
    }
}
```

当 mutation 触发的时候，回调函数还没有被调用，devtools 不知道什么时候回调函数实际上被调用——实质上任何在回调函数中进行的状态的改变都是不可追踪的。 ###在组件中提交 Mutataion

```js
import { mapMutations } from "vuex";

export default {
  // ...
  methods: {
    ...mapMutations([
      "increment", // 将 `this.increment()` 映射为 `this.$store.commit('increment')`

      // `mapMutations` 也支持载荷：
      "incrementBy" // 将 `this.incrementBy(amount)` 映射为 `this.$store.commit('incrementBy', amount)`
    ]),
    ...mapMutations({
      add: "increment" // 将 `this.add()` 映射为 `this.$store.commit('increment')`
    })
  }
};
```

## Action

Action 提交的是 Mutation,而不是变更状态
Action 可以包含任意异步状态

```js
const store = new Vuex.Store({
  state: { count: 0 },
  mutations: {
    increment(state) {
      state.count++;
    }
  },
  actions: {
    incrementAction(context) {
      context.commit("increment");
    }
  }
});
```

Action 函数接收一个与 store 实例具有相同方法和属性的 context 对象,因此可以通过 context.commit 提交一个 mutation,或者通过 context.state 和 context.getters 来获取 state 和 getters.

```js
//ES2015 参数解构简化代码(当需要调用 commit 很多次的时候):
actions: {
    incrementAction({ commit }) {
        commit('increment')
    }
}
```

## 分发 Action

Action 通过 store.dispatch 方法触发
store.dispatch('incrementAction')
此时便可以在 Action 中进行异步操作.

```js
actions: { incrementAsync ({ commit }) {
    setTimeout(()=>{
        commit('increment')
        },1000)
    }
}
```

Actions 支持同样和 mutation 的载荷和对象分发:

```js
//以载荷形式分发
store.dispatch("incrementAsync", {
  amount: 10
});

//以对象形式分发
store.dispatch({
  type: "incrementAsync",
  amount: 10
});
```

## 组合 Actions

```js
actions: {
    async actionA({ commit }) {
        commit('gotData', await getData())
    },
    async actionB({ dispatch, commit }) {
        await dispatch('actionA')
        commit('gotOtherData', wait getOtherData())
    }
}
//一个store.dispatch在不块中可以触发多个action函数,在这种情况下,只有所有的触发函数完成后,返回的Promise才会执行.
```

## Module

为了解决大型应用中 store 对象可能臃肿难以维护的问题,Vuex 允许将 store 分割成 module,每个模块拥有自己的 state、mutation、action、getter、甚至是嵌套子模块---从上至下进行同样方式的分割.

```js
const m0duleA = {
    state: {...},
    mutations: {...},
    actions: {...},
    getters: {...}
}

const moduleB = {
    state: {...},
    mutations: {...},
    actions: {...}
}

const store = new Vuex.Store({
    modules: {
        a: moduleA,
        b: moduleB
    }
})

store.state.a   //->moduleA的状态
store.state.b   //->moduleB的状态
```

## 模块的局部状态

对于模块内部的 mutation 和 getter,接收的第一个  参数是模块的局部状态对象

```js
const moduleA = {
    state: { count: 0 },
    mutations: {
        increment(state) {
            // 这里的 state 对象是模块的局部状态
            state.count++
        }
    },
    getters: {
        doubelCount(state) {
            return state.count * 2
        }
    }

    //对于模块内部的action,局部状态通过context.state暴露出来,根节点状态为context.rootState
    actions: {
        incrementIfOddOnRootSum ({state, commit, rootState}){
            if((state.count + rootState) %2 === 1){
                commit('increment')
            }
        }
    }
}
```

## 命名空间(后续补充)

默认情况下,模块内部的action、mutation和getter是注册载全局命名空间的---这样使得多个模块能够对同一mutation或action作出响应.
如果希望模块具有更高的封装度和复用性,可以通过添加`namespaced:true`的方式使其成为带命名空间的模块.当模块被注册后,它所有的getter、action、mutation都会自动根据模块注册的路径调整命名:
例:

```js
    const store = new Vuex.Store({
        modules: {
            account: {
                namespaced: true,
                state: {...},
                getters: {
                    isAdmin() {...}
                },
                actions: {
                    login() {...}
                },
                mutations: {
                    loginMutation() {...}
                },
                // 嵌套模块
                modules: {
                    // 继承父模块的命名空间
                    mypage: {
                        state: {...},
                        getters: {
                            isChild() {...}
                        },
                        actions: {
                            logout() {...}
                        },
                        // 进一步嵌套命名空间
                        posts: {
                            namespaced: true.
                            state: {...},
                            getters: {
                                popular() {...}
                            }
                        }
                    }
                }
            }
        }
    })
```

## 插件

Vuex 的 store 接收 plugins 选项,这个选项暴露出每次 mutation 的钩子.Vuex 插件就是一个函数,他接收 store 作为唯一参数:

```js
const myPlugin = store => {
  // 当store初始化后调用
  store.subscribe((mutation, state) => {
    // 每次mutation之后调用
    // mutation的格式为{ type, payload }
  });
};
// 使用
const store = new Vuex.Store({
  //...
  plugins: [myPlugin]
});
```

## 严格模式

```js
// 开启严格模式
const store = new Vuex.Store({
  strict: true
});
//严格模式下,无论何时发生了状态变更且不是由mutation函数引起的都会抛出错误,这保证所有的状态改变可以被t调试工具跟踪.

// 发布环境下关闭严格模式,避免性能损失,处理如下:
const store = new Vuex.Store({
  //...
  strict: process.env.NODE_ENV !== "production"
});
```

## 表单处理

```html
<input v-model="obj.message" />
```

当在开发中,可能处于严格模式时,属于 Vuex 的 state 值使用 v-model 时,v-model 会试图直接修改值,不会在 mutation 函数中执行,抛出错误.

**两种方式:**

- 方法一:

  ```html
  <input :value="message" @message="updateMessage" />
  ```

  ```js
      computed({
          ...mapState({
              message: state => state.obj.message
          })
      }),
      methods: {
          updateMessage(e) {
              this.$store.commit('updateMessage', e.target.value)
          }
      }

      /**
       * mutations
      */
      mutations: {
          updateMessage(state, message) {
              state.obj.message = message;
          }
      }
  ```

- 方法二:
  双向绑定的计算属性:

  ```html
  <input v-model="message" />
  ```

  ```js
      computed: {
          message: {
              get() {
                  return this.$store.state.obj.message
              },
              set(value) {
                  this.$store.commit('updateMessage', value)
              }
          }
      }
  ```

## 热重载

使用 webpack 的 Hot Module Replacement API,Vuex 支持在开发过程中热重载 mutation、module、action、getter.
对于 mutation 和模块,你需要使用 store.hotUpdate()方法:

```js
import Vue from 'vue';
import Vuex from 'vuex';
import mutations from './mutations';
import muduleA from './module/a';

Vue.use(Vuex);

const state = {...}

const store = new Vuex.Store({
    state,
    mutations,
    modules: {
        a: moduleA
    }
})

if(module.hot) {
    // 使anction和mutation成为可热重载的模块
    module.hot.accept(['./mutations', './modules/a'], ()=>{
        //获取更新后的模块
        //因为babel 6的模块编译格式有问题,这里需要加上`.default`
        const newMutations = require('./mutations').default
        const newModuleA = require('./modules/a').default
        // 加载新模块
        store.hotUpdate({
            mutation: newMutations,
            modules: {
                a: newModuleA
            }
        })
    })
}
```

## md插入视频

<iframe width="560" height="315" src="https://www.youtube.com/embed/Ilg3gGewQ5U" frameborder="0" allowfullscreen></iframe>

## md插入音频

<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src="https://music.163.com/outchain/player?type=2&id=528478901&auto=1&height=66"></iframe>
