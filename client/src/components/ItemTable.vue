<template>
  <v-container fluid class="hebrew">
    <v-card elevation="4">
      <v-toolbar flat>
          <v-toolbar-title class="font-weight-bold">
            {{tableModel}}
            <div v-if="itemTableList.length" class="subtitle-2 grey--text text--darken-1">
              {{ subtitleText }}
            </div>
          </v-toolbar-title>
        <v-spacer/>
        <v-row class="mr-4 justify-center align-center" dense>
          <v-col v-for="item in chapterList" :key="item.table_code" cols="auto" class="pa-0 mb-1">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-chip v-bind="attrs" v-on="on" small 
                        :input-value="chapter === Number(item.table_code)" 
                        :color="chapter === Number(item.table_code) ? 'primary' : 'grey lighten-3'"
                        :text-color="chapter === Number(item.table_code) ? 'white' : 'black'"
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
              <span v-html="highlight(item.fullId, search)"></span>
          </div>
        </template>
        <template v-slot:[`item.description`]="{ item }">
          <div v-html="highlight(item.description, search)"></div>
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
      subtitle: '',
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
      let list = this.itemTableList
      if (this.search) {
        // Search on whole table when search is active
        const s = this.search.toLowerCase()
        list = list.filter(i =>
          (i.description && i.description.toLowerCase().includes(s)) ||
          (i.fullId && i.fullId.toLowerCase().includes(s))
        )
        // No chapter filter during search
      } else {
        // Filter by chapter when no search
        list = list.filter(item => item.chapter === this.chapter)
        // Skip first row when filtering by chapter
        list = list.slice(1)
      }
      return list
    },

    subtitleText() {
      if (this.search) {
        return `Search results: ${this.filteredList.length} items`
      } else {
        const chapterItems = this.itemTableList.filter(item => item.chapter === this.chapter)
        if (!chapterItems.length) return ''
        return `${chapterItems[0].description} - ${chapterItems.length - 1}`
      }
    }
  },

  methods: {
    formatPrice(price) {
      return Number(price).toLocaleString()
    },

    highlight(text, search) {
      if (!search || !text) return text
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(${escapedSearch})`, 'gi')
      return text.replace(regex, '<mark>$1</mark>')
    },

    retrieveList() {
      this.isLoading = true
      // Load all data without chapter filter for faster local filtering
      apiService.clientGetEntities(this.tableModel,{})
      .then(response => {this.itemTableList = Object.freeze(response.data)})
      .catch(console.log)
      .finally(() => {this.isLoading = false})
    },

    changeChapter(chapter) {
      this.chapter = chapter
      // No need to retrieveList, data is already loaded
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
        const table_code = this.tableModel === "binarits" ? 8 : 9 // 8 or 9 are hardcoded table_code in table model.
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

mark {
  background-color: yellow;
  padding: 0 2px;
}

</style>