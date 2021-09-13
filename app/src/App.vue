<template>
  <Main />
</template>

<script>
import Main from "./components/Main.vue";
import { useQuasar } from "quasar";

export default {
  name: "LayoutDefault",

  components: {
    Main,
  },

  setup() {
    const $q = useQuasar();
    // set status
    $q.dark.set(true); // or false or "auto"
    return {};
  },
};
</script>
