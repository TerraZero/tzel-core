'use strict';

const Provider = use('core/Provider');
const Service = use('core/annotations/Service');
const Inject = use('core/annotations/Inject');
const ProviderAnnotation = use('core/annotations/Provider');

/**
 * @Provider('provider.service')
 */
module.exports = class ServiceProvider extends Provider.class {

  parsing(manifest, data) {
    const annotations = manifest.getFromAnnotations(Inject);

    if (annotations.length) {
      manifest.invoke(this);
      const injects = {};

      for (const annotation of annotations) {
        injects[annotation.props.target] = injects[annotation.props.target] || [];
        injects[annotation.props.target].push(annotation.fields.value);
      }
      manifest.set(this, 'injects', injects);
    }

    const services = manifest.getFromAnnotations(Service);

    if (services.length) {
      manifest.addAlias(services[0].fields.value);
    }

    const providers = manifest.getFromAnnotations(ProviderAnnotation);

    if (providers.length) {
      manifest.addAlias(providers[0].fields.value);
    }
  }

  construct(subject, object, manifest) {
    const injects = manifest.get(this, 'injects');

    for (const func in injects) {
      const items = [];

      for (const value of injects[func]) {
        items.push(use(value));
      }
      object[func].apply(object, items);
    }
  }

}
