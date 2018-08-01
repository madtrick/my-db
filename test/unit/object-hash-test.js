'use strict';

const stringHash = require('string-hash');
const objectHash = require('../../lib/object-hash');
const chai = require('../helper');

const expect = chai.expect;

describe('Object hash', () => {
  it('returns the hash for a given object', () => {
    const object = { b: 1, a: 3, c: 2 };
    const hash = objectHash(object);

    expect(hash).to.eql(stringHash('abc123'));
  });
});

