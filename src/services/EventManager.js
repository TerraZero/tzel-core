'use strict';

const Listeners = require('listeners');

const Listener = use('core/annotations/Listener');
const Event = use('core/events/Event');
const listeners = {};

/**
 * @Service('manager.event')
 */
module.exports = class EventManager {

  register() {
    const datas = boot.getDatas();

    for (const index in datas) {
      if (datas[index].hasTag(Listener.name)) {
        const annots = datas[index].getAnnotation(Listener.name);
        const subject = new (use(datas[index].use()))();

        for (const a in annots) {
          const handler = this.getHandler(annots[a].data.value);

          handler.add(subject[annots[a].target].bind(subject));
        }
      }
    }
  }

  getHandler(name) {
    if (!this.hasHandler(name)) {
      listeners[name] = new Listeners();
    }
    return listeners[name];
  }

  hasHandler(name) {
    return listeners[name] !== undefined;
  }

  fire(mod, event, data = {}) {
    event = mod + '.' + event;
    const parts = event.split('.');
    const e = new Event(event, mod, data);

    const current = [];
    for (let i = parts.length - 1; i >= 0; i--) {
      current.push(parts[i]);
      const key = current.reverse().join('.');

      if (this.hasHandler(key)) {
        e.setEvent(key);
        this.getHandler(key).fire(e);
      }
    }
    return e;
  }

}
