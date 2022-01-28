'use strict';

const _ = require('lodash');
const Transactions = require('../../lib/transactions');

const chai = require('../helper');

const expect = chai.expect;

describe('Transactions', () => {
  describe('.fromCSV', () => {
    it('initializes the transactions from a CSV collection', () => {
      const csv = [
        'Category;Amount;Date',
        'Bar;-14.00;Jul 30, 2018',
        'Bar;-14.00;Jul 30, 2018',
        'Foo;-18.00;Jul 28, 2018',
        'Lol;-13.00;Jun 02, 2018',
      ].join('\n');

      const adapter = {
        formatDate: (transaction) => {
          return new Date(transaction.Date);
        },

        adapt: (item) => {
          item.Amount = _.toNumber(item.Amount);
          item.Date = new Date(item.Date);

          return item;
        },
      };

      const transactions = Transactions.fromCSV(csv, adapter);

      // Remove the hash and the __Order from the transaction object
      // so that the expectation passs. In the future we could use somethine like
      // `hash: chai.match.a('string')`
      // once this proposal https://github.com/chaijs/chai/issues/644
      // makes it into Chai
      const transactionsNoHash = transactions.all().map((t) => {
        const clone = Object.assign({}, t);
        delete clone.hash;

        return clone;
      });

      expect(transactionsNoHash).to.eql([
        { Category: 'Bar', Amount: -14.00, Date: new Date('Jul 30, 2018'), __Order: 1 },
        { Category: 'Bar', Amount: -14.00, Date: new Date('Jul 30, 2018'), __Order: 2 },
        { Category: 'Foo', Amount: -18.00, Date: new Date('Jul 28, 2018'), __Order: 3 },
        { Category: 'Lol', Amount: -13.00, Date: new Date('Jun 02, 2018'), __Order: 1 },
      ]);
    });
  });
});
