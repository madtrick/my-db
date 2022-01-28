'use strict';

const DKBAdapter = require('../../lib/adapters/dkb');
const DBAdapter = require('../../lib/adapters/db');
const INGDibaAdapter = require('../../lib/adapters/ing-diba');

const chai = require('../helper');

const expect = chai.expect;

describe('Adapters', () => {
  describe('DKB', () => {
    it('adapts', () => {
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
        Kundenreferenz: '',
      };

      const transformed = DKBAdapter.adapt(transaction);

      expect(transformed.Date).to.eql(new Date('2018-01-12'));
      expect(transformed.Counterparty).to.eql('REWE Markt GmbH');
      expect(transformed.Description).to.eql('100118583743521211256004755');
      expect(transformed.Category).to.be.undefined();
      expect(transformed.Amount).to.eql(-13.45);
    });
  });

  describe('Deutsche Bank', () => {
    it('adapts', () => {
      const transaction = {
        Date: 'Sep 1, 2017',
        Counterparty: 'acme',
        Description: 'tnt',
        Account: '1234',
        Bank: 'Acme Bank',
        Product: 'Girokonto',
        Amount: '123',
      };

      const transformed = DBAdapter.adapt(transaction);

      expect(transformed.Date).to.eql(new Date('Sep 1, 2017'));
      expect(transformed.Counterparty).to.eql('acme');
      expect(transformed.Description).to.eql('tnt');
      expect(transformed.Amount).to.eql(123);
    });
  });

  describe('ING Diba', () => {
    it('adapts', () => {
      const transaction = {
        Buchung: '01.08.2018',
        Valuta: '06.08.2018',
        'Auftraggeber/Empfänger': 'VISA SANTIAGO -A CORU A  13',
        Buchungstext: 'Lastschrift',
        Verwendungszweck: 'NR8465185012 A CORU A ES KAUFUMSATZ 26.07 134724 ARN74917678207737068918760',
        Betrag: '-6,40',
        Währung: 'EUR',
      };

      const transformed = INGDibaAdapter.adapt(transaction);

      expect(transformed.Date).to.eql(new Date('2018-08-01'));
      expect(transformed.Counterparty).to.eql('VISA SANTIAGO -A CORU A  13');
      expect(transformed.Description).to.eql('Lastschrift');
      expect(transformed.Category).to.be.undefined();
      expect(transformed.Amount).to.eql(-6.4);
    });
  });
});

