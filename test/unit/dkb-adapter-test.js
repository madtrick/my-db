'use strict';

const DKBAdapter = require('../../lib/adapters/dkb');
const DBAdapter = require('../../lib/adapters/db');

const chai = require('../helper');

const expect = chai.expect;

describe('Adapters', function () {
  describe('DKB', function () {
    it('adapts', function () {
      const transaction = {
        Buchungstag: '12.01.2018',
        Wertstellung: '12.01.2018',
        Buchungstext: 'Lastschrift',
        'Auftraggeber / Begünstigter': 'REWE Markt GmbH',
        Verwendungszweck: '100118583743521211256004755',
        Kontonummer: 'DE91700202700015820755',
        BLZ: 'HYVEDEMMXXX',
        'Betrag (EUR)': '-13,45',
        'Gläubiger-ID': 'DE58ZZZ00000257236    ',
        Mandatsreferenz: '5600475528181801101858',
        Kundenreferenz: ''
      };
// "Buchungstag";"Wertstellung";"Buchungstext";"Auftraggeber / Begünstigter";"Verwendungszweck";"Kontonummer";"BLZ";"Betrag (EUR)";"Gläubiger-ID";"Mandatsreferenz";"Kundenreferenz";

      const transformed = DKBAdapter.adapt(transaction);

      expect(transformed.Date).to.eql(new Date('2018-01-12'));
      expect(transformed.Counterparty).to.eql('REWE Markt GmbH');
      expect(transformed.Description).to.eql('100118583743521211256004755');
      expect(transformed.Category).to.be.undefined;
      expect(transformed.Amount).to.eql(-13.45);
    });
  });

  describe('Deutsche Bank', function () {
    it('adapts', function () {
      const transaction = {
        Date: 'Sep 1, 2017',
        Counterparty: 'acme',
        Description: 'tnt',
        Category: 'weapons',
        Account: '1234',
        Bank: 'Acme Bank',
        Product: 'Girokonto',
        Amount: '123'
      };

      const transformed = DBAdapter.adapt(transaction);

      expect(transformed.Date).to.eql(new Date('Sep 1, 2017'));
      expect(transformed.Counterparty).to.eql('acme');
      expect(transformed.Description).to.eql('tnt');
      expect(transformed.Category).to.eql('weapons');
      expect(transformed.Amount).to.eql(123);
    });
  });
});

