'use strict';

const yargs = require('yargs');
const fs = require('fs');
const JQL = require('yasjql');
const _ = require('lodash');

const Transactions = require('./lib/transactions');
const dedupTransactions = require('./lib/dedup-transactions');

const argv = yargs
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
  console.dir(results, { depth: null });
}

const DBAdapter = require('./lib/adapters/db');
const DKBAdapter = require('./lib/adapters/dkb');

const ADAPTERS = {
  db: DBAdapter,
  dkb: DKBAdapter,
};

function main () {
  const transactionsSources = argv.source || ['db', 'dkb'];

  const allTransactions = _.flatten(transactionsSources.map((transactionsSource) => {
    const csvs = fs.readdirSync(`./transactions/${transactionsSource}`);
    const csvsData = _.compact(csvs.map((csv) => {
      const path = `./transactions/${transactionsSource}/${csv}`;

      if (fs.lstatSync(path).isDirectory()) {
        return null;
      }

      return fs.readFileSync(path);
    }));
    return csvsData.map(data => Transactions.fromCSV(data.toString(), ADAPTERS[transactionsSource]));
  }));

  const dedupedTransactions = dedupTransactions(allTransactions);

  const beginningMonth = new Date('2018-05-01');
  const endMonth = new Date('2018-05-31');

  const queries = [
    {
      title: 'Salario Contentful',
      query: {
        filter: {
          Date: { gt: beginningMonth, lt: endMonth },
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
          Date: { gt: beginningMonth, lt: endMonth },
          Counterparty: { match: /PRIMARK/ },
        },
        group: 'Counterparty',
        select: { sum: 'Amount' },
      },
    },
    {
      title: 'Gastos',
      query: {
        filter: {
          Amount: { lt: 0 },
          Date: { gt: beginningMonth, lt: endMonth },
        },
        select: { sum: 'Amount' },
      },
    },
  ];

  queries.forEach(query => run(dedupedTransactions.all(), query));
}

main();
