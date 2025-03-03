import Spellchecker from 'hunspell-spellchecker';
import fs from 'fs';

const express = require('express');
const app = express();

const spell = new Spellchecker();
const affix = fs.readFileSync('./static/dictionaries/en_US.aff');
const dictionary = fs.readFileSync('./static/dictionaries/en_US.dic');

const DICT = spell.parse({
  aff: affix,
  dic: dictionary
});

spell.use(DICT);

export default function checkSpelling(text) {

  return text.split(' ').map(word => ({
    word,
    correct: spell.check(word),
    suggestions: spell.suggest(word)
  }));
}

// 示例：
// console.log(checkSpelling('This is an exmple text.'));

app.get('/hello', (req, res) => {
  res.json({ message: 'wellcome use spell check' });
});

app.get('/checkWord', (req, res) => {
  res.json({ check: spell.check(req.query.word) });
});

app.get('/suggestWord', (req, res) => {
  res.json({ suggest: spell.suggest(req.query.word) });
});

module.exports = app