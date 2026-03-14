<template>
	<div class="text-center">
		<v-dialog v-model="dialog" width="500" persistent>
			<v-card>
				<v-card-title class="text-h5 grey lighten-2">
					{{ importData }}
				</v-card-title>
				<v-progress-linear :indeterminate="loading" color="cyan" height="10"></v-progress-linear>
				<v-card-text> DATA will be overwritten </v-card-text>
				<v-file-input truncate-length="50" @change="setFile"></v-file-input>
				<v-divider></v-divider>

				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn color="primary" text @click="closeImportDialog()"> Close </v-btn>
					<v-btn :disabled = "!file" color="primary" text @click="submitFile()"> Submit </v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<v-snackbar :v-model="message.length" :multi-line="true">
			{{ message }}

			<template v-slot:action="{ attrs }">
				<v-btn color="red" text v-bind="attrs" @click="message = ''">
				Close
				</v-btn>
			</template>
		</v-snackbar>
	</div>
</template>

<script>
import SpecificServiceEndPoints from "../services/specificServiceEndPoints";
import { loadTable } from "../constants/constants";

export default {
	props: {
		// openImportModal: Boolean,
		setImportModal: Function,
		importData:[],
	},
	data() {
		return {
			loadTable,
			file: null,
			message: "",
			dialog: false,
			company: '',
			importYear: '',
			years: [],
			loading: false,
		};
	},
	methods: {
		closeImportDialog() {
			this.setImportModal(false);
		},
		setFile(file) {
			if (file.name.includes(".xlsx"))
			// if (file.type === "text/csv")
				this.file = file; 
			else
				alert("file type MUST be xlsx")
		},
		async submitFile() {
			this.loading = true;
			try {
				let response = '';
				switch (this.importData){
					case "EXCEL" :
						response = await SpecificServiceEndPoints.saveExcelBulk(this.file)
						break
					default : alert("switch/case statment not resolved")
				}
				if (response.data && response.data.success) {
					this.message = "CSV Data successfully imported";
					setTimeout(() => {
						this.closeImportDialog();
					}, 3500);
					window.location.reload();
				}
			} catch (error) {
				console.log(error);
				this.message = "Something went wrong! Please try again later!";
			}
			this.loading = false;
		},

	},
	async mounted() {
		// await this.loadTable(4, "years");
		// this.years = (await loadTable(4)).map((code) => code.description);
		this.dialog = true;
	}
};
</script>

<style scoped>
/* .v-radio-group {
	margin-top: 0px; 
	padding-top: 0px;
} */
.radio-group{
	border-right-style: outset;
	direction: rtl;
}
.v-row {
	margin-left: 0px;
    margin-right: 0px;
}
</style>