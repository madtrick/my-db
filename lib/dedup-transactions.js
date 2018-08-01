'use strict';

const _ = require('lodash');
const Transactions = require('./transactions');

module.exports = function dedup (transactionsCollections) {
  const allTransactions = _.flatten(
    transactionsCollections.map(transactionsCollection => transactionsCollection.all()));

  const hashes = [];
  const uniqTransactions = allTransactions.reduce((acc, transaction) => {
    if (hashes.includes(transaction.hash)) {
      return acc;
    }

    hashes.push(transaction.hash);
    acc.push(transaction);

    return acc;
  }, []);

  return new Transactions(uniqTransactions);
};
