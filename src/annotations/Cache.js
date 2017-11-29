'use strict';

const Annotation = use('core/reflect/Annotation');

module.exports = class Cache extends Annotation.class {

  static get targets() { return [this.DEFINITION] }

  static get tag() { return true; }

  static get serve() { return true; }

  fields() {
    return {
      value: null,
    };
  }

};
