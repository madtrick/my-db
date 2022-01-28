'use strict';

const _ = require('lodash');

class DBAdapter {
  static formatDate (transaction) {
    return new Date(transaction.Date);
  }

  static adapt (transaction) {
    const adapted = {
      Amount: _.toNumber(transaction.Amount),
      Date: new Date(transaction.Date),
      Counterparty: transaction.Counterparty,
      Description: transaction.Description,
    };

    return adapted;
  }
}

module.exports = DBAdapter;
