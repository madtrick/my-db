'use strict';

const _ = require('lodash');
const objectHash = require('../object-hash');

const converToValidDateFormat = function converToValidDateFormat (string) {
  const match = string.match(/(\d+)\.(\d+)\.(\d+)/);

  if (!match) {
    throw new Error(`Unexpected date string ${string}`);
  }

  return `${match[3]}-${match[2]}-${match[1]}`;
};

const convertToValidAmountFormat = function convertToValidAmountFormat (string) {
  return string.replace('.', '').replace(',', '.');
};

class DKBAdapter {
  static adapt (transaction) {
    const betrag = transaction['Betrag (EUR)'];
    const auftraggeber = transaction['Auftraggeber / Begünstigter'];
    const amount = _.toNumber(convertToValidAmountFormat(betrag));
    const date = new Date(converToValidDateFormat(transaction.Buchungstag));

    const foo = {
      Amount: amount,
      Date: date,
      Description: transaction.Verwendungszweck,
      Category: undefined,
      Counterparty: auftraggeber,
      hash: objectHash(transaction),
    };

    return foo;
  }
}

module.exports = DKBAdapter;

