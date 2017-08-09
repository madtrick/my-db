'use strict';

const Transactions = require('../../lib/transactions');

const chai = require('../helper');

const expect = chai.expect;

describe('Transactions', function () {
  describe('.fromCSV', function () {
    it('initializes the transactions from a CSV collection', function () {
      const csv = [
        'Category;Amount;Date',
        'Foo;-14.00;Dec 9, 2016'
      ].join('\n');

      const transactions = Transactions.fromCSV(csv);

      expect(transactions.all()).to.eql([{ Category: 'Foo', Amount: -14.00, Date: new Date('9 Dec, 2016') }]);
    });
  });
});
