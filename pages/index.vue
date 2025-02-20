<template>
  <v-app>
    <v-container>

      <v-textarea label="編輯器" variant="outlined" filled color="blue lighten-4" v-model="wordToCheck"></v-textarea>
      <v-btn :loading="loading" @click="checkSpelling()">開始校正</v-btn>
      <v-btn v-if="misspellings.length>0" @click="()=>{dialog=true}">匯出至excel</v-btn>
      <div v-if="showResult" style="margin-top: 10px;">
          <p>文章長度: {{ this.wordToCheck.length }} 字元</p>
          <p>花費時間: {{ (this.elapsedTime / 1000).toFixed(2) }} 秒</p>
          <p>結果:</p>
          <v-checkbox v-model="showErrorOnly" label="只顯示錯誤"></v-checkbox>
          <ul>
            <li v-for="word in $_misspellings()" :style="{color: word.key ? 'white' : 'red'}">{{word.key?word.value:word.value+` - `+word.suggest}}</li>
          </ul>
      </div>

      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title class="headline">匯出</v-card-title>
          <v-card-text>
            校正結果
          </v-card-text>
          <v-card-actions>
            <v-btn text @click="saveToExcel(true)">匯出所有結果</v-btn>
            <v-btn text @click="saveToExcel(false)">匯出錯誤結果</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


    </v-container>
  </v-app>
</template>

<script>
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


export default {
  data() {
    return {
      wordToCheck: "Just like I'm about to sink, just like I'm about to melt Only the two of us at night in the vast sky",
      misspellings:[],
      showResult: false,
      dialog:false,
      loading:false,
      tableData:[],
      elapsedTime:null,
      showErrorOnly:false,
    };
  },
  methods: {
    $_removePunctuation(text) {
      return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()？！，。、《》【】「」『』]/g, "");
    },
    $_misspellings(){
      if(this.showErrorOnly==true){
        return this.misspellings.filter(elmt=>elmt.key==false)
      }
      else{
        return this.misspellings
      }

    },
    checkSpelling() {
      try {
        console.log(`checkSpelling in`)
        this.loading = true
        this.misspellings = []
        this.tableData = []

        setTimeout(() => {
          let startTime = Date.now()
          if (this.$typo) {
            const needsCheckWords = this.wordToCheck.split(" ")

            console.log(`checkSpelling,  length = ${this.wordToCheck.length}`)

            for(var idx=0; idx<needsCheckWords.length; idx++){
              let word = this.$_removePunctuation(needsCheckWords[idx])
              console.log(`${idx} - this.$typo.check(${word}) = ${this.$typo.check(word)}`)
              if(this.$typo.check(word)==false){
                const suggest = this.$typo.suggest(word)

                if(suggest.length>0){
                  this.misspellings.push({key:false,value:word,suggest:suggest.join(` `)})
                  this.tableData.push({source:word,suggest:suggest.join(` `)})
                }
                else{
                  this.misspellings.push({key:false,value:word,suggest:`NotFound`})
                  this.tableData.push({source:word,suggest:`NotFound`})
                }
              }
              else{
                this.misspellings.push({key:true,value:word})
                this.tableData.push({source:word,suggest:""})
              }
            }
          }
          this.showResult = true
          this.loading = false
          
          let endTime = Date.now()
          this.elapsedTime = endTime - startTime

          console.log(`checkSpelling out, elapsedTime =`,this.elapsedTime)
        }, 1000);
   
      } catch (error) {
        console.log(`checkSpelling, error = `,error)
      }
      
    },
    saveToExcel(allResult){

        this.dialog = false
        let excelData = this.tableData

        if(allResult==false){
          excelData = this.tableData.filter(item => item.suggest.length>0);
        }

        const worksheet = XLSX.utils.json_to_sheet(excelData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, (allResult==true)?"allResult.xlsx":"errorResult.xlsx");
    },
  },
};
</script>


