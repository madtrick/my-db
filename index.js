'use strict';

const csv = require('csv');
const fs = require('fs');

const DATA_PATH = './Transactions_10-12-2016.csv';

const csvRows = fs.readFileSync(DATA_PATH);

csv.parse(csvRows.toString(), {delimiter: ';', columns: true}, (error, data) => {
  console.log(data);
});
