<template>
  <div class="pdf-preview">
    <div class="header">
      <img class="logo" src="./../assets/gadot_logo.jpg" alt="Logo" />
      <h2><strong>{{ holder.name }}</strong> -   דירה: {{ holder.flatId }}</h2>
    </div>

    <div class="details">
      <p><strong>דירה:</strong> {{ holder.flatId }}</p>
    </div>

    <v-simple-table class="bills">
      <thead>
        <tr>
          <th>מק"ט</th>
          <!-- <th>תאור</th>
          <th>יח'</th>
          <th>עלות</th> -->
          <th>כמות</th>
          <th>סה"כ</th>
          <th>קוד משלם</th>
          <th>לתשלום</th>
          <th>הערות</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(bill, idx) in bills || []" :key="idx">
          <td>
<v-combobox
  v-model="bill.selectedTopic"
  :items="topicList"
  item-value="topic_id"
  return-object
  dense
  outlined
  hide-details
  @change="onTopicChange(bill)"
>
  <!-- Dropdown list -->
  <template v-slot:item="{ item }">
    <div class="d-flex justify-space-between" style="width: 100%;">
      <div class="text-right">
        <strong>{{ item.topic_id }}</strong> - {{ item.description }}
      </div>
      <div class="text-left">
        {{ item.price }} ₪
      </div>
    </div>
  </template>

  <!-- Selected item -->
  <template v-slot:selection="{ item }">
    <div class="d-flex justify-space-between" style="width: 100%;">
      <div class="text-right">
        <strong>{{ item.topic_id }}</strong> - {{ item.description }}
      </div>
      <div class="text-left">
        {{ item.price }} ₪
      </div>
    </div>
  </template>
</v-combobox>



          </td>
          <!-- <td>{{ bill.description }}</td>
          <td>{{ bill.measure }}</td>
          <td>{{ bill.price }}</td> -->
          <td>{{ bill.amount }}</td>
          <td>{{ bill.toPay }}</td>
          <td>{{ bill.charge_type }}</td>
          <td>{{ bill.toPay }}</td>
          <td>{{ bill.remark }}</td>
        </tr>
      </tbody>
    </v-simple-table>
  </div>
</template>

<script>
import apiService from "../services/apiService";
import { BILL_MODEL, PRICE_MODEL } from "../constants/constants";

export default {
  name: "PdfPreview",
  props: ["holder"],

  data() {
    return {
      bills: [],
      topicList: [],
    };
  },

  methods: {
onTopicChange(bill) {
  const selected = bill.selectedTopic;
  if (!selected) return;
  bill.topic_id = selected.topic_id;
  bill.description = selected.description || "";
  bill.measure = selected.measure || "";
  bill.price = selected.price || 0;
}
  },

  async mounted() {
    // Fetch list of topics for the combobox
    const topicResponse = await apiService.clientGetEntities(PRICE_MODEL);
    this.topicList = topicResponse.data || [];

    // Fetch bills and enrich with pricing
    const billResponse = await apiService.clientGetEntities(BILL_MODEL, {flatId: this.holder.flatId});
    const rawBills = billResponse.data || [];

this.bills = await Promise.all(
  rawBills.map(async (bill) => {
    const priceResponse = await apiService.clientGetEntities(PRICE_MODEL, { topic_id: bill.topic_id });
    const price = priceResponse.data?.[0] || {};

    return {
      ...bill,
      selectedTopic: price, // set this for combobox
      description: price.description || "",
      measure: price.measure || "",
      price: price.price || 0,
    };
  })
);
  },
};
</script>



<style scoped>
.pdf-preview {
  direction: rtl;
  font-family: sans-serif;
  padding: 20px;
  color: #333;
  background-color: #fff;
}
.header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.logo {
  width: 80px;
  margin-left: 20px;
}
.details p {
  margin: 4px 0;
  font-size: 14px;
}
.bills {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 14px;
}
.bills th, .bills td {
  border: 1px solid #999;
  padding: 8px;
  text-align: center;
}
.bills thead {
  background-color: #f0f0f0;
}
</style>