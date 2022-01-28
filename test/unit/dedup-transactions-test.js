'use strict';

const _ = require('lodash');
const Transactions = require('../../lib/transactions');
const dedupTransactions = require('../../lib/dedup-transactions');
const objectHash = require('../../lib/object-hash');

const chai = require('../helper');

const expect = chai.expect;

describe('Dedup transactions', () => {
  it('removes duplicates from different csv collections', () => {
    const csv1 = [
      'Category;Amount;Date;Reference',
      'Foo;-14.00;Jul 30, 2018;xyz',
    ].join('\n');
    const csv2 = [
      'Category;Amount;Date;Reference',
      'Foo;-14.00;Jul 30, 2018;xyz',
      'Foo;-14.00;Jul 30, 2018;xyz',
      'Foo;-14.00;Jul 30, 2018;123z',
      'Foo;-15.00;Jul 30, 2018;ert',
    ].join('\n');
    const csv3 = [
      'Category;Amount;Date;Reference',
      'Foo;-14.00;Jul 30, 2018;xyz',
      'Foo;-14.00;Jul 30, 2018;xyz',
      'Bar;-13.00;Jul 30, 2018;',
    ].join('\n');

    const adapter = {
      adapt: (item) => {
        const clone = Object.assign({}, item);
        clone.Amount = _.toNumber(clone.Amount);
        clone.Date = new Date(clone.Date);
        clone.hash = objectHash(clone);

        return clone;
      },
    };

    const transactionsFromCSV1 = Transactions.fromCSV(csv1, adapter);
    const transactionsFromCSV2 = Transactions.fromCSV(csv2, adapter);
    const transactionsFromCSV3 = Transactions.fromCSV(csv3, adapter);

    const dedupedTransactions = dedupTransactions([transactionsFromCSV1, transactionsFromCSV2, transactionsFromCSV3]);

    // Remove the hash and the __Order from the transaction object
    // so that the expectation passs. In the future we could use somethine like
    // `hash: chai.match.a('string')`
    // once this proposal https://github.com/chaijs/chai/issues/644
    // makes it into Chai
    const dedupedTransactionsNoHash = dedupedTransactions.all().map((t) => {
      const clone = Object.assign({}, t);
      delete clone.hash;
      delete clone.__Order;

      return clone;
    });

    expect(dedupedTransactionsNoHash).to.eql([
      { Category: 'Foo', Amount: -14.00, Date: new Date('Jul 30, 2018'), Reference: 'xyz' },
      { Category: 'Foo', Amount: -14.00, Date: new Date('Jul 30, 2018'), Reference: 'xyz' },
      { Category: 'Foo', Amount: -14.00, Date: new Date('Jul 30, 2018'), Reference: '123z' },
      { Category: 'Foo', Amount: -15.00, Date: new Date('Jul 30, 2018'), Reference: 'ert' },
      { Category: 'Bar', Amount: -13.00, Date: new Date('Jul 30, 2018'), Reference: '' },
    ]);
  });
});

