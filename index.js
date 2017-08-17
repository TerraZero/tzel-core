'use strict';

const Boot = require('./src/Boot');

module.exports = {

  key: 'core',
  name: 'Core',
  path: __dirname,
  src: 'src',

  boot: function (settings) {
    new Boot(settings).boot();
  },

};
