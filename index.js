'use strict';

const yargs = require('yargs');
const fs = require('fs');
const JQL = require('yasjql');
const _ = require('lodash');
const iconv = require('iconv-lite');
const detectCharacterEncoding = require('detect-character-encoding');

const Transactions = require('./lib/transactions');
const dedupTransactions = require('./lib/dedup-transactions');

const argv = yargs
  .option('years', {
    alias: 'y',
    describe: 'Years to analize',
    array: true,
  })
  .option('months', {
    alias: 'm',
    describe: 'Months to analize',
    array: true,
  })
  .option('source', {
    alias: 's',
    describe: 'Pick a source for the transactions',
    choices: ['db', 'dkb'],
  }).argv;

function run (items, query) {
  let bar = query.query;
  if (_.isFunction(bar)) {
    bar = bar();
  }

  let foo = new JQL(items).find(bar.filter);

  if (bar.group) {
    foo = foo.group(bar.group);
  }

  if (bar.order) {
    foo = foo.order(bar.order);
  }

  const results = foo.select(bar.select);

  console.log(query.title);
  console.dir(results, { depth: null, colors: true });
  fs.writeFileSync('./result.json', JSON.stringify(results))
}

const DBAdapter = require('./lib/adapters/db');
const DKBAdapter = require('./lib/adapters/dkb');
const INGDibaAdapter = require('./lib/adapters/ing-diba');

const ADAPTERS = {
  db: DBAdapter,
  dkb: DKBAdapter,
  'ing-diba': INGDibaAdapter,
};

function main () {
  const transactionsSources = argv.source || ['db', 'dkb', 'ing-diba'];
  const years = argv.years || [2018, 2019];
  const months = argv.months || ['01', '02', '03', '04', '05', '06', '07', '08', '09', 10, 11, 12];

  const allTransactions = _.flatten(transactionsSources.map((transactionsSource) => {
    const csvs = fs.readdirSync(`./transactions/${transactionsSource}`);
    const csvsData = _.compact(csvs.map((csv) => {
      const path = `./transactions/${transactionsSource}/${csv}`;

      if (fs.lstatSync(path).isDirectory()) {
        return null;
      }

      if (path.match(/\.DS_Store$/)) {
        return null;
      }

      const buffer = fs.readFileSync(path);
      const detection = detectCharacterEncoding(buffer);

      return iconv.decode(buffer, detection.encoding);
    }));
    return csvsData.map(data => Transactions.fromCSV(data.toString(), ADAPTERS[transactionsSource]));
  }));

  const dedupedTransactions = dedupTransactions(allTransactions);


  for (const year of years) {
    // for (const month of ['06']) {
    for (const month of months) {
      const beginningMonth = new Date(`${year}-${month}-01`);
      const lastDayInMonth = new Date(year, month, 0).getDate()
      const endMonth = new Date(`${year}-${month}-${lastDayInMonth}`);

      const queries = [
        {
          title: 'Salario Contentful',
          query: {
            filter: {
              Date: { gte: beginningMonth, lte: endMonth },
              Counterparty: { match: /Contentful/ },
            },
            group: 'Counterparty',
            select: { sum: 'Amount' },
          },
        },
        {
          title: 'Salario Primark',
          query: {
            filter: {
              Amount: { gt: 0 },
              Date: { gte: beginningMonth, lte: endMonth },
              Counterparty: { match: /PRIMARK/ },
            },
            group: 'Counterparty',
            select: { sum: 'Amount' },
          },
        },
        {
          title: 'Ingresos',
          query: {
            filter: {
              Amount: { gt: 0 },
              Date: { gte: beginningMonth, lte: endMonth },
            },
            select: ['Counterparty', 'Amount'],
          },
        },
        {
          title: 'Ingresos totales',
          query: {
            filter: {
              Amount: { gt: 0 },
              Date: { gte: beginningMonth, lte: endMonth },
            },
            select: { sum: 'Amount' },
          },
        },
        {
          title: 'Gastos',
          query: {
            filter: {
              Amount: { lt: 0 },
              Date: { gte: beginningMonth, lte: endMonth },
            },
            select: { sum: 'Amount' },
            // select: ['Counterparty', 'Amount', 'Date', 'Description', 'hash', '__Order']
          },
        },
      ];

      console.log('=============');
      console.log(`Querying from ${year}/${month}/01 to ${year}/${month}/${lastDayInMonth}`);
      console.log('');

      queries.forEach(query => run(dedupedTransactions.all(), query));
    }
  }
}

main();
