<template>
  <v-container fluid class="hebrew">

    <v-card elevation="4">
      <v-toolbar flat>
          <v-toolbar-title class="font-weight-bold">
            רשימת בינארית
            <div v-if="binaritList.length" class="subtitle-2 grey--text text--darken-1">
              {{ binaritList[0].description }}
            </div>
          </v-toolbar-title>
        <v-spacer/>
        <v-chip-group v-model="chapter" active-class="primary white--text" mandatory @change="changeChapter" class="mr-4">
          <v-tooltip v-for="item in chapterList" :key="item.table_code" bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-chip v-bind="attrs" v-on="on" :value="Number(item.table_code)" small>
                {{ item.table_code }}
              </v-chip>
            </template>
            <span>{{ item.description }}</span>
          </v-tooltip>
        </v-chip-group>
        <v-text-field v-model="search" append-icon="mdi-magnify" label="חיפוש" single-line hide-details dense outlined clearable class="mr-4" style="max-width:250px"/>
        <!-- <export-excel :data="binaritList" type="xlsx" name="binarit-list">
          <v-btn small color="primary" class="mr-5">
            <v-icon small left>mdi-download</v-icon>
          </v-btn>
        </export-excel> -->
      </v-toolbar>
      <v-divider/>
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
            <v-chip small color="blue lighten-4" text-color="blue darken-4">
              {{ item.fullId }}
            </v-chip>
          </div>
        </template>

        <template v-slot:[`item.price`]="{ item }">
          <div class="text-right font-weight-medium">
            {{ item.price ? formatPrice(item.price) + ' ₪' : '' }}
          </div>
        </template>

        <!-- <template v-slot:[`item.actions`]="{ item }">
          <v-icon small color="primary" class="mr-2" @click="setEdit(item)">mdi-pencil</v-icon>
          <v-icon small color="red"  @click="deleteOne(item._id)">mdi-delete</v-icon>
        </template> -->
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>

import { BINARIT_MODEL } from '../constants/constants'
import apiService from '../services/apiService'
import excel from "vue-excel-export"
import Vue from "vue"
import { loadTable } from '../constants/constants'

Vue.use(excel)

export default {

  name: "binarit-list",

  data() {
    return {

      binaritList: [],
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
    let list = this.binaritList.slice(1)  // skip first item

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
      apiService.clientGetEntities(BINARIT_MODEL,{ chapter })
      .then(response => {this.binaritList = Object.freeze(response.data)})
      .catch(console.log)
      .finally(() => {this.isLoading = false})
    },

    changeChapter(chapter) {
      this.chapter = chapter
      this.retrieveList()
    },

    deleteOne(id) {
      if (!confirm("Delete item?")) return
      apiService.deleteOne({model: BINARIT_MODEL,id})
      .then(() => {this.retrieveList()})
      .catch(console.log)
    },

    setEdit(item) {
      this.$emit("edit", item)
    },

    rowClass(item) {
      return !item.item ? 'blue lighten-4' : ''
    }

  },

  async mounted() {
    this.chapterList = (await loadTable(8)).sort((a, b) => a.table_code - b.table_code)
    this.retrieveList()   // default chapter 1
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

</style>