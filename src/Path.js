'use strict';

const nPath = require('path');
const glob = require('glob');

module.exports = class Path {

  static normalize(...args) {
    return nPath.normalize.apply(nPath, args);
  }

  static get sep() {
    return nPath.sep;
  }

  static forIn(path) {
    if (path === null) return '';
    if (Array.isArray(path)) {
      path = nPath.join.apply(nPath, path);
    }
    return nPath.normalize(path);
  }

  static forOut(path) {
    return nPath.normalize(path);
  }

  static internals() {
    if (this._internals === undefined) {
      this._internals = {};
      const mods = boot.getMods();

      for (const mod in mods) {
        const paths = mods[mod].data().paths;

        this._internals[mod + ':'] = Path.forIn(mods[mod].root());
        for (const type in paths) {
          this._internals[mod + ':' + type] = Path.forIn(mods[mod].path(type));
        }
      }
      this._internals['root:'] = Path.forIn(boot.setting('root'));
      this._internals['external:'] = '';
    }
    return this._internals;
  }

  static create(source, schema = null, lookup = true) {
    if (source instanceof Path) return source;
    let intern = Path.forIn(source);
    let extern = null;

    if (lookup) {
      if (schema === null) {
        extern = Path.forOut(intern);

        if (!nPath.isAbsolute(extern)) {
          intern = Path.forIn(nPath.join(this.internals()['root:'], intern));
          extern = Path.forOut(intern);
        }
        schema = this.lookup(intern).schema;
      } else {
        intern = Path.forIn(nPath.join(this.internals()[schema], intern));
        extern = Path.forOut(intern);
      }
      intern = Path.convert(intern, schema);
      return new Path(source, intern, extern, schema, lookup);
    } else if (schema === null) {
      extern = Path.forOut(intern);
    } else {
      intern = Path.forIn(nPath.join(this.internals()[schema], intern));
      extern = Path.forOut(intern);
    }
    intern = Path.convert(intern, schema);
    return new Path(source, intern, extern, schema, lookup);
  }

  static lookup(path) {
    const internals = this.internals();

    const lookuped = {
      schema: null,
      root: null,
    };
    for (const schema in internals) {
      if (path.startsWith(internals[schema]) && (lookuped.schema === null || lookuped.root.length < internals[schema].length)) {
        lookuped.schema = schema;
        lookuped.root = internals[schema];
      }
    }

    return lookuped;
  }

  static convert(path, schema) {
    if (schema === null) return path;
    return path.substring(this.internals()[schema].length);
  }

  constructor(source, intern, extern, schema, lookup) {
    this._source = source;
    this._intern = intern;
    this._extern = extern;
    this._schema = schema || 'external:';
    this._lookup = lookup;

    this._parts = null;
  }

  id() {
    return this.schema() + '=' + this.path();
  }

  source() {
    return this._source;
  }

  schema() {
    return this._schema;
  }

  path() {
    return this._intern;
  }

  norm() {
    return this._extern;
  }

  cli() {
    return '"' + this.id() + '"';
  }

  parts() {
    if (this._parts === null) {
      this._parts = this.path().split('/');
    }
    return this._parts;
  }

  root() {
    return Path.create(null, this.schema(), false);
  }

  isInternal() {
    return this.schema() !== null;
  }

  isExternal() {
    return this.schema() === null;
  }

  mod() {
    if (this.schema() === null) return null;
    return this.schema().split(':')[0];
  }

  type() {
    if (this.schema() === null) return null;
    return this.schema().split(':')[1];
  }

  glob(pattern, options = {}) {
    options.cwd = this.norm();
    options.absolute = true;
    const paths = glob.sync(pattern, options);

    for (const index in paths) {
      paths[index] = Path.create(paths[index]);
    }
    return paths;
  }

  join(...paths) {
    paths.unshift(this.norm());
    return Path.create(paths);
  }

  inspect() {
    return 'Path[' + this.id() + ']';
  }

  toString() {
    return this.norm();
  }

}

if (nPath.sep != '/') {
  module.exports._forInRegExp = new RegExp('\\' + nPath.sep, 'g');
  module.exports.forIn = function forIn(path) {
    if (path === null) return '';
    if (Array.isArray(path)) {
      path = nPath.join.apply(nPath, path);
    }
    path = nPath.normalize(path);
    path = path.replace(this._forInRegExp, '/');
    return path;
  };
}
