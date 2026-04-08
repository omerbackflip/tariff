<template>
  <div class="list">
    <v-card flat class="pa-4">
      <v-row align="center" class="mb-4">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="חיפוש"
            single-line
            hide-details
            dense
          />
        </v-col>

        <v-col cols="12" md="4">
          <v-btn color="primary" class="mr-2" @click="toggleAdd">
            <v-icon left>mdi-plus</v-icon>
            Add record
          </v-btn>
          <v-btn color="secondary" @click="refreshList">
            <v-icon left>mdi-refresh</v-icon>
            Refresh
          </v-btn>
        </v-col>

        <v-col cols="12" md="4" class="d-flex justify-end">
          <export-excel
            :data="$formatDataForExport(tables)"
            type="xlsx"
            name="all-tables"
            title="All Tables"
            footer="This is footer"
          >
            <v-btn small color="error">
              <v-icon small>mdi-download</v-icon>
            </v-btn>
          </export-excel>
        </v-col>
      </v-row>

      <v-expand-transition>
        <v-card v-if="isAdding" outlined class="mb-4">
          <v-card-title class="headline">Add new record</v-card-title>
          <v-card-text>
            <v-form ref="form" v-model="formValid">
              <v-row>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="newItem.table_id"
                    label="ID"
                    :rules="fldRules"
                    dense
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="newItem.table_code"
                    label="Code"
                    :rules="fldRules"
                    dense
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="newItem.description"
                    label="Description"
                    :rules="fldRules"
                    dense
                  />
                </v-col>
                <v-col cols="12" md="3">
                  <v-text-field
                    v-model="newItem.GDFileId"
                    label="GDFileId"
                    dense
                  />
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="auto">
                  <v-btn color="success" @click="saveNew" :disabled="!formValid">
                    Save
                  </v-btn>
                </v-col>
                <v-col cols="auto">
                  <v-btn text @click="cancelAdd">Cancel</v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-expand-transition>

      <v-row>
        <v-col cols="12" md="6">
          <v-card outlined class="pa-2">
            <v-card-title class="subtitle-1 mb-0">Parent rows</v-card-title>
            <v-data-table
              :headers="headers"
              :items="tableID"
              :search="search"
              disable-pagination
              hide-default-footer
              dense
              mobile-breakpoint="0"
              class="elevation-3 hebrew"
              :loading="isLoading"
              loading-text="Loading... Please wait"
              @click:row="filterTbl"
            >
              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon small class="mr-2" @click.stop="editRowId === item._id ? saveEdit(item) : startEdit(item)">
                    {{ editRowId === item._id ? 'mdi-content-save' : 'mdi-pencil' }}
                  </v-icon>
                  <v-icon small v-if="editRowId === item._id" class="mr-2" @click.stop="cancelEdit">mdi-close</v-icon>
                  <v-icon small @click.stop="deleteOne(item._id)">mdi-delete</v-icon>
                </div>
              </template>

              <template v-slot:[`item.description`]="{ item }">
                <div v-if="editRowId === item._id">
                  <v-text-field
                    v-model="editItem.description"
                    dense
                    hide-details
                    :id="`itemEdit-${item._id}`"
                  />
                </div>
                <div v-else>
                  {{ item.description }}
                </div>
              </template>

              <template v-slot:[`item.table_id`]="{ item }">
                <div v-if="editRowId === item._id">
                  <v-text-field v-model="editItem.table_id" dense hide-details />
                </div>
                <div v-else>
                  {{ item.table_id }}
                </div>
              </template>

              <template v-slot:[`item.table_code`]="{ item }">
                <div v-if="editRowId === item._id">
                  <v-text-field v-model="editItem.table_code" dense hide-details />
                </div>
                <div v-else>
                  {{ item.table_code }}
                </div>
              </template>

              <template v-slot:[`item.GDFileId`]="{ item }">
                <div v-if="editRowId === item._id">
                  <v-text-field v-model="editItem.GDFileId" dense hide-details />
                </div>
                <div v-else>
                  {{ item.GDFileId }}
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card outlined class="pa-2">
            <v-card-title class="subtitle-1 mb-0">
              Details:
              <span class="font-weight-medium">{{ tableTitle || 'select a row' }}</span>
            </v-card-title>
            <v-data-table
              :headers="headers"
              :items="tableCode"
              :search="search"
              disable-pagination
              hide-default-footer
              dense
              mobile-breakpoint="0"
              class="elevation-3 hebrew"
              :loading="isLoading"
              loading-text="Loading... Please wait"
            >
              <template v-slot:[`item.actions`]="{ item }">
                <div class="d-flex align-center">
                  <v-icon small class="mr-2" @click.stop="editRowId === item._id ? saveEdit(item) : startEdit(item)">
                    {{ editRowId === item._id ? 'mdi-content-save' : 'mdi-pencil' }}
                  </v-icon>
                  <v-icon small v-if="editRowId === item._id" class="mr-2" @click.stop="cancelEdit">mdi-close</v-icon>
                  <v-icon small @click.stop="deleteOne(item._id)">mdi-delete</v-icon>
                </div>
              </template>

              <template v-slot:[`item.description`]="{ item }">
                <div v-if="editRowId === item._id">
                  <v-text-field v-model="editItem.description" dense hide-details />
                </div>
                <div v-else>
                  {{ item.description }}
                </div>
              </template>

              <template v-slot:[`item.table_id`]="{ item }">
                <div v-if="editRowId === item._id">
                  <v-text-field v-model="editItem.table_id" dense hide-details />
                </div>
                <div v-else>
                  {{ item.table_id }}
                </div>
              </template>

              <template v-slot:[`item.table_code`]="{ item }">
                <div v-if="editRowId === item._id">
                  <v-text-field v-model="editItem.table_code" dense hide-details />
                </div>
                <div v-else>
                  {{ item.table_code }}
                </div>
              </template>

              <template v-slot:[`item.GDFileId`]="{ item }">
                <div v-if="editRowId === item._id">
                  <v-text-field v-model="editItem.GDFileId" dense hide-details />
                </div>
                <div v-else>
                  {{ item.GDFileId }}
                </div>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import { TABLE_MODEL } from '../constants/constants';
import apiService from '../services/apiService';

export default {
  name: "table-list",
  data() {
    return {
      tables: [],
      tableID: [],
      tableCode: [],
      tableTitle: '',
      search: '',
      headers:[
        { text: "ID", value: "table_id", class: 'success title'},
        { text: "CODE", value: "table_code", class: 'success title'},
        { text: "Description", value: "description", class: 'success title', groupable: false },
        { text: "GDFileId", value: "GDFileId", class: 'success title', groupable: false },
        { text: "Act.", value: "actions", sortable: false, class: 'success title', groupable: false  },
      ],
      isLoading: false,
      editRowId: "",
      editItem: null,
      isAdding: false,
      formValid: false,
      selectedParentCode: "",
      newItem: {
        table_id: "",
        table_code: "",
        description: "",
        GDFileId: "",
      },
      fldRules: [v => !!v || 'Field is required'],
    };
  },

  methods: {
    retrieveTables() {
      this.isLoading = true;
      apiService.clientGetEntities(TABLE_MODEL)
        .then((response) => {
          this.tables = response.data;
          this.tableID = response.data.filter(item => item.table_id === 99);
          this.updateTableCode();
        })
        .catch((e) => {
          console.log(e);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    updateTableCode() {
      if (this.selectedParentCode) {
        this.tableCode = this.tables.filter(item => item.table_id === this.selectedParentCode);
      }
    },

    deleteOne(id) {
      if (window.confirm('Are you sure you want to delete one item ?')) {
        apiService.deleteOne({ model: TABLE_MODEL, id })
          .then(() => {
            if (this.editRowId === id) {
              this.cancelEdit();
            }
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },

    refreshList() {
      this.retrieveTables();
    },

    clearForm() {
      this.newItem = {
        table_id: "",
        table_code: "",
        description: "",
        GDFileId: "",
      };
      if (this.$refs.form) {
        this.$refs.form.resetValidation();
      }
      this.formValid = false;
    },

    startEdit(item) {
      this.editRowId = item._id;
      this.editItem = { ...item };
      this.isAdding = false;
      this.$nextTick(() => {
        const field = document.getElementById(`itemEdit-${item._id}`);
        if (field) {
          field.focus();
        }
      });
    },

    cancelEdit() {
      this.editRowId = "";
      this.editItem = null;
    },

    saveEdit(item) {
      apiService.updateEntity({ _id: item._id }, this.editItem, { model: TABLE_MODEL })
        .then(() => {
          this.editRowId = "";
          this.editItem = null;
          this.refreshList();
        })
        .catch((e) => {
          console.log(e);
        });
    },

    toggleAdd() {
      this.isAdding = !this.isAdding;
      if (this.isAdding) {
        this.cancelEdit();
      } else {
        this.clearForm();
      }
    },

    saveNew() {
      if (!this.formValid) return;
      apiService.create(this.newItem, { model: TABLE_MODEL })
        .then(() => {
          this.refreshList();
          this.clearForm();
          this.isAdding = false;
        })
        .catch((e) => {
          console.log(e);
        });
    },

    cancelAdd() {
      this.isAdding = false;
      this.clearForm();
    },

    filterTbl(row) {
      this.selectedParentCode = row.table_code;
      this.tableCode = this.tables.filter(item => item.table_id === row.table_code);
      this.tableTitle = row.description;
      this.cancelEdit();
      this.isAdding = false;
    },
  },

  mounted() {
    this.retrieveTables();
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
  text-align-last: right !important;
}
.v-toolbar__content {
  justify-content: center;
}
</style>
