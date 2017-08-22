'use strict';

module.exports = class Provider {

  constructor(annotation) {
    this._annotation = annotation;
  }

  annotation() {
    return this._annotation;
  }

  subscribe(data) { }

  construct() { }

}
