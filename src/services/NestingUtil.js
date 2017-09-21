'use strict';

/**
 * @Service('util.nesting')
 */
module.exports = class NestingUtil {

  split(path) {
    return path.split('.');
  }

  get(value, key) {
    let splits = null;
    if (Array.isArray(key)) {
      splits = key;
    } else {
      splits = this.split(key);
    }

    let pointer = value;
    for (const index in splits) {
      if (value[splits[index]] === undefined) return null;
      pointer = pointer[splits[index]];
    }
    return pointer;
  }

  // ensure(object, path) {
  //   const split = this.split(path);

  //   let pointer = object;
  //   for (const index in split) {
  //     let key = this._ensureKey(split[index]);

  //     if (pointer[key] === undefined) {
  //       if (this._util.getType(pointer) === 'Array') {
  //         pointer.push(this._ensureType(split[index]));
  //         key = pointer.length;
  //       } else {
  //         pointer[key] = this._ensureType(split[index]);
  //       }
  //     }
  //     pointer = pointer[key];
  //   }
  // }

  // _ensureType(key) {
  //   if (key.substring(key.length - 2, key.length) === '[]') {
  //     return [];
  //   } else {
  //     return {};
  //   }
  // }

  // _ensureKey(key) {
  //   if (key.substring(key.length - 2, key.length) === '[]') return key.substring(0, key.length - 2);
  //   return key;
  // }

}
