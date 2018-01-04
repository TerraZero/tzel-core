'use strict';

const AnnotationBase = require('tzero-annotations');
const Reader = AnnotationBase.Reader;
const Annotation = require('./Annotation');
const AnnotationData = require('./AnnotationData');

const _registry = new AnnotationBase.Registry();

module.exports = class AnnotationParser {

  static register(file) {
    _registry.registerAnnotation(file);
  }

  static registry() {
    return _registry;
  }

  /**
   * @param {string} path
   */
  constructor(path) {
    this._reader = new Reader(_registry);
    this._path = path;
    this._data = null;

    this._reader.parse(path);
  }

  /**
   * The path of the parsed file.
   *
   * @return {string}
   */
  path() {
    return this._path;
  }

  getData() {
    if (this._data === null) {
      this._data = {};
      if (this._reader.definitionAnnotations.length) {
        this._data.definitions = [];
        for (const annotation of this._reader.definitionAnnotations) {
          this._data.definitions.push(annotation.getData());
        }
      }
      if (this._reader.methodAnnotations.length) {
        this._data.methods = [];
        for (const annotation of this._reader.methodAnnotations) {
          this._data.methods.push(annotation.getData());
        }
      }
    }
    return this._data;
  }

  /**
   *
   * @param {int} type the type of the annotation
   * @param {*} index
   * @param {*} delta
   */
  get(type = Annotation.DEFINITION, index = null, delta = null) {
    switch (type) {
      case Annotation.DEFINITION:
        return this.getDefinitions(index, delta);
      case Annotation.METHOD:
        return this.getMethods(index, delta);
    }
    return null;
  }

  /**
   * Get annoations on file marked with {Annoation.DEFINITION}
   *
   * @param {null|number|string|Annotation} index
   * @param {null|number} delta
   * @return {null|Annoation[]}
   */
  getDefinitions(index = null, delta = null) {
    return this.findAnnotations(this._reader.definitionAnnotations, index, delta);
  }

  /**
   * Get annotations on file marked with {Annoation.METHOD}
   *
   * @param {null|number|string|Annotation} index
   * @param {null|number} delta
   * @return {null|Annoation[]}
   */
  getMethods(index = null, delta = null) {
    return this.findAnnotations(this._reader.methodAnnotations, index, delta);
  }

  /**
   * Get the annoation list filtered
   *
   * @param {Annotation[]} list
   * @param {null|number|string|Annotation} index
   * @param {null|number} delta
   * @returns {null|Annotation[]}
   */
  findAnnotations(list, index = null, delta = null) {
    if (index === null) {
      if (delta !== null) return list[delta];
      return list;
    }

    const filter = [];
    if (typeof index === "number") {
      return list[index] || null;
    }
    if (typeof index === 'string') {
      for (const i in list) {
        if (list[i].constructor.name === index) filter.push(list[i]);
      }
    } else if (index.prototype instanceof Annotation) {
      for (const i in list) {
        if (list[i].constructor.name === index.name) filter.push(list[i]);
      }
    }
    if (delta !== null) {
      return filter.length && filter[delta] || null;
    }
    return filter.length && filter || null;
  }

}
