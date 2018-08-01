'use strict';

const yargs = require('yargs');
const inquirer = require('inquirer');
const Bluebird = require('bluebird');
const fs = require('fs');
const JQL = require('yasjql');
const _ = require('lodash');

const Transactions = require('./lib/transactions');

const co = Bluebird.coroutine;

const argv = yargs
  .option('source', {
    alias: 's',
    describe: 'Pick a source for the transactions',
    demandOption: true,
    choices: ['db', 'dkb'],
  }).argv;

function run (t, query) {
  let bar = query.query;
  if (_.isFunction(bar)) {
    bar = bar();
  }

  let foo = new JQL(t).find(bar.filter);

  if (bar.group) {
    foo = foo.group(bar.group);
  }

  if (bar.order) {
    foo = foo.order(bar.order);
  }

  const results = foo.select(bar.select);

  if (query.print) {
    query.print(results);
  } else {
    console.log(results);
  }
}

const DBAdapter = require('./lib/adapters/db');
const DKBAdapter = require('./lib/adapters/dkb');

const ADAPTERS = {
  db: DBAdapter,
  dkb: DKBAdapter,
};

co(function* main () {
  const transactionsSource = argv.source;
  const csvs = fs.readdirSync(`./transactions/${transactionsSource}`);
  const files = [
    { type: 'list', name: 'name', message: 'message', choices: csvs },
  ];

  const fileChoice = yield inquirer.prompt(files);
  const csvData = fs.readFileSync(`./transactions/${transactionsSource}/${fileChoice.name}`);
  const transactions = Transactions.fromCSV(csvData.toString(), ADAPTERS[transactionsSource]);

  const query = {}; // placeholder to keep the linter happy
  run(transactions.items, query);
})();
