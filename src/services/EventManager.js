'use strict';

const Listeners = require('listeners');

const Manifest = use('core/reflect/Manifest');
const Listener = use('core/annotations/Listener');
const Event = use('core/events/Event');
const listeners = {};

/**
 * @Service('manager.event')
 */
module.exports = class EventManager {

  register() {
    if (this._register === undefined) {
      this._register = Manifest.getRegister('provider.event');
    }
    return this._register;
  }

  getHandler(name) {
    if (listeners[name] === undefined) {
      listeners[name] = new Listeners();
      for (const item of this.register()[name]) {
        const subject = new (use(item.key))();

        listeners[name].add(subject[item.target].bind(subject));
      }
    }
    return listeners[name];
  }

  hasHandler(name) {
    return this.register()[name] !== undefined;
  }

  fire(mod, event, data = {}) {
    event = mod + '.' + event;
    const parts = event.split('.');
    const e = new Event(event, mod, data);

    const current = [];
    for (const index in parts) {
      current.push(parts[index]);
      const key = current.join('.');

      if (this.hasHandler(key)) {
        e.setEvent(key);
        this.getHandler(key).fire(e);
      }
    }
    return e;
  }

}
