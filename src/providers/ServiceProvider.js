'use strict';

const Provider = use('core/Provider');
const Inject = use('core/annotations/Inject');

/**
 * @Provider('provider.service')
 */
module.exports = class ServiceProvider extends Provider.class {

  subscribe(data) {
    if (data.hasAnnotation(Inject.name)) {
      data.addProvider(this);
    }
  }

  invoke(subject, object, data) {
    const annots = data.getAnnotation(Inject.name);
    const injects = {};

    for (const index in annots) {
      const annot = annots[index];

      if (injects[annot.target] === undefined) {
        injects[annot.target] = [];
      }
      injects[annot.target].push(use(annot.data.value));
    }

    for (const name in injects) {
      object[name].apply(object, injects[name]);
    }
  }

}
