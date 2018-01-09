'use strict';

const Provider = use('core/Provider');
const Listener = use('core/annotations/Listener');

/**
 * @Provider('provider.event')
 */
module.exports = class EventProvider extends Provider.class {

  parsing(manifest, data) {
    const listeners = manifest.getFromAnnotations(Listener);

    if (listeners.length) {
      for (const listener of listeners) {
        manifest.register(this, listener.fields.value, {
          key: manifest.getKey(),
          target: listener.props.target,
        });
      }
    }
  }

}
