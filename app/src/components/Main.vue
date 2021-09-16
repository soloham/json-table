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
      class="sticky-header-table full-height"
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
          dense
          filled
          clearable
          clear-icon="close"
          placeholder="Search..."
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

<style lang="scss">
.sticky-header-table {
  /* height or max-height is important */
  height: 310px;

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th {
    /* bg color is important for th; just specify one */
    background-color: var(--q-dark);
  }

  thead tr th {
    position: sticky;
    z-index: 1;
  }
  thead tr:first-child th {
    top: 0;
  }

  /* this is when the loading indicator appears */
  &.q-table--loading thead tr:last-child th {
    /* height of all previous header rows */
    top: 48px;
  }
}
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
    const firstElement = ref(null);

    const loading = ref(false);
    const loadingData = ref(true);
    const filter = ref("");
    const selectedRow = ref();
    const pagination = ref({
      rowsPerPage: 0,
    });
    const columns = computed(() => {
      if (!text.value || !firstElement.value) {
        return [];
      }

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

    const rows = computed(() =>
      text.value && firstElement.value ? text.value[firstElement.value] : []
    );

    const text = ref();

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

      saveTextDocument();

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

      // Webviews are normally torn down when not visible and re-created when they become visible again.
      // State lets us save information across these re-loads
      const state = vscode.getState();
      if (state) {
        updateContent(state.data);
      }

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
            // Then persist state information.
            // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
            vscode?.setState({ data: message });
            return;
        }
      });
    };

    const updateContent = (data) => {
      if (!data) {
        return;
      }
      loadingData.value = true;

      text.value = Hjson.parse(data.text, { keepWsc: true });
      firstElement.value = Object.keys(text.value).find((x) =>
        Array.isArray(text.value[x])
      );
      textDocument.value = data.textDocument;
      name.value = data.name.substring(data.name.lastIndexOf("\\") + 1);
      loadingData.value = false;
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
      updateContent,
    };
  },
};
</script>
