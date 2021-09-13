<template>
  <div class="q-mt-md">
    <q-table
      :title="name"
      :rows="rows"
      :columns="columns"
      row-key="name"
      binary-state-sort
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td v-for="key of columns" :key="key.name" :props="props">
            {{ props.row[key.name] }}
            <q-popup-edit
              v-model="props.row[key.name]"
              @hide="savetextDocument"
            >
              <q-input
                v-model="props.row[key.name]"
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
    const name = ref("");
    const firstElement = computed(() =>
      Object.keys(text.value).find((x) => Array.isArray(text.value[x]))
    );
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

    // Handle messages sent from the extension to the webview
    onMounted(() => {
      handleMessages();
      // @ts-ignore
      const htmlEle = document.getElementsByName("html");
      console.log(htmlEle);
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

            return;
        }
      });
    };

    const savetextDocument = () => {
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
      columns,
      rows,
      text,
      name,
      savetextDocument,
    };
  },
};
</script>
