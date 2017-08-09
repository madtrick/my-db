'use strict';

const inquirer = require('inquirer');
const Bluebird = require('bluebird');
const fs = require('fs');
const JQL = require('yasjql');
const _ = require('lodash');

const Transactions = require('./lib/transactions');

const co = Bluebird.coroutine;

const queries = require('./queries');

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

co(function* main () {
  const csvs = fs.readdirSync('./transactions');
  const files = [
    { type: 'list', name: 'name', message: 'message', choices: csvs },
  ];

  const fileChoice = yield inquirer.prompt(files);
  const csvData = fs.readFileSync(`./transactions/${fileChoice.name}`);
  const transactions = Transactions.fromCSV(csvData.toString());

  const queryChoices = queries.map((query, index) => ({ name: query.title, value: index }));
  const questions = [
    { type: 'list', name: 'queryIndex', message: 'message', choices: queryChoices },
  ];

  const queryChoice = yield inquirer.prompt(questions);
  const query = queries[queryChoice.queryIndex];

  run(transactions.items, query);
})();
