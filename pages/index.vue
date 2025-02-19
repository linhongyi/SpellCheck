<template>
  <v-app>
    <v-container>

      <v-textarea label="編輯器" variant="outlined" filled color="blue lighten-4" v-model="wordToCheck"></v-textarea>
      <v-btn @click="checkSpelling()">開始校正</v-btn>
      <v-btn v-if="misspellings.length>0" @click="()=>{dialog=true}">寫入excel</v-btn>
      <div v-if="showResult">
          <p>Misspellings:</p>
          <ul>
            <li v-for="word in misspellings" :style="{color: word.key ? 'white' : 'red'}">{{word.key?word.value:word.value+` - `+word.suggest}}</li>
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

      <v-overlay v-model="loading" absolute>
      <v-progress-circular
        indeterminate
        color="primary"
        size="70"
        width="7"
      ></v-progress-circular>
    </v-overlay>
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
    };
  },
  methods: {
    checkSpelling() {
      try {
        this.loading = true
        this.misspellings = []
        this.tableData = []
        if (this.$typo) {
          const needsCheckWords = this.wordToCheck.split(" ")

          console.log(`checkSpelling,  ${this.wordToCheck}`)

          for(var idx=0; idx<needsCheckWords.length; idx++){
            let word = needsCheckWords[idx]
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
        saveAs(data, "result.xlsx");
    },
  },
};
</script>


