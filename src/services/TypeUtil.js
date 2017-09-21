'use strict';

/**
 * @Service('util.type')
 */
module.exports = class TypeUtil {

  getType(value) {
    if (value === null) return 'null';
    const type = typeof value;

    if (type === 'object') {
      return value.constructor.name;
    }
    if (type === 'function' && value.constructor.name === 'bound Function') {
      return 'class';
    }
    return type;
  }

}
