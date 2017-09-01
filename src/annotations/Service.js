'use strict';

const Annotation = use('core/reflect/Annotation');

module.exports = class Service extends Annotation.class {

  static get targets() { return [this.DEFINITION] }

  static get tag() { return true; }

  static get serve() { return true; }

  fields() {
    return {
      value: null,
      description: null,
    };
  }

};
