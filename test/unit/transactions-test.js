'use strict';

const _ = require('lodash');
const Transactions = require('../../lib/transactions');

const chai = require('../helper');

const expect = chai.expect;

describe('Transactions', function () {
  describe('.fromCSV', function () {
    it('initializes the transactions from a CSV collection', function () {
      const csv = [
        'Category;Amount',
        'Foo;-14.00'
      ].join('\n');

      const adapter = {
        adapt: (item) => {
          item.Amount = _.toNumber(item.Amount);

          return item;
        }
      };

      const transactions = Transactions.fromCSV(csv, adapter);

      expect(transactions.all()).to.eql([{ Category: 'Foo', Amount: -14.00 }]);
    });
  });
});
