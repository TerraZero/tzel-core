'use strict';

const Path = require('path');

module.exports = class Use {

  constructor() {
    global.use = this.use.bind(this);
    global.use.serve = this.serve.bind(this);
    global.use.lookup = this.lookup.bind(this);
  }

  use(path) {
    const that = this;

    return new Proxy(function () { }, {

      getClass: function getClass(target) {
        if (target.class === undefined) {
          target.class = require(that.lookup(path));
        }
        return target.class;
      },

      getName: function getName(target) {
        if (target.classname === undefined) {
          target.classname = path.split('/').pop();
        }
        return target.classname;
      },

      getData: function getData(target) {
        if (target.data === undefined) {
          target.data = that.data(path);
        }
        return target.data;
      },

      construct: function construct(target, args, newTarget) {
        const data = this.getData(target);
        const subject = this.getClass(target);
        const object = Reflect.construct(subject, args, subject);

        that.invoke(subject, object, data);
        return object;
      },

      get: function get(target, property, receiver) {
        switch (property) {
          case 'class':
            return this.getClass(target);
          case 'name':
            return this.getName(target);
          case '__file':
            return that.lookup(path);
          case '__path':
            return path;
          case '__data':
            return this.getData(target);
        }
      },

    });
  }

  serve(service) {
    const that = this;

    return new Proxy(function () { }, {

      getUse: function getUse(target) {
        if (target.use === undefined) {
          target.use = that.use(this.getData(target).use());
        }
        return target.use;
      },

      getData: function getData(target) {
        if (target.data === undefined) {
          target.data = that.data(service);
        }
        return target.data;
      },

      getObject: function getObject(target) {
        if (target.object === undefined) {
          target.object = new (this.getUse(target))();
        }
        return target.object;
      },

      get: function get(target, property, receiver) {
        switch (property) {
          case 'class':
            return this.getUse(target).class;
          case 'use':
            return this.getUse(target);
          case 'service':
            return this.getObject(target);
          default:
            return this.getObject(target)[property];
        }
      },

    });
  }

  lookup(path) {
    const parts = path.split('/');
    const modName = parts.shift();
    const file = parts.join('/');
    const mod = boot.mod(modName);

    return mod.file(file);
  }

  data(key) {
    const datas = boot.getDatas();

    for (const index in datas) {
      if (datas[index].use() === key || datas[index].serve() === key) {
        return datas[index];
      }
    }
    return null;
  }

  invoke(subject, object, data) {
    const providers = data.providers();

    for (const index in providers) {
      boot.provider(providers[index]).invoke(subject, object, data);
    }
  }

}
