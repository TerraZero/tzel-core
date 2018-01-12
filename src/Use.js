'use strict';

const Manifest = require('./reflect/Manifest');

module.exports = class Use {

  constructor() {
    global.use = this.use.bind(this);
    this._proxies = {};
  }

  use(path) {
    const manifest = Manifest.get(path);
    if (this._proxies[manifest.getKey()]) return this._proxies[manifest.getKey()];
    const that = this;

    return this._proxies[manifest.getKey()] = new Proxy(function () { }, {

      getClass: function getClass(target) {
        if (target.class === undefined) {
          target.class = require(manifest.file());
        }
        return target.class;
      },

      getName: function getName(target) {
        return manifest.class();
      },

      getSubject: function getSubject(target) {
        switch (manifest.getProvide()) {
          case 'class':
            return this.getClass(target);
          case 'object':
            if (target.subject === undefined) {
              const subject = this.getClass(target);

              target.subject = Reflect.construct(subject, [manifest]);
              that.invoke(subject, target.subject, manifest, 'construct');
            }
            return target.subject;
          default:
            throw new TypeError('The provide type "' + manifest.getProvide() + '" is unknown! Available options are "class" and "object".');
        }
      },

      construct: function construct(target, args, newTarget) {
        if (manifest.getProvide() !== 'class') {
          throw new TypeError('Only class of provide type "class" can be create with "new"!');
        }
        const subject = this.getClass(target);
        const object = Reflect.construct(subject, args);

        that.invoke(subject, object, manifest, 'construct');
        return object;
      },

      get: function get(target, property, receiver) {
        switch (property) {
          case 'class':
            return this.getClass(target);
          case 'name':
            return this.getName(target);
          case '__manifest':
            return manifest;

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

  invoke(subject, object, manifest, event) {
    for (const provider of Manifest.providers(manifest.getInvokes(event) || [])) {
      provider[event](subject, object, manifest);
    }
  }

}
