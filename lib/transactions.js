'use strict';

const parseCSV = require('csv-parse/lib/sync');
const SJQL = require('yasjql');

class Transactions {
  static fromCSV (csv, adapter) {
    const parsed = parseCSV(csv, { delimiter: ';', columns: true });
    const transformed = parsed.map(item => adapter.adapt(item));

    return new Transactions(transformed);
  }

  constructor (items) {
    if (!items) {
      throw new Error('Transactions can not be created without a list of transaction items');
    }
    this.items = items;
  }

  all () {
    return this.items;
  }

  find (filters) {
    return new SJQL(this.items).find(filters);
  }
}

module.exports = Transactions;
