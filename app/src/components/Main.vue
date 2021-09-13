<template>
  <div class="q-mt-md full-height">
    <q-markup-table v-if="loadingData">
      <thead>
        <tr>
          <th class="text-left" style="width: 150px">
            <q-skeleton animation="blink" type="text" />
          </th>
          <th class="text-right">
            <q-skeleton animation="blink" type="text" />
          </th>
          <th class="text-right">
            <q-skeleton animation="blink" type="text" />
          </th>
          <th class="text-right">
            <q-skeleton animation="blink" type="text" />
          </th>
          <th class="text-right">
            <q-skeleton animation="blink" type="text" />
          </th>
          <th class="text-right">
            <q-skeleton animation="blink" type="text" />
          </th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="n in 5" :key="n">
          <td class="text-left">
            <q-skeleton animation="blink" type="text" width="85px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" width="50px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" width="35px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" width="65px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" width="25px" />
          </td>
          <td class="text-right">
            <q-skeleton animation="blink" type="text" width="85px" />
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <q-table
      v-else
      class="full-height"
      :title="name"
      :rows="rows"
      :columns="columns"
      row-key="name"
      virtual-scroll
      wrap-cells
      :filter="filter"
      :selected="selectedRow"
      :pagination="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top>
        <div class="q-table__title q-mr-md">{{ name }}</div>
        <q-btn
          color="primary"
          round
          icon="add"
          size="xs"
          :disable="loading"
          @click="addRow"
        />
        <q-space />
        <q-input
          borderless
          dense
          debounce="300"
          color="primary"
          v-model="filter"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="key of columns" :key="key.name" :props="props">
            {{ props.row[key.name] }}
            <q-popup-edit
              :model-value="props.row[key.name]"
              @update:model-value="saveValue"
              @hide="saveTextDocument"
            >
              <q-input
                :model-value="props.row[key.name]"
                @update:model-value="saveValue($event, props.row, key.name)"
                :type="getColType(props.row[key.name])"
                dense
                autofocus
                auto-save
                counter
              />
            </q-popup-edit>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<style>
</style>

<script>
import Hjson from "hjson";
import { ref, computed, onMounted } from "vue";

// @ts-ignore
const vscode =
  typeof acquireVsCodeApi !== "undefined" ? acquireVsCodeApi() : null; // eslint-disable-line

export default {
  name: "Main",
  setup() {
    const name = ref("JSON");
    const firstElement = computed(() =>
      Object.keys(text.value).find((x) => Array.isArray(text.value[x]))
    );

    const loading = ref(false);
    const loadingData = ref(true);
    const filter = ref("");
    const selectedRow = ref();
    const pagination = ref({
      rowsPerPage: 0,
    });
    const columns = computed(() => {
      const headers = Object.keys(text.value[firstElement.value][0]);
      return headers?.map((x) => ({
        name: x,
        required: true,
        label: x,
        align: "left",
        field: (row) => row[x],
        format: (val) => `${val}`,
        sortable: true,
      }));
    });

    const rows = computed(() => text.value[firstElement.value]);

    const text = ref(
      JSON.parse(`{
        "$schema": "../../../seeddata.schema.json",
        "SeedData": [
            {
                "Id": 1,
                "Name": "'HSBC'",
                "BankCode": "'TBD'"
            },
            {
                "Id": 2,
                "Name": "'Barclays'",
                "BankCode": "'TBD'"
            },
            {
                "Id": 3,
                "Name": "'Lloyds'",
                "BankCode": "'TBD'"
            },
            {
                "Id": 4,
                "Name": "'Citibank'",
                "BankCode": "'TBD'"
            },
            {
                "Id": 5,
                "Name": "'Bank of America'",
                "BankCode": "'TBD'"
            },
            {
                "Id": 6,
                "Name": "'Meryll-Lynch'",
                "BankCode": "'TBD'"
            }
        ]
    }`)
    );

    const textDocument = ref(null);

    const addRow = () => {
      loading.value = true;

      let index = rows.value.indexOf(selectedRow.value);
      index = index === -1 ? rows.value.length : index;

      const newRow = { ...rows.value[index - 1] };

      text.value[firstElement.value] = [
        ...rows.value.slice(0, index),
        newRow,
        ...rows.value.slice(index),
      ];

      console.log(rows.value);

      loading.value = false;
    };

    const removeRow = () => {
      loading.value = true;
      let index = rows.value.indexOf(selectedRow.value);
      index = index === -1 ? rows.value.length : index;
      text.value[firstElement.value] = [
        ...rows.value.slice(0, index),
        ...rows.value.slice(index + 1),
      ];
      loading.value = false;
    };

    const getColType = (value) => {
      if (typeof value === "number") {
        return "number";
      } else {
        return "text";
      }
    };

    const saveValue = (value, object, key) => {
      const type = getColType(object[key]);
      if (type === "number") {
        object[key] = parseInt(value);
      } else {
        object[key] = value;
      }
    };

    // Handle messages sent from the extension to the webview
    onMounted(() => {
      handleMessages();
      // @ts-ignore
      const htmlEle = document.documentElement;
      htmlEle.style.height = "98%";
      htmlEle.style.display = "grid";
    });

    const handleMessages = () => {
      // @ts-ignore
      window.addEventListener("message", (event) => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
          case "update":
            text.value = Hjson.parse(message.text, { keepWsc: true });
            textDocument.value = message.textDocument;

            // Then persist state information.
            // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
            vscode?.setState({ text });
            name.value = message.name.substring(
              message.name.lastIndexOf("\\") + 1
            );

            loadingData.value = false;
            return;
        }
      });
    };

    const saveTextDocument = () => {
      vscode.postMessage({
        type: "save",
        text: Hjson.stringify(text.value, {
          keepWsc: true,
          quotes: "all",
          separator: true,
          space: 4,
        }),
      });
    };

    return {
      loading,
      filter,
      columns,
      rows,
      addRow,
      removeRow,
      getColType,
      text,
      name,
      saveTextDocument,
      pagination,
      selectedRow,
      saveValue,
    };
  },
};
</script>
