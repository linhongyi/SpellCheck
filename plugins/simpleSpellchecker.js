import SpellChecker from "simple-spellchecker";

export default ({ app }, inject) => {
  SpellChecker.getDictionary("en-US", (err, dictionary) => {
    if (err) {
      console.error("Error loading dictionary:", err);
      return;
    }
    else{
      console.log(`successful load simple spellcheck`)

      // const word = `hello`
      // console.log(`dictionary.spellCheck(${word}) =`,dictionary.spellCheck(word))
      // console.log(`dictionary.getSuggestions(${word}) =`,dictionary.getSuggestions(word))
    }
    inject("spellchecker", {
      check: (word) => dictionary ? dictionary.spellCheck(word) : null,
      suggest: (word) => dictionary ? dictionary.getSuggestions(word) : [],
    });

    app.$dictionary = dictionary;

  });
};
