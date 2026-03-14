<template>
  <div class="list row">
      <v-flex xs12 md6 mt-5>
        <v-data-table :headers="headers" 
                      :items="priceList"
                      :search="search"
                      disable-pagination
                      hide-default-footer
                      fixed-header
                      height="70vh"
                      dense
                      mobile-breakpoint="0"
                      class="elevation-3 hebrew"
                      loading = "isLoading"
                      loading-text="Loading... Please wait">
          <template v-slot:top>
            <v-toolbar>
              <v-row style="justify-content: center;">
                <v-col cols="5">
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="חיפוש"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
              <export-excel
                :data="priceList"
                type="xlsx"
                name="all-priceList"
                title="All Prices"
                footer="This is footer">
                <v-btn x-small class="btn btn-danger">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>
            </v-toolbar>           
          </template>
        </v-data-table>
      </v-flex>
  </div>
</template>



<script>
import { PRICE_MODEL } from '../constants/constants';
import apiService from '../services/apiService';
import excel from "vue-excel-export";
import Vue from "vue";

Vue.use(excel);


export default {
  name: "price-list",
  data() {
    return {
      priceList: [],
      search: '',
      headers:[
        { text: "Topic", value: "topic", class: 'success title'},
        { text: "topic_id", value: "topic_id", class: 'success title'},
        { text: "Description", value: "description", class: 'success title', groupable: false },
        { text: "measure", value: "measure", class: 'success title', groupable: false },
        { text: "Price", value: "price", sortable: false, class: 'success title', groupable: false  },
      ],
      isLoading: false,
      itemToEdit: "",
      fldRules: [v => !!v || 'Field is required'],
    };
  },

  methods: {
    retrievePrices() {
      apiService.clientGetEntities(PRICE_MODEL)
        .then((response) => {
          this.priceList = response.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    deleteOne(id) {
      if (window.confirm('Are you sure you want to delete one item ?')){
        apiService.deleteOne({model: PRICE_MODEL ,id})
          .then((response) => {
            console.log(response.data);
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },

    refreshList() {
      this.retrievePrices();
    },

    clearForm (){
      this.$refs.form.reset()
    },

    updateOne(item) {
      apiService.updateEntity({_id:item._id}, item, {model: PRICE_MODEL})
        .then(response => {
          console.log(response.data);
          this.message = 'The updateOne() updated successfully!';
        })
        .catch(e => {
          console.log(e);
        });
        this.itemToEdit = '';
    },

    setEdit(item) {
      this.itemToEdit = item._id;
      setTimeout( () => {
        document.getElementById(`itemEdit-${item._id}`).focus()
      }, 1 );
    },
  },

  computed: {

  },

  mounted() {
    this.retrievePrices();
  },
};



</script>

<style>
.list {
  text-align: left;
  max-width: auto;
  margin: auto;
  justify-content: center;
}
.title {
border: 3px solid blue;
text-align: center;
font-weight: bold;
font-size: 16px;
}
.hebrew {
  direction: rtl;
  text-align-last: right !important
}
.v-toolbar__content {
  justify-content: center;
}
</style>
