<template>
    <nav>
        <v-app-bar app dark>
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
                <div :class="local ? 'bckg-red' :''" style="font-size: x-small;">
                    <div v-if="isMobile()">
                        {{local ? 'L' : 'P'}}
                    </div>
                    <div v-else>
                        {{local ? 'LocalHost' : 'Production'}}
                    </div>
                </div>
                <v-col col="10">
                    <div class="text-center" style="text-align-last: justify;">
                        {{ new Date() | formatDate  }}
                        {{ role }}
                        <v-btn x-small @click="callAddNewRow()">
                            <v-icon small>mdi-plus</v-icon>
                        </v-btn>
                        <v-btn x-small @click="$emit('logout')" icon>
                            <v-icon small>mdi-logout</v-icon>
                        </v-btn>
                    </div>
                </v-col>
                <v-menu offset-y>
                    <template v-slot:activator="{ on, attrs }">
                        <v-btn icon v-bind="attrs" v-on="on" class="float-right">
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </template>
                    <v-list>
                        <v-list-item v-for="link in links" :key="link.text" router :to="link.route">
                            <v-list-item-title>{{link.text}}</v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
        </v-app-bar>
        <v-navigation-drawer app v-model="drawer" class="primary" temporary>
            <v-list>
                <v-list-item v-for="link in links" :key="link.text" router @click="navigate(link)">
                <!-- <v-list-item v-for="link in links" :key="link.text" router :to="link.route"> -->
                    <v-list-item-action>
                        <v-icon class="white--text">{{link.icon}}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title class="white--text">{{link.text}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item @click="checkGoogleConnection()">
                    <v-list-item-action>
                        <v-icon class="white--text">
                            links
                        </v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                        <v-list-item-title v-model="googleConnectMenuItem" class="white--text">
                            {{ googleConnectMenuItem }}
                        </v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-navigation-drawer>
        <template v-if="openImportModal">
            <ImportXLS :setImportModal="closeModal" :importData="importData"/>
        </template>
    </nav>
    
</template>



<script>
import ImportXLS from '../ImportXLS.vue';
import Vue from "vue";
import moment from "moment";
import { isMobile } from '../../constants/constants';
import SpecificServiceEndPoints from "../../services/specificServiceEndPoints";
import { checkGoogleStatus } from "@/utils/commonService";

Vue.filter("formatDate", function (value) {
	if (value) {
        moment.locale('he')
        // return moment(value).format("DD/MM/YYYY - hh:mm");
        return moment(value).format("DD/MM/YYYY - dddd");
	}
});
export default {
    name: 'Navbar',
    components: { ImportXLS },
    data() {
        return {
            drawer: false,
            openImportModal: false,
            googleConnectMenuItem: 'Google (Not Connected)',
            importData: [], // EXCEL
            links: [
                {icon: 'folder', text: 'טבלת הטבלאות', route: '/'},
                {icon: 'folder', text: 'בינארית', route: '/BinaritList'},
                {icon: 'folder', text: 'קליטת אקסל', route: null, import: 'EXCEL', onClick: 'runModal'},
            ],
            displayDay: '',
            local: false,
            isMobile,
            activeComponent: '',
            role: '', // 'admin' or 'viewer'
        }
    },
    methods:{
        callAddNewRow() {
            switch (this.$route.path) {
                case '/diaryList' :
                    this.$root.$emit('addNewTariff');
                    break;
                case '/holderList' :
                    this.$root.$emit('addNewHolder');
                    break;
                default :
                    this.$root.$emit('addNewLead');
            }
        },

        runModal(importData) {
            // console.log(importData)
            switch (importData) {
                case 'INVOICES' :
                    this.importData = "INVOICES";
                    break;
                case 'BOOKS' :
                    this.importData = "BOOKS";
                    break;
                case 'EXCEL' :
                    this.importData = "EXCEL";
                    break;
            }
            this.openImportModal = true;
        },

        navigate(link) {
            if(link.route) {
                if (this.$route.path != link.route) { // avoid calling same route
                    this.activeComponent = link.route;
                    this.$router.push({ path: link.route , query: this.query || {}});
                }
            } else {
                this[link.onClick](link.import);
            }
        },

        closeModal() {
            this.openImportModal = false;
        },

        async getDatabaseInformation() {
            try {
                const response = await SpecificServiceEndPoints.getDbInfo();
                if(response && response.data && response.data.success) {
                    this.local = response.data.local;
                }
            } catch (error) {
                console.log(error);

            }
        },

        async checkGoogleConnection() {
            console.log('checkGoogleConnection Running');
             await checkGoogleStatus((menuItem) => {
                this.googleConnectMenuItem = menuItem;
            });
        },
    },
    computed: {
    },
    async mounted() {
        this.getDatabaseInformation();
        this.checkGoogleConnection();
        this.role = localStorage.getItem('TariffAuthenticated'); // 'admin' or 'viewer'
    },
}
</script>

<style scoped>
    .plus-button{
        font-size: 29px !important;
        padding-top: 0px;
        padding-left: 15px;
        border: 1px solid;
        margin-top: 8px;
        margin-left: 15px;
        height: 42px !important;
    }
    .year-input{
        padding: 0;
        border: 1px solid;
        margin-top: 7px;
        color: white;
        font-size: 12px;
    }
    .year-input:nth-child(1){
        height: 42px !important;
    }
    .cursor-pointer{
        cursor: pointer ;
    }
    .bckg-red {
        background-color: red;
        /* -webkit-writing-mode: vertical-rl */
    }
</style>


