<template>
  <span>
    <v-btn @click="openPickerForView" :disabled="!pickerApiLoaded" class="primary" style="margin-left:6px">
      <v-icon>mdi-folder-google-drive</v-icon>
    </v-btn>
  </span>
</template>

<script>
export default {
  name: "GooglePicker",
  props: {
    maxItems: {
      type: Number,
      default: 1,
    },
    GDParantFolder: String,
  },
  data() {
    return {
      pickerApiLoaded: false,
    };
  },
  methods: {
    // Load the Google API script once
    loadGoogleApi() {
      if (typeof window.gapiLoaded == 'undefined') {
        window.gapiLoaded = new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://apis.google.com/js/api.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      return window.gapiLoaded;
    },

    // Initialize Google Picker
    async initGooglePicker() {
      await this.loadGoogleApi();
      window.gapi.load("picker", { callback: this.onPickerApiLoad });
    },

    onPickerApiLoad() {
      this.pickerApiLoaded = true;
    },

    openPickerForView() {
      let apiKey = localStorage.getItem('developerKey');
      let accessToken = localStorage.getItem('googleAccessToken');
      let locale = localStorage.getItem('locale');
      let folderId = this.GDParantFolder; // specific holder folder ID
      if (this.pickerApiLoaded && accessToken) {
        const view = new window.google.picker.DocsView()
          .setParent(folderId)
          .setIncludeFolders(true);
        const picker = new window.google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(accessToken)
          .setDeveloperKey(apiKey)
          .setCallback(this.onViewPicked)
          .setLocale(locale)
          .setMaxItems(1)
          .build();
        picker.setVisible(true);
      }else{
        alert("Please connect your google account.");
      }
    },

    onViewPicked(data) {
      if (data.action === window.google.picker.Action.PICKED) {
        this.$emit("onViewPicked", data);
      }
    },
  },

  mounted() {
    this.initGooglePicker();
  },
  watch: {

  }
};
</script>