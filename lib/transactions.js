'use strict';

const parseCSV = require('csv-parse/lib/sync');
const SJQL = require('yasjql');
const { groupBy } = require('lodash');
const objectHash = require('./object-hash');

class Transactions {
  static fromCSV (csv, adapter) {
    const parsed = parseCSV(csv, { delimiter: ';', columns: true });
    const transformed = parsed.map(item => adapter.adapt(item));

    const groupedByYear = groupBy(transformed, (item) => {
      return item.Date.getUTCFullYear();
    });

    for (const year in groupedByYear) {
      const yearItems = groupedByYear[year]
      const groupedByMonth = groupBy(yearItems, (item) => {
        return item.Date.getUTCMonth();
      });

      for (const month in groupedByMonth) {
        const monthItems = groupedByMonth[month].reverse()
        monthItems.forEach((item, index) => {
          item.__Order = index + 1;
        })
      }
    }

    transformed.forEach((item) => {
      item.hash = objectHash(item);
    })

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
