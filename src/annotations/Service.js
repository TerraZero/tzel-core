'use strict';

const Annotation = use('core/reflect/Annotation');

module.exports = class Service extends Annotation.class {

  static get targets() { return [this.DEFINITION] }

  fields() {
    return {
      value: null,
      description: null,
    };
  }

};
