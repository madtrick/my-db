'use strict';

const _ = require('lodash');

class DBAdapter {
  static adapt (transaction) {
    return {
      Amount: _.toNumber(transaction.Amount),
      Date: new Date(transaction.Date),
      Counterparty: transaction.Counterparty,
    };
  }
}

module.exports = DBAdapter;
