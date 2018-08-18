'use strict';

const _ = require('lodash');
const objectHash = require('../object-hash');

class DBAdapter {
  static adapt (transaction) {
    return {
      Amount: _.toNumber(transaction.Amount),
      Date: new Date(transaction.Date),
      Counterparty: transaction.Counterparty,
      hash: objectHash(transaction),
      Description: transaction.Description,
      Category: transaction.Category,
    };
  }
}

module.exports = DBAdapter;
