'use strict';

const Provider = use('core/Provider');
const Service = use('core/annotations/Service');

/**
 * @Provider('provider.service')
 * @Service('sdfsdf')
 */
module.exports = class ServiceProvider extends Provider.class {

  subscribe(data) {
    if (data.hasTag(Service.name)) {
      const annot = data.getAnnotation(Service.name, 0);

      data.setServe(annot.data.value);
      data.addProvider(this);
    }
  }

  invoke(subject, object, data) {

  }

}
