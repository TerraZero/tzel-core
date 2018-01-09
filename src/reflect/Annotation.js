'use strict';

const AnnotationBase = require('tzero-annotations').Annotation;

/**
 * @interface
 */
module.exports = class Annotation extends AnnotationBase {

  /**
   * The possible targets
   *
   * (Annotation.DEFINITION, Annotation.CONSTRUCTOR, Annotation.PROPERTY, Annotation.METHOD)
   *
   * @type {number[]}
   */
  static get targets() { return [this.DEFINITION, this.CONSTRUCTOR, this.PROPERTY, this.METHOD] }

  static get targetTypes() {
    if (this._types !== undefined) return this._types;
    this._types = [];

    for (const type of this.targets) {
      this._types.push(this.types[type]);
    }
    return this._types;
  }

  static get types() {
    const types = {};

    types[this.DEFINITION] = 'definitions';
    types[this.CONSTRUCTOR] = 'constructors';
    types[this.PROPERTY] = 'properties';
    types[this.METHOD] = 'methods';
    return types;
  }

  static get extendable() { return true }

  static get serve() { return false }

  static meta() {
    if (this._meta !== undefined) return this._meta;
    this._meta = {
      serve: this.constructor.serve,
      extendable: this.constructor.extendable,
      targets: this.constructor.targets,
      name: this.name,
    };
    return this._meta;
  }

  /**
   * Constructor to add attributes
   *
   * @param {Object} data
   * @param {string} filePath
   */
  constructor(data, filePath) {
    super(data, filePath);

    const fields = this.fields();

    for (const field in fields) {
      this[field] = (data[field] === undefined ? fields[field] : data[field]);
    }
  }

  /**
   * Optional initialization method that
   * can be used to transform data
   *
   * @param  {Object} data
   * @return {void}
   */
  init(data) {

  }

  fields() {
    return {
      value: null,
    };
  }

  props() {
    return {
      target: this.target,
    }
  }

  getData() {
    const data = {
      fields: {},
      props: this.props(),
      meta: this.constructor.meta(),
    };
    const fields = this.fields();

    for (const index in fields) {
      data.fields[index] = this[index];
    }
    return data;
  }

};
