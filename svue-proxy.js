//  def 函数其实就是 Object.defineProperty 函数的简单封装，
//  之所以这里使用 def 函数定义 __ob__ 属性是因为这样可以定义不可枚举的属性，
//  这样后面遍历数据对象的时候就能够防止遍历到 __ob__ 属性。
function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true,
    })
}
function Observer(data) {
    let newData = new Proxy(data, {
        get (target, property) {
            console.log(target)
            return target[property]
        },
        set (target, property, newValue) {
            target[property] = newValue;
        }
    })
}
function protoAugment(value, arrayMethods) {
    value.__proto__ = arrayMethods
}

// Observer.prototype = {
//     runOb: function(data) {
//         Object.keys(data).forEach(key => {
//             this.defineReactive(data, data[key])
//         })
//         // console.log(data)
        
//     },
//     defineReactive: function(data, value) {
//         var child = observe(value);
//         let newData = new Proxy(data,{
//             get:function(target,key,receiver){
//                 console.log(target[key])
//                 return target[key]
//             },
//             set:function(target,key,value,receiver){
//                 target[key] = value;
//                 observe(value)
//                 console.log(`修改了key:${key},新值：${value}`)
//                 return true
//             }
//         })
//         console.log(newData)
//     }
// }


// function observe(value) {
//     if (!value || typeof value !== 'object' || Array.isArray(value)) {
//         return;
//     }
//     return new Observer(value)
// }

function Watcher(node, attr, data, key, type) {
    this.node = node;
    this.attr = attr;
    this.data = data;
    this.type = type
    this.key = key;
    this.depIds = {};
    Dep.target = this;
    this.update();
}
Watcher.prototype = {
    update: function() {
        let value = this.getDataVal(this.data, this.key)
        this.type==1?this.node.textContent = value:''
        if(this.type==2 ) {
            let me = this;
            for(let i=0;i<this.node.attributes.length;i++){
                this.node.value = value
            }
            this.node.addEventListener('input', function(e) {
                value = me.getDataVal(me.data, me.key);
                var newValue = e.target.value;
                if (value === newValue) {
                    return;
                }
                me.setDataVal(me.data, me.key, newValue)
                value = newValue
            });
        }
    },
    addDep: function(dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },
    getDataVal: function(data, key) {
        var val = data;
        key = key.split('.');
        key.forEach(k=> {
            val = val[k];
        });
        return val;
    },
    setDataVal: function(data, key, value) {
        var val = data;
        key = key.split('.');
        key.forEach((k, i)=> {
            if (i < key.length - 1) {
                val = val[k];
            } else {
                val[k] = value;
            }
        });
    }

}

let uid=0
function Dep() {
    this.id = uid++;
    this.subs = []
}
Dep.prototype = {
    depend: function() {
        if (Dep.target) {
            Dep.target.addDep(this)
        }
    },
    addSub: function(sub) {
        this.subs.push(sub)
    },
    notify: function() {
        for(let i=0; i< this.subs.length; i++){
            this.subs[i].update()
        }
    }
}

function Compile(el, vm) {
    this.$el = el.nodeType == 1 ? el : document.querySelector(el);
    const child = this.$el.children;
    for(var i = 0;i <child.length;i++) {
        let node = child[i]
        let nodeAttrs = node.attributes
        if(node.children.length>0){
            new Compile(node, vm)
        }
        if(hasBrace(node.textContent)) {
            let key = hasBrace(node.textContent)[1]
            new Watcher(node, null, vm._data, key, 1)
        }
        for(let i= 0; i<nodeAttrs.length;i++) {
            if(hasModal(nodeAttrs[i])){
                new Watcher(node, nodeAttrs[i], vm._data, nodeAttrs[i].value, 2)
            }
            let clickE = hasEvent(nodeAttrs[i])
            if(clickE){
                let eventName = clickE.name.split("@")[1]
                let fn = vm.$options.methods && vm.$options.methods[clickE.value];
                node.addEventListener(eventName, fn.bind(vm), false);
            }
        }
        
    }
}

function hasBrace(val) {
    const defaultTagRE = /\{\{(.*)\}\}/
    return defaultTagRE.exec(val)
}

function hasModal(nodeAttr) {
    return nodeAttr.name.indexOf('v-')>=0 && nodeAttr.name.indexOf('v-on:')<0
}

function hasEvent(nodeAttr) {
    return nodeAttr.name.indexOf('@')>=0||nodeAttr.name.indexOf('v-on:')>=0?nodeAttr:false
}

function Svue(options) {
    this.$options = options || {};
    this.methods = options.methods
    var data = this._data = this.$options.data;
    this._proxy(data)
    // this.initData(data)
    this.data = data
    Observer(this.data)
    this.$compile = new Compile(options.el || document.body, this)
    console.log(this)
}

Svue.prototype = {
    initData: function(data) {
        observe(data)
    },
    _proxy: function(data) {
        let that = this;
        for(var i=0; i<Object.keys(data).length;i++) {
            let key = Object.keys(data)[i]
            Object.defineProperty(that, Object.keys(data)[i], {
                enumerable: true,
                configurable: true,
                get: function() {
                    return that._data[key]
                },
                set: function(newVal) {
                    that._data[key] = newVal
                }
            })
        }
    }
}
