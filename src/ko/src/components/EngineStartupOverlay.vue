<template>
  <!-- TODO: 여러 엔진 지원 -->
  <!-- TODO: allEngineState가 "ERROR" 일 때 오류를 일으킨 엔진을 검색하고 토스트로 안내 -->
  <div v-if="allEngineState === 'FAILED_STARTING'" class="waiting-engine">
    <div>엔진 시동 실패. 엔진을 다시 시작하십시오.</div>
  </div>
  <div
    v-else-if="
      !props.isCompletedInitialStartup || allEngineState === 'STARTING'
    "
    class="waiting-engine"
  >
    <div>
      <QSpinner color="primary" size="2.5rem" />
      <div class="q-mt-xs">
        {{
          allEngineState === "STARTING"
            ? "엔진 시동 중・・・"
            : "데이터 준비 중・・・"
        }}
      </div>

      <template v-if="isEngineWaitingLong">
        <QSeparator spaced />
        엔진을 시동하는 데 시간이 걸립니다.<br />
        <QBtn
          v-if="isMultipleEngine"
          outline
          :disable="reloadingLocked"
          @click="reloadAppWithMultiEngineOffMode"
        >
          다중 엔진을 끄고 다시 로드합니다</QBtn
        >
        <QBtn v-else outline @click="openQa">Q&A 보기</QBtn>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStore } from "@/store";
import { EngineState } from "@/store/type";

const store = useStore();
const props = defineProps<{
  isCompletedInitialStartup: boolean;
}>();

const reloadingLocked = computed(() => store.state.reloadingLock);
const isMultipleEngine = computed(() => store.state.engineIds.length > 1);

// 엔진 대기
// TODO: UI에서 개별 엔진의 상태를 확인할 수 있습니다.
const allEngineState = computed(() => {
  const engineStates = store.state.engineStates;

  let lastEngineState: EngineState | undefined = undefined;

  // 등록된 모든 엔진의 상태를 확인하십시오
  for (const engineId of store.state.engineIds) {
    const engineState: EngineState | undefined = engineStates[engineId];
    if (engineState == undefined)
      throw new Error(`No such engineState set: engineId == ${engineId}`);

    // FIXME: 연결을 성공적으로 테스트하지 않은 엔진이 하나라도 있으면 잠정적으로 시작됩니다.
    if (engineState === "STARTING") {
      return engineState;
    }

    lastEngineState = engineState;
  }

  return lastEngineState; // FIXME: 일시적으로 한 엔진의 상태를 반환합니다
});

const isEngineWaitingLong = ref<boolean>(false);
let engineTimer: number | undefined = undefined;
watch(allEngineState, (newEngineState) => {
  if (engineTimer != undefined) {
    clearTimeout(engineTimer);
    engineTimer = undefined;
  }
  if (newEngineState === "STARTING") {
    isEngineWaitingLong.value = false;
    engineTimer = window.setTimeout(() => {
      isEngineWaitingLong.value = true;
    }, 30000);
  } else {
    isEngineWaitingLong.value = false;
  }
});

const reloadAppWithMultiEngineOffMode = () => {
  void store.actions.CHECK_EDITED_AND_NOT_SAVE({
    closeOrReload: "reload",
    isMultiEngineOffMode: true,
  });
};

const openQa = () => {
  window.open("https://voicevox.hiroshiba.jp/qa/", "_blank");
};
</script>

<style scoped lang="scss">
@use "@/styles/colors" as colors;
@use "@/styles/variables" as vars;

.waiting-engine {
  background-color: rgba(colors.$display-rgb, 0.15);
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
  > div {
    color: colors.$display;
    background: colors.$surface;
    border-radius: 6px;
    padding: 14px;
  }
}
</style>
