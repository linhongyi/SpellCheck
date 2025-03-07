import SpellChecker from "simple-spellchecker";

const express = require('express');
const app = express();


let dictionary

// Load the dictionary **only once**
SpellChecker.getDictionary("en-US", (err, dict) => {
    if (err) {
      console.error("Failed to load dictionary:", err);
    } else {
        console.log(`successful load simple spellcheck in api`)
      dictionary = dict;
    }
});
  
app.get('/helloSimpleCheck', (req, res) => {
    res.json({ msg:`helloSimpleCheck` });
});

app.get('/simpleCheckWord', (req, res) => {
    try {
        const word = req.query.word || "";
        const isCorrect = dictionary.spellCheck(word);
        console.log(`simpleCheckWord, isCorrect = ${isCorrect}`)
        res.setHeader("Content-Type", "application/json");
        res.json({ check: isCorrect });
    } catch (error) {

        console.log(`simpleCheckWord, error =`,error)
        res.end(error);
    }

});

app.get('/simpleSuggestWord', (req, res) => {

    try {
        const word = req.query.word || "";
        const suggestions = dictionary.getSuggestions(word);
        res.setHeader("Content-Type", "application/json");
        res.json({ suggest: suggestions });
    } catch (error) {
        console.log(`simpleSuggestWord, error =`,error)
        res.end(error);
    }

    
});

module.exports = app