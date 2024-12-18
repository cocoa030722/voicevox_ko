<template>
  <ErrorBoundary>
    <TooltipProvider disableHoverableContent :delayDuration="500">
      <MenuBar
        v-if="openedEditor != undefined"
        :fileSubMenuData="subMenuData.fileSubMenuData.value"
        :editSubMenuData="subMenuData.editSubMenuData.value"
        :viewSubMenuData="subMenuData.viewSubMenuData.value"
        :editor="openedEditor"
      />
      <KeepAlive>
        <Component
          :is="openedEditor == 'talk' ? TalkEditor : SingEditor"
          v-if="openedEditor != undefined"
          :key="openedEditor"
          :isEnginesReady
          :isProjectFileLoaded
        />
      </KeepAlive>
      <AllDialog :isEnginesReady />
    </TooltipProvider>
  </ErrorBoundary>
</template>

<script setup lang="ts">
import { watch, onMounted, ref, computed, toRaw, watchEffect } from "vue";
import { useGtm } from "@gtm-support/vue-gtm";
import { TooltipProvider } from "radix-vue";
import TalkEditor from "@/components/Talk/TalkEditor.vue";
import SingEditor from "@/components/Sing/SingEditor.vue";
import { EngineId } from "@/type/preload";
import ErrorBoundary from "@/components/ErrorBoundary.vue";
import { useStore } from "@/store";
import { useHotkeyManager } from "@/plugins/hotkeyPlugin";
import AllDialog from "@/components/Dialog/AllDialog.vue";
import MenuBar from "@/components/Menu/MenuBar/MenuBar.vue";
import { useMenuBarData as useTalkMenuBarData } from "@/components/Talk/menuBarData";
import { useMenuBarData as useSingMenuBarData } from "@/components/Sing/menuBarData";
import { setFontToCss, setThemeToCss } from "@/domain/dom";
import { ExhaustiveError } from "@/type/utility";

const store = useStore();

const talkMenuBarData = useTalkMenuBarData();
const singMenuBarData = useSingMenuBarData();

const subMenuData = computed(() => {
  if (openedEditor.value === "talk" || openedEditor.value == undefined) {
    return talkMenuBarData;
  } else if (openedEditor.value === "song") {
    return singMenuBarData;
  }

  throw new ExhaustiveError(openedEditor.value);
});

const openedEditor = computed(() => store.state.openedEditor);

// Google Tag Manager
const gtm = useGtm();
watch(
  () => store.state.acceptRetrieveTelemetry,
  (acceptRetrieveTelemetry) => {
    gtm?.enable(acceptRetrieveTelemetry === "Accepted");
  },
  { immediate: true },
);

// 글꼴 제어 매개변수를 변경합니다
watchEffect(() => {
  setFontToCss(store.state.editorFont);
});

// 편집기 전환 모니터링 및 바로 가기 키 설정 변경
watchEffect(
  () => {
    if (openedEditor.value) {
      hotkeyManager.onEditorChange(openedEditor.value);
    }
  },
  { flush: "post" },
);

// 테마 변경을 모니터링하고 CSS 변수를 변경합니다
watchEffect(() => {
  const theme = store.state.availableThemes.find((value) => {
    return value.name == store.state.currentTheme;
  });
  if (theme == undefined) {
    // NOTE: Vuex가 초기화되지 않은 경우 테마가 아직 로드되지 않았으므로 무시하십시오.
    if (store.state.isVuexReady) {
      throw Error(`Theme not found: ${store.state.currentTheme}`);
    } else {
      return;
    }
  }
  setThemeToCss(theme);
});

// 노래 재생 장치 동기화
watchEffect(() => {
  void store.actions.APPLY_DEVICE_ID_TO_AUDIO_CONTEXT({
    device: store.state.savingSetting.audioOutputDevice,
  });
});

// 소프트웨어 초기화
const { hotkeyManager } = useHotkeyManager();
const isEnginesReady = ref(false);
const isProjectFileLoaded = ref<boolean | "waiting">("waiting");
onMounted(async () => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  await store.actions.INIT_VUEX();

  // 프로젝트 파일의 경로를 가져옵니다
  const projectFilePath = urlParams.get("projectFilePath");

  // 바로 가기 키 설정을 등록합니다
  const hotkeySettings = store.state.hotkeySettings;
  hotkeyManager.load(structuredClone(toRaw(hotkeySettings)));

  // 엔진 초기화 시작

  // 엔진 정보 획득
  await store.actions.GET_ENGINE_INFOS();

  // URL 매개변수에 따라 다중 엔진을 끕니다
  const isMultiEngineOffMode = urlParams.get("isMultiEngineOffMode") === "true";
  void store.actions.SET_IS_MULTI_ENGINE_OFF_MODE(isMultiEngineOffMode);

  //다중 엔진 끄기 모드일 때 기본 엔진만 사용 
  let engineIds: EngineId[];
  if (isMultiEngineOffMode) {
    const main = Object.values(store.state.engineInfos).find(
      (engine) => engine.isDefault,
    );
    if (!main) {
      throw new Error("No default engine found");
    }
    engineIds = [main.uuid];
  } else {
    engineIds = store.state.engineIds;
  }
  await store.actions.LOAD_USER_CHARACTER_ORDER();
  await store.actions.POST_ENGINE_START({
    engineIds,
  });

  // 동기화 사전
  await store.actions.SYNC_ALL_USER_DICT();

  isEnginesReady.value = true;

  // 엔진을 시동한 후 대화 상자를 엽니다
  void store.actions.SET_DIALOG_OPEN({
    isAcceptRetrieveTelemetryDialogOpen:
      store.state.acceptRetrieveTelemetry === "Unconfirmed",
    isAcceptTermsDialogOpen:
      import.meta.env.MODE !== "development" &&
      store.state.acceptTerms !== "Accepted",
  });

  // 프로젝트 파일이 지정된 경우 로드
  if (typeof projectFilePath === "string" && projectFilePath !== "") {
    isProjectFileLoaded.value = await store.actions.LOAD_PROJECT_FILE({
      filePath: projectFilePath,
    });
  } else {
    isProjectFileLoaded.value = false;
  }
});
</script>
