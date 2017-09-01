'use strict';

const Annotation = require('./Annotation');
const Path = require('path');

module.exports = class AnnotationData {

  constructor(path) {
    this._tags = [];
    this._annotations = {};
    this._path = path;
    this._use = null;
    this._serve = null;
    this._providers = [];
  }

  tags() {
    return this._tags;
  }

  annotations() {
    return this._annotations;
  }

  path() {
    return this._path;
  }

  use() {
    return this._use;
  }

  addData(annotations, type) {
    for (const index in annotations) {
      const annot = annotations[index];

      this.addAnnotation(annot.constructor.name, annot.getData(), type, annot);
      if (annot.constructor.tag && !this.hasTag(annot.constructor.name)) {
        this.addTag(annot.constructor.name);
      }
      if (annot.constructor.serve) {
        this.setServe(annot.value);
      }
    }
  }

  hasTag(name) {
    return this._tags.indexOf(name) !== -1;
  }

  addTag(name) {
    this._tags.push(name);
  }

  addAnnotation(name, data, type, annot) {
    if (this._annotations[name] === undefined) {
      this._annotations[name] = [];
    }

    this._annotations[name].push({
      data: data,
      type: type,
      target: annot.target,
    });
  }

  getAnnotation(name, index = null) {
    const annotations = this.annotations()[name];

    if (index === null) {
      return annotations;
    }
    return annotations[index];
  }

  hasAnnotation(name) {
    return this.getAnnotation(name) !== undefined;
  }

  setUse(use) {
    this._use = use;
  }

  addProvider(provider) {
    this._providers.push(provider.annotation().use());
  }

  setServe(serve) {
    this._serve = serve;
  }

  serve() {
    return this._serve;
  }

  providers() {
    return this._providers;
  }

}
