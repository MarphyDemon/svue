
function Observer(data) {
    if(Array.isArray(data)) {
        protoAugment(data, arrayMethods, arraykeys)
    }else {
        this.runOb(data)
    }
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
                    dep.addSub(Dep.target)
                }
                return value
            },
            set: function(newVal) {
                if(newVal != value){
                    value = newVal
                    dep.notify()
                }
            }
        })
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
    Dep.target = this;
    this.update();
}
Watcher.prototype.update = function() {
    this.type==1?this.node.textContent = this.data[this.key]:''
    if(this.type==2 ) {
        let me = this;
        for(let i=0;i<this.node.attributes.length;i++){
            this.node.attributes[i].name=='value'?this.node.attributes[i].value = this.data[this.key]:''
        }
        this.node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if (me.data[me.key] === newValue) {
                return;
            }
            me.data[me.key] = newValue
        });
    }
}

function Dep() {
    this.subs = []
}
Dep.prototype = {
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
