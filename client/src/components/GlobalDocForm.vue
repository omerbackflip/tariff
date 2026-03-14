<template>
  <div style="direction: rtl;">
    <v-row justify="center">
      <v-col cols="12" md="4" class="pa-0">
        <v-data-table :headers="headers" 
                      :items="documentList"
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
            </v-toolbar>           
          </template>
          <template v-slot:[`item.actions`]="{ item }"> 
            <v-row justify="space-between">
              <!-- <v-col>
                <v-icon small @click="(itemToEdit === item._id) ? updateOne(item) : setEdit(item)">
                  {{(itemToEdit === item._id) ? "mdi-floppy" : "mdi-pencil"}}
                </v-icon>
              </v-col> -->
              <v-col>
                <v-icon small @click="sendFile(item)">mdi-whatsapp</v-icon>
              </v-col>
              <v-col>
                <v-icon small @click="sendFileByEmail(item)">mdi-email</v-icon>
              </v-col>
              <v-col>
                <v-icon small @click="deleteOne(item._id)">mdi-delete</v-icon>
              </v-col>
            </v-row>
          </template>
          <template v-slot:[`item.description`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.description"
                            :id="`itemEdit-${item._id}`"/>
            </div>
            <div style="cursor: pointer;">
              <span @click="openFile(item)"> {{item.description}}</span>
            </div>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <modal-dialog ref="modalDialog"/>
  </div>
</template>



<script>
import { TABLE_MODEL, viewGDFile, shareOnWhatsApp } from '../constants/constants';
import apiService from '../services/apiService';
import modalDialog from './Common/ViewFileModal.vue';


export default {
  name: "table-list",
  components: {modalDialog},
  data() {
    return {
      documentList: [],
      search: '',
      headers:[
        { text: "שם המסמך", value: "description", class: 'success title', groupable: false },
        { text: "פעולה", value: "actions", sortable: false, class: 'success title', groupable: false  },
      ],
      isLoading: false,
      itemToEdit: "",
      tblFields: {
        table_id:         "",
        table_code:       "",
        GDFileId:       "",
        description:"",
      },
    };
  },

  methods: {
    retrieveDocs() {
      let table_id = 8;
      apiService.clientGetEntities(TABLE_MODEL, {table_id})
        .then((response) => {
          this.documentList = response.data.sort((a, b) => a.table_code - b.table_code);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    deleteOne(id) {
      if (window.confirm('Are you sure you want to delete one item ?')){
        apiService.deleteOne({model: TABLE_MODEL ,id})
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
      this.retrieveDocs();
    },

    editOne(id) {
      this.$router.push({ name: "table-details", params: { id: id } });
    },

    updateOne(item) {
      apiService.updateEntity({_id:item._id}, item, {model: TABLE_MODEL})
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

    async openFile(item) {
      await viewGDFile(item.GDFileId, this.$refs.modalDialog);
    },

    async sendFile(item) {
      const msg = 'שלום מגדות סקיי, מצורף המסמך:'
      await shareOnWhatsApp(item.GDFileId, msg);
    },

    async sendFileByEmail(item) {
      try {
        const fileUrl = `https://drive.google.com/uc?id=${item.GDFileId}&export=download`;

        // Compose an email with subject and body
        const subject = encodeURIComponent('מסמך מגדות סקיי');
        const body = encodeURIComponent(`שלום,\n\nמצורף המסמך המבוקש:\n${fileUrl}`);

        // Open the user’s default email client with prefilled email
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      } catch (err) {
        console.error('Failed to send email', err);
      }
    }
  },

  computed: {

  },

  mounted() {
    this.retrieveDocs();
  },
};



</script>

<style>
</style>
