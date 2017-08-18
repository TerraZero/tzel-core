'use strict';

const AnnotationBase = require('tzero-annotations');
const Reader = AnnotationBase.Reader;
const Annotation = require('./Annotation');

const registry = new AnnotationBase.Registry();

module.exports = class AnnotationParser {

  static register(file) {
    registry.registerAnnotation(file);
  }

  static registry() {
    return registry;
  }

  /**
   * @param {string} path
   */
  constructor(path) {
    this._reader = new Reader(registry);
    this._path = path;

    this._reader.parse(path);
  }

  /**
   * The path of the parsed file.
   *
   * @return {string}
   */
  getPath() {
    return this._path;
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
