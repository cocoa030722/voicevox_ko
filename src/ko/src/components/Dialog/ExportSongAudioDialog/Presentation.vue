<template>
  <QDialog ref="dialogRef" v-model="modelValue">
    <QCard class="q-py-sm q-px-md dialog-card">
      <QCardSection>
        <div class="text-h5">오디오 쓰기</div>
      </QCardSection>

      <QSeparator />

      <QCardSection>
        <BaseCell
          title="내보내기 방법"
          description="모든 트랙을 함께 내보내고 하나의 오디오 파일을 내보낼지, 아니면 각 트랙에 대한 오디오 파일을 내보낼지 선택할 수 있습니다."
        >
          <QBtnToggle
            v-model="exportTarget"
            :options="exportTargets"
            padding="xs md"
            unelevated
            color="surface"
            textColor="display"
            toggleColor="primary"
            toggleTextColor="display-on-primary"
            dense
          />
        </BaseCell>
        <BaseCell
          title="모노로 내보내기"
          description="켜져 있으면 PAN이 비활성화되고 한 채널에서 내보내집니다."
        >
          <QToggle v-model="isMono" />
        </BaseCell>
        <BaseCell
          title="음성 샘플링 속도"
          description="음성의 샘플링 속도를 변경할 수 있습니다。"
        >
          <QSelect
            v-model="samplingRate"
            dense
            name="samplingRate"
            :options="samplingRateOptions"
            :optionLabel="renderSamplingRateLabel"
          >
          </QSelect>
        </BaseCell>
        <BaseCell
          title="볼륨을 제한합니다"
          description="설정할 때는 음량이 0dB를 초과하지 않도록 오디오를 조정하십시오."
        >
          <QToggle v-model="withLimiter" />
        </BaseCell>
        <BaseCell
          title="적용할 매개변수를 추적합니다"
          description="내보낼 때 적용할 PAN, 볼륨 또는 음소거의 매개변수를 선택할 수 있습니다."
        >
          <QOptionGroup
            v-model="withTrackParameters"
            type="checkbox"
            inline
            :options="trackParameterOptions"
          />
        </BaseCell>
      </QCardSection>

      <QSeparator />

      <QCardActions>
        <QSpace />
        <QBtn
          unelevated
          align="right"
          label="취소"
          color="toolbar-button"
          textColor="toolbar-button-display"
          class="text-no-wrap text-bold q-mr-sm"
          @click="handleCancel"
        />
        <QBtn
          unelevated
          align="right"
          label="쓰다"
          color="toolbar-button"
          textColor="toolbar-button-display"
          class="text-no-wrap text-bold q-mr-sm"
          @click="handleExportTrack"
        />
      </QCardActions>
    </QCard>
  </QDialog>
</template>

<script setup lang="ts">
// NOTE: 이전 설정을 인수하려면 다른 대화 상자의 설정과 같은 initializeValues을 수행하지 마십시오.
import { ref, computed } from "vue";
import { useDialogPluginComponent } from "quasar";
import BaseCell from "./BaseCell.vue";
import { SongExportSetting, TrackParameters } from "@/store/type";

export type ExportTarget = "master" | "stem";
const { dialogRef, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const modelValue = defineModel<boolean>();
const emit = defineEmits<{
  /** 오디오를 내보낼 때 호출됩니다 */
  exportAudio: [exportTarget: ExportTarget, setting: SongExportSetting];
}>();

// 내보내기 방법을 선택합니다
const exportTargets = [
  {
    label: "まとめる（ミックス）",
    value: "master",
  },
  {
    label: "トラック別",
    value: "stem",
  },
];
const exportTarget = ref<ExportTarget>("master");

// モノラル
const isMono = ref<boolean>(false);

// 샘플 속도
const samplingRate = ref<number>(48000);
const samplingRateOptions = [24000, 44100, 48000, 88200, 96000];
const renderSamplingRateLabel = (rate: number) => `${rate} Hz`;

// リミッター
const withLimiter = ref<boolean>(true);

// パン・ボリューム・ミュート
const withTrackParametersInner = ref<(keyof TrackParameters)[]>([
  "pan",
  "gain",
  "soloAndMute",
]);
const withTrackParameters = computed({
  get: () =>
    isMono.value
      ? withTrackParametersInner.value.filter((v) => v !== "pan")
      : withTrackParametersInner.value,
  set: (value: (keyof TrackParameters)[]) => {
    withTrackParametersInner.value = value;
  },
});
const trackParameterOptions = computed(() => [
  {
    label: "パン",
    value: "pan",
    disable: isMono.value,
  },
  {
    label: "ボリューム",
    value: "gain",
  },
  {
    label: "ソロ・ミュート",
    value: "soloAndMute",
  },
]);

const handleExportTrack = () => {
  onDialogOK();
  emit("exportAudio", exportTarget.value, {
    isMono: isMono.value,
    sampleRate: samplingRate.value,
    withLimiter: withLimiter.value,
    withTrackParameters: {
      pan: withTrackParameters.value.includes("pan"),
      gain: withTrackParameters.value.includes("gain"),
      soloAndMute: withTrackParameters.value.includes("soloAndMute"),
    },
  });
};

// キャンセルボタンクリック時
const handleCancel = () => {
  onDialogCancel();
  modelValue.value = false;
};
</script>

<style scoped lang="scss">
.dialog-card {
  width: 700px;
  max-width: 80vw;
}

.scrollable-area {
  overflow-y: auto;
  max-height: calc(100vh - 100px - 295px);
}
</style>
