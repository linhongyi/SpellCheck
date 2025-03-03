<template>
  <v-app>
    <v-container>

      <v-textarea label="編輯器" variant="outlined" filled color="blue lighten-4" v-model="wordToCheck"></v-textarea>
      <p>文章長度: {{ this.wordToCheck.length }} 字元</p>
            
      <v-btn @click="triggerFileInput()">讀檔</v-btn>
        <!-- 隱藏的文件選擇器 -->
      <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none" />
    

      <v-btn :loading="loading" @click="checkSpelling()">開始校正</v-btn>
      <v-btn v-if="misspellings.length>0" @click="()=>{dialog=true}">匯出至excel</v-btn>
      <div v-if="showResult" style="margin-top: 10px;">

          <p>結果 - 花費時間: {{ (this.elapsedTime / 1000).toFixed(2) }} 秒</p>
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
    triggerFileInput(){
      this.$refs.fileInput.click(); 
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.wordToCheck = reader.result;
        };
        reader.readAsText(file);
      }
    },
    async checkSpelling() {
      try {
        console.log(`checkSpelling in`)
        
        const basrURL = window.location.origin;
        const checkWordApi = basrURL + '/interApi/checkWord'
        const suggestWordApi = basrURL + '/interApi/suggestWord'

        this.loading = true
        this.misspellings = []
        this.tableData = []


          let startTime = Date.now()
          if (this.$typo) {
            let needsCheckWords = this.wordToCheck.split(/\s+/)

            console.log(`checkSpelling,  length = ${this.wordToCheck.length}`)

            for(var idx=0; idx<needsCheckWords.length; idx++){
              let word = this.$_removePunctuation(needsCheckWords[idx])

              let checkResult = await this.$axios.get(checkWordApi,{params:{word:word}})

              if(checkResult instanceof Error){
                break
              }
              else if(checkResult.data.check==true){
                this.misspellings.push({key:true,value:word})
                this.tableData.push({source:word,suggest:""})
                continue
              }

              /////////

              let suggestResult = await this.$axios.get(suggestWordApi,{params:{word:word}})

              if(suggestResult instanceof Error){
                break
              }
              else if(suggestResult.data.suggest.length<=0){
                this.misspellings.push({key:false,value:word,suggest:`NotFound`})
                this.tableData.push({source:word,suggest:`NotFound`})
                continue
              }

              this.misspellings.push({key:false,value:word,suggest:suggestResult.data.suggest})
              this.tableData.push({source:word,suggest:suggestResult.data.suggest})
            }
          }
          this.showResult = true
          this.loading = false
          
          let endTime = Date.now()
          this.elapsedTime = endTime - startTime

          console.log(`checkSpelling out, elapsedTime =`,this.elapsedTime)
        
   
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


