'use strict';

const Path = require('path');

const Manifest = require('./reflect/Manifest');

let debug = null;

module.exports = class Use {

  constructor() {
    debug = logger('debug', 'use');
    global.use = this.use.bind(this);
    this._proxies = {};
  }

  use(path) {
    if (this._proxies[path]) return this._proxies[path];
    const that = this;

    return this._proxies[path] = new Proxy(function () { }, {

      getClass: function getClass(target) {
        if (target.class === undefined) {
          target.class = require(this.getManifest(target).file());
        }
        return target.class;
      },

      getName: function getName(target) {
        return this.getManifest(target).class();
      },

      getManifest: function getManifest(target) {
        if (target.manifest === undefined) {
          target.manifest = Manifest.get(path);
        }
        return target.manifest;
      },

      isService: function isService(target) {
        if (target.isService === undefined) {
          target.isService = this.getData(target) && this.getData(target).serve() === path;
        }
        return target.isService;
      },

      getSubject: function getSubject(target) {
        if (this.isService(target)) {
          if (target.subject === undefined) {
            const subject = this.getClass(target);

            target.subject = Reflect.construct(subject, []);
            that.invoke(subject, target.subject, this.getData(target));
          }
          return target.subject;
        } else {
          return this.getClass(target);
        }
      },

      construct: function construct(target, args, newTarget) {
        const data = this.getData(target);
        const subject = this.getClass(target);
        const object = Reflect.construct(subject, args);

        that.invoke(subject, object, data);
        return object;
      },

      get: function get(target, property, receiver) {
        switch (property) {
          case 'class':
            return this.getClass(target);
          case 'name':
            return this.getName(target);
          case '__manifest':
            return this.getManifest(target);

          default:
            if (typeof property === 'string' && property.indexOf('_') === 0) {
              throw new TypeError('Property "' + property + '" of "' + this.getName(target) + '" is private!');
            }
            const subject = this.getSubject(target);
            let value = Reflect.get(subject, property);

            if (typeof value === 'function') {
              value = value.bind(subject);
            }
            return value;
        }
      },

      set: function (target, property, value, receiver) {
        if (property.indexOf('_') === 0) {
          throw new TypeError('Property "' + property + '" of "' + this.getName(target) + '" is private!');
        }
        if (Reflect.get(this.getSubject(target), property) === undefined) {
          throw new TypeError('Property "' + property + '" of "' + this.getName(target) + '" is undefined!');
        }
        return Reflect.set(this.getSubject(target), property, value);
      },

    });
  }

  invoke(subject, object, data) {
    const providers = data.providers();

    for (const index in providers) {
      boot.provider(providers[index]).invoke(subject, object, data);
    }
  }

}
