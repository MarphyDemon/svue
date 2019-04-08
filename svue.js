//  数组的特殊处理
MethodsToPatch = [
    "push",
    "pop",
    "shift",
    "unshift",
    "splice",
    "sort",
    "reverse"
]

var arrayProto = Array.prototype
const arrayMethods = Object.create(arrayProto)

MethodsToPatch.forEach(function(method){
    const oldMethods = arrayMethods[method]
    def(arrayMethods, method, function(...args){
        let result = oldMethods.apply(this, args)
        const ob = this.__ob__
        let inserted
        switch (method) {
            case "push":
            case "unshift":
                inserted = args
                break
            case "splice":
                inserted = args.slice(2)
                break
        }
        if(inserted) ob.observeArray(inserted)
        ob.dep.notify()
        return result
    })
})

function def(obj, key, val, enumerable) {
    Object.defineProperty(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true,
    })
}

function Observer(data) {
    this.data = data;
    this.dep = new Dep();
    def(data, '__ob__', this)
    if(Array.isArray(data)) {
        protoAugment(data, arrayMethods)
        this.observeArray(data)
    }else {
        this.runOb(data)
    }
}

function protoAugment(value, arrayMethods) {
    value.__proto__ = arrayMethods
}

Observer.prototype = {
    runOb: function(data) {
        Object.keys(data).forEach(key => {
            this.defineReactive(data, key, data[key])
        })
    },
    defineReactive: function(data, key, value) {
        var dep = new Dep();
        var child = observe(value);
        Object.defineProperty(data, key, {
            enumerable: true, // 可枚举
            configurable: true, // 不能再define
            get: function() {
                if(Dep.target){
                    dep.depend()
                    if(child){
                        child.dep.depend()
                        if(Array.isArray(value)){
                            dependArray(value)
                        }
                    }
                }
                return value
            },
            set: function(newVal) {
                if(newVal != value){
                    value = newVal
                    childObj = observe(newVal);
                    dep.notify()
                }
            }
        })
    },
    observeArray: function(value) {
        for(let i=0;i<value.length;i++){
            observe(value[i])
        }
    }
}

function dependArray(val) {
    for(let i=0;i<val.length;i++) {
        let e = val[i]
        e && e.__ob__ && e.__ob__.dep.depend()
        if(Array.isArray(e)){
            dependArray(e)
        }
    }
}

function observe(value) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value)
}

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
        let value = this.data
        if(this.key.indexOf('.')){
            this.key.split(".").forEach(item=>{
                let keyWord = item;
                value = value[keyWord]
            })
        }
        this.type==1?this.node.textContent = value:''
        if(this.type==2 ) {
            let me = this;
            for(let i=0;i<this.node.attributes.length;i++){
                this.node.attributes[i].name=='value'?this.node.attributes[i].value = value:''
            }
            this.node.addEventListener('input', function(e) {
                var newValue = e.target.value;
                if (me.data[me.key] === newValue) {
                    return;
                }
                me.data[me.key] = newValue
            });
        }
    },
    addDep: function(dep) {
        if (!this.depIds.hasOwnProperty(dep.id)) {
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
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
    this.$vm = this;
    var data = this._data = this.$options.data;
    this._proxy(data)
    this.initData(data)
    this.methods = options.methods
    this.$compile = new Compile(options.el || document.body, this)
}

Svue.prototype = {
    initData: function(data) {
        new Observer(data)
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
