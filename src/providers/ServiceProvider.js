'use strict';

const Provider = use('core/Provider');
const Service = use('core/annotations/Service');

/**
 * @Provider('provider.service')
 * @Service('sdfdsf')
 */
module.exports = class ServiceProvider extends Provider.class {

  subscribe(data) {
    if (data.hasTag(Service.name)) {
      data.addProvider(this);
    }
  }

  construct() {

  }

}
