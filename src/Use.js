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

      construct: function construct(target, args, newTarget) {

      },

      get: function get(target, property, receiver) {
        switch (property) {
          case 'class':
            if (target.class === undefined) {
              target.class = require(that.lookup(path));
            }
            return target.class;
          case '__file':
            return that.lookup(path);
          case '__path':
            return path;
        }
      },

    });
  }

  serve(service) {

  }

  lookup(path) {
    const parts = path.split('/');
    const modName = parts.shift();
    const file = parts.join('/');
    const mod = boot.mod(modName);

    return Path.join(mod.path(), mod.src(), file);
  }

}
