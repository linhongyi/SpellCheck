import Typo from "typo-js";

export default async ({ app }, inject) => {
  const fetchDictionary = async (filename) => {
    const response = await fetch(`/dictionaries/${filename}`);
    // console.log(`response = `,response)
    return response.text();
  };



  if(process.client==true){
    const affData = await fetchDictionary("en_US.aff");
    const dicData = await fetchDictionary("en_US.dic");
  
    const typo = new Typo("en_US", affData, dicData);
    inject("typo", typo);
  }

};
