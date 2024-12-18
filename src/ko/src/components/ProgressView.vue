<template>
  <div v-if="isShowProgress" class="progress">
    <div>
      <QCircularProgress
        v-if="isDeterminate"
        showValue
        :value="progress"
        :min="0"
        :max="1"
        rounded
        font-size="12px"
        color="primary"
        size="xl"
        :thickness="0.3"
      >
        {{ formattedProgress }}%
      </QCircularProgress>
      <QCircularProgress
        v-if="!isDeterminate"
        indeterminate
        color="primary"
        rounded
        :thickness="0.3"
        size="xl"
      />
      <div class="q-mt-md">생성중입니다...</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useStore } from "@/store";

const store = useStore();

const progress = computed(() => store.getters.PROGRESS);
const isShowProgress = ref<boolean>(false);
const isDeterminate = ref<boolean>(false);

let timeoutId: ReturnType<typeof setTimeout>;

const deferredProgressStart = () => {
  // 표시하기 전에 3초를 기다립니다
  timeoutId = setTimeout(() => {
    isShowProgress.value = true;
  }, 3000);
};

watch(progress, (newValue, oldValue) => {
  if (newValue === -1) {
    // → 숨겨진
    clearTimeout(timeoutId);
    isShowProgress.value = false;
  } else if (oldValue === -1 && newValue <= 1) {
    // 숨기기 → 처리
    deferredProgressStart();
    isDeterminate.value = false;
  } else if (oldValue !== -1 && 0 < newValue) {
    // 처리 → 처리(0% 이상)
    // 0 < value <= 1 동안에만 진행률을 %로 표시
    isDeterminate.value = true;
  }
});

onUnmounted(() => clearTimeout(timeoutId));

const formattedProgress = computed(() =>
  (store.getters.PROGRESS * 100).toFixed(),
);
</script>

<style lang="scss" scoped>
@use "@/styles/colors" as colors;

.progress {
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
    width: 200px;
    border-radius: 6px;
    padding: 14px 48px;
  }
}
</style>
