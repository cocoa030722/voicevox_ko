import { createApp } from "vue";
import { createGtm } from "@gtm-support/vue-gtm";
import { Quasar, Dialog, Loading, Notify } from "quasar";
import iconSet from "quasar/icon-set/material-icons";
import { store, storeKey } from "./store";
import { ipcMessageReceiver } from "./plugins/ipcMessageReceiverPlugin";
import { hotkeyPlugin } from "./plugins/hotkeyPlugin";
import App from "@/components/App.vue";
import { markdownItPlugin } from "@/plugins/markdownItPlugin";

import "@quasar/extras/material-icons/material-icons.css";
import "quasar/dist/quasar.sass";
import "./styles/_index.scss";

// NOTE: 起動後、設定を読み込んでからvue-gtmを有効化する関係上、dataLayerの用意が間に合わず、値が欠落してしまう箇所が存在する
//       ため、それを防止するため自前でdataLayerをあらかじめ用意する
// 참고: DataLayer가 제 시간에 준비되지 않았고 설정을 시작한 후 설정을 읽어야 하기 때문에 값이 누락되었으므로, 이를 방지하기 위해 DataLayer를 미리 준비하십시오.
window.dataLayer = [];

createApp(App)
  .use(store, storeKey)
  .use(
    createGtm({
      id: import.meta.env.VITE_GTM_CONTAINER_ID ?? "GTM-DUMMY",
      // NOTE: 처음에는 gtm.js를 읽지 마십시오. 개인 정보 보호 정책에 동의한 후 읽으십시오.
      enabled: false,
    }),
  )
  .use(Quasar, {
    config: {
      brand: {
        primary: "#a5d4ad",
        secondary: "#212121",
        negative: "var(--color-warning)",
      },
    },
    iconSet,
    plugins: {
      Dialog,
      Loading,
      Notify,
    },
  })
  .use(hotkeyPlugin)
  .use(ipcMessageReceiver, { store })
  .use(markdownItPlugin)
  .mount("#app");
