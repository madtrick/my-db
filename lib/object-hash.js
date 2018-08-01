'use strict';

const stringHash = require('string-hash');

module.exports = function objectHash (object) {
  const keys = Object.keys(object).sort();
  const values = Object.values(object).sort();

  const string = keys.concat(values).join('');

  return stringHash(string);
};
