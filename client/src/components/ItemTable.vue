<template>
  <v-container fluid class="hebrew">
    <v-card elevation="4">
      <v-toolbar flat>
          <v-toolbar-title class="font-weight-bold">
            {{tableModel}}
            <div v-if="itemTableList.length" class="subtitle-2 grey--text text--darken-1">
              {{ itemTableList[0].description }} - {{ itemTableList.length - 1 }}
            </div>
          </v-toolbar-title>
        <v-spacer/>
      <v-row class="mr-4 justify-center align-center" dense>
        <v-col v-for="item in chapterList" :key="item.table_code" cols="auto" class="pa-0 mb-1">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-chip v-bind="attrs" v-on="on" small 
                      :input-value="chapter === Number(item.table_code)" 
                      @click="changeChapter(Number(item.table_code))">
                {{ item.table_code }}
              </v-chip>
            </template>
            <span>{{ item.description }}</span>
          </v-tooltip>
        </v-col>
      </v-row>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="חיפוש" single-line hide-details dense outlined clearable class="mr-4" style="max-width:250px"/>
      </v-toolbar>
      <v-data-table
        :headers="headers"
        :items="filteredList"
        :loading="isLoading"
        loading-text="Loading..."
        dense
        fixed-header
        height="70vh"
        disable-pagination
        hide-default-footer
        mobile-breakpoint="0"
        class="elevation-0"
        :item-class="rowClass"
        item-key="_id"
      >
        <template v-slot:[`item.fullId`]="{ item }">
          <div class="d-flex justify-start">
              {{ item.fullId }}
          </div>
        </template>
        <template v-slot:[`item.price`]="{ item }">
          <div class="text-right font-weight-medium">
            {{ item.price ? formatPrice(item.price) + ' ₪' : '' }}
          </div>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>

import apiService from '../services/apiService'
import { loadTable } from '../constants/constants'

export default {
	props: {
    tableModel: {
      type: String,
      required: true
    }
	},
  name: "item-table",

  data() {
    return {
      itemTableList: [],
      search: '',
      isLoading: false,
      chapterList: [],
      chapter: 1,
      headers: [
        { text: "מספר", value: "fullId", align: "center" },
        { text: "Description", value: "description" },
        { text: "מידה", value: "unit", align: "center" },
        { text: "Price", value: "price", align: "start" },
        // { text: "", value: "actions", sortable: false, width: 80 }
      ]
    }
  },

  computed: {
    filteredList() {
      // Apply search filtering first
      let list = this.itemTableList.slice(1)  // skip first item
      if (!this.search) return list
      const s = this.search.toLowerCase()
      return list.filter(i =>
        (i.description && i.description.toLowerCase().includes(s)) ||
        (i.fullId && i.fullId.toLowerCase().includes(s))
      )
    }
  },

  methods: {
    formatPrice(price) {
      return Number(price).toLocaleString()
    },

    retrieveList() {
      this.isLoading = true
      let chapter = this.chapter
      apiService.clientGetEntities(this.tableModel,{ chapter })
      .then(response => {this.itemTableList = Object.freeze(response.data)})
      .catch(console.log)
      .finally(() => {this.isLoading = false})
    },

    changeChapter(chapter) {
      this.chapter = chapter
      this.retrieveList()
    },

    deleteOne(id) {
      if (!confirm("Delete item?")) return
      apiService.deleteOne({model: this.tableModel,id})
      .then(() => {this.retrieveList()})
      .catch(console.log)
    },

    setEdit(item) {
      this.$emit("edit", item)
    },

    rowClass(item) {
      return !item.item ? 'blue lighten-4' : ''
    },

  },

  async mounted() {
    // this.retrieveList()   // def`ault chapter 1
  },

  async created() {
  },

  watch: {
    tableModel: {
      immediate: true,
      async handler() {
        this.chapter = 1 // reset when model changes
        const table_code = this.tableModel === "binarits" ? 8 : 9
        this.chapterList = [] // optional loading state
        const chapterList = (await loadTable(table_code))
          .sort((a, b) => a.table_code - b.table_code)
        this.chapterList = chapterList
        await this.retrieveList()
      }
    }
  }
}
</script>

<style scoped>

.hebrew {
  direction: rtl;
}

.v-data-table {
  font-size: 14px;
}

.v-row {
  flex-wrap: wrap;
}

</style>