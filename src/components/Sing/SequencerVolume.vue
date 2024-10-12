<template>
  <div ref="canvasContainer" class="canvas-container"></div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import * as PIXI from "pixi.js";
import AsyncLock from "async-lock";
import { useStore } from "@/store";
import {
  VALUE_INDICATING_NO_DATA,
  linearToDecibel,
  secondToTick,
} from "@/sing/domain";
import {
  DECIBEL_VIEW_OFFSET,
  PIXELS_PER_DECIBEL,
  decibelToViewY,
  VolumeData,
  VolumeDataHash,
  calculateVolumeDataHash,
  tickToBaseX,
} from "@/sing/viewHelper";
import { Color, LineStrip } from "@/sing/graphics/lineStrip";
import {
  onMountedOrActivated,
  onUnmountedOrDeactivated,
} from "@/composables/onMountOrActivate";
import { ExhaustiveError } from "@/type/utility";
import { createLogger } from "@/domain/frontend/log";
import { getLast } from "@/sing/utility";
import { getOrThrow } from "@/helpers/mapHelper";

type VolumeLine = {
  readonly color: Color;
  readonly width: number;
  readonly volumeDataMap: Map<VolumeDataHash, VolumeData>;
  readonly lineStripMap: Map<VolumeDataHash, LineStrip>;
};

const props = defineProps<{
  offsetX: number;
  offsetY: number;
  previewVolumeEdit?:
    | { type: "draw"; data: number[]; startFrame: number }
    | { type: "erase"; startFrame: number; frameLength: number };
}>();

const { warn, error } = createLogger("SequencerVolume");
const store = useStore();
const tpqn = computed(() => store.state.tpqn);
const tempos = computed(() => [store.state.tempos[0]]);
const volumeEditData = computed(() => {
  return store.getters.SELECTED_TRACK.volumeEditData;
});
const previewVolumeEdit = computed(() => props.previewVolumeEdit);
const selectedTrackId = computed(() => store.getters.SELECTED_TRACK_ID);
const editFrameRate = computed(() => store.state.editFrameRate);
const singingGuidesInSelectedTrack = computed(() => {
  const singingGuides = [];
  for (const phrase of store.state.phrases.values()) {
    if (phrase.trackId !== selectedTrackId.value) {
      continue;
    }
    if (phrase.singingGuideKey == undefined) {
      continue;
    }
    const singingGuide = getOrThrow(
      store.state.singingGuides,
      phrase.singingGuideKey,
    );
    singingGuides.push(singingGuide);
  }
  return singingGuides;
});

const originalVolumeLine: VolumeLine = {
  color: new Color(184, 212, 127, 255),
  width: 1.2,
  volumeDataMap: new Map(),
  lineStripMap: new Map(),
};
const volumeEditLine: VolumeLine = {
  color: new Color(161, 224, 31, 255),
  width: 2,
  volumeDataMap: new Map(),
  lineStripMap: new Map(),
};

const canvasContainer = ref<HTMLElement | null>(null);
let resizeObserver: ResizeObserver | undefined;
let canvasWidth: number | undefined;
let canvasHeight: number | undefined;

let renderer: PIXI.Renderer | undefined;
let stage: PIXI.Container | undefined;
let requestId: number | undefined;
let renderInNextFrame = false;

const updateLineStrips = (volumeLine: VolumeLine) => {
  if (stage == undefined) {
    throw new Error("stage is undefined.");
  }
  if (canvasWidth == undefined) {
    throw new Error("canvasWidth is undefined.");
  }
  const tpqn = store.state.tpqn;
  const canvasWidthValue = canvasWidth;
  const zoomX = store.state.sequencerZoomX;
  const offsetX = props.offsetX;

  const removedLineStrips: LineStrip[] = [];

  // 無くなったピッチデータを調べて、そのピッチデータに対応するLineStripを削除する
  for (const [key, lineStrip] of volumeLine.lineStripMap) {
    if (!volumeLine.volumeDataMap.has(key)) {
      stage.removeChild(lineStrip.displayObject);
      removedLineStrips.push(lineStrip);
      volumeLine.lineStripMap.delete(key);
    }
  }

  // ピッチデータに対応するLineStripが無かったら作成する
  for (const [key, volumeData] of volumeLine.volumeDataMap) {
    if (volumeLine.lineStripMap.has(key)) {
      continue;
    }
    const dataLength = volumeData.data.length;

    // 再利用できるLineStripがあれば再利用し、なければLineStripを作成する
    let lineStrip = removedLineStrips.pop();
    if (lineStrip != undefined) {
      if (
        !lineStrip.color.equals(volumeLine.color) ||
        lineStrip.width !== volumeLine.width
      ) {
        throw new Error("Color or width does not match.");
      }
      lineStrip.numOfPoints = dataLength;
    } else {
      lineStrip = new LineStrip(dataLength, volumeLine.color, volumeLine.width);
    }
    stage.addChild(lineStrip.displayObject);
    volumeLine.lineStripMap.set(key, lineStrip);
  }

  // 再利用されなかったLineStripは破棄する
  for (const lineStrip of removedLineStrips) {
    lineStrip.destroy();
  }

  // LineStripを更新
  for (const [key, volumeData] of volumeLine.volumeDataMap) {
    const lineStrip = volumeLine.lineStripMap.get(key);
    if (lineStrip == undefined) {
      throw new Error("lineStrip is undefined.");
    }

    // カリングを行う
    const startTicks = volumeData.ticksArray[0];
    const startBaseX = tickToBaseX(startTicks, tpqn);
    const startX = startBaseX * zoomX - offsetX;
    const lastTicks = getLast(volumeData.ticksArray);
    const lastBaseX = tickToBaseX(lastTicks, tpqn);
    const lastX = lastBaseX * zoomX - offsetX;
    if (startX >= canvasWidthValue || lastX <= 0) {
      lineStrip.renderable = false;
      continue;
    }
    lineStrip.renderable = true;

    // ポイントを計算してlineStripに設定＆更新
    for (let i = 0; i < volumeData.data.length; i++) {
      const ticks = volumeData.ticksArray[i];
      const baseX = tickToBaseX(ticks, tpqn);
      const x = baseX * zoomX - offsetX;
      const linear = volumeData.data[i];
      if(Number.isNaN(linear)||linear === undefined){
        continue;
      }
      const db = linearToDecibel(linear);
      const y = decibelToViewY(db);//- ;
      lineStrip.setPoint(i, x, y);
    }
    lineStrip.update();
  }
};

const render = () => {
  if (renderer == undefined) {
    throw new Error("renderer is undefined.");
  }
  if (stage == undefined) {
    throw new Error("stage is undefined.");
  }

  // シンガーが未設定の場合はピッチラインをすべて非表示にして終了
  const singer = store.getters.SELECTED_TRACK.singer;
  if (!singer) {
    for (const lineStrip of originalVolumeLine.lineStripMap.values()) {
      lineStrip.renderable = false;
    }
    for (const lineStrip of volumeEditLine.lineStripMap.values()) {
      lineStrip.renderable = false;
    }
    renderer.render(stage);
    return;
  }

  // ピッチラインのLineStripを更新する
  updateLineStrips(originalVolumeLine);
  updateLineStrips(volumeEditLine);

  renderer.render(stage);
};

const toVolumeData = (framewiseData: number[], frameRate: number): VolumeData => {
  const data = framewiseData;
  const ticksArray: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const ticks = secondToTick(i / frameRate, tempos.value, tpqn.value);
    ticksArray.push(ticks);
  }
  return { ticksArray, data };
};

const splitVolumeData = (volumeData: VolumeData, delimiter: number) => {
  const ticksArray = volumeData.ticksArray;
  const data = volumeData.data;
  const volumeDataArray: VolumeData[] = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i] !== delimiter) {
      if (i === 0 || data[i - 1] === delimiter) {
        volumeDataArray.push({ ticksArray: [], data: [] });
      }
      const lastVolumeData = getLast(volumeDataArray);
      lastVolumeData.ticksArray.push(ticksArray[i]);
      lastVolumeData.data.push(data[i]);
    }
  }
  return volumeDataArray;
};

const setVolumeDataToVolumeLine = async (
  volumeData: VolumeData,
  volumeLine: VolumeLine,
) => {
  const partialVolumeDataArray = splitVolumeData(
    volumeData,
    VALUE_INDICATING_NO_DATA,
  ).filter((value) => value.data.length >= 2);

  volumeLine.volumeDataMap.clear();
  for (const partialVolumeData of partialVolumeDataArray) {
    const hash = await calculateVolumeDataHash(partialVolumeData);
    volumeLine.volumeDataMap.set(hash, partialVolumeData);
  }
};

const generateOriginalVolumeData = () => {
  //const unvoicedPhonemes = UNVOICED_PHONEMES;
  const frameRate = editFrameRate.value; // f0（元のピッチ）は編集フレームレートで表示する

  // 選択中のトラックで使われている歌い方のf0を結合してピッチデータを生成する
  const tempData = [];
  for (const singingGuide of singingGuidesInSelectedTrack.value) {
    // TODO: 補間を行うようにする
    if (singingGuide.frameRate !== frameRate) {
      throw new Error(
        "The frame rate between the singing guide and the edit does not match.",
      );
    }
    const phonemes = singingGuide.query.phonemes;
    if (phonemes.length === 0) {
      throw new Error("phonemes.length is 0.");
    }
    const volume = singingGuide.query.volume;

    // 歌い方の開始フレームと終了フレームを計算する
    const singingGuideFrameLength = volume.length;
    const singingGuideStartFrame = Math.round(
      singingGuide.startTime * frameRate,
    );
    const singingGuideEndFrame =
      singingGuideStartFrame + singingGuideFrameLength;

    // 無声子音区間以外のf0をtempDataにコピーする
    // NOTE: 無声子音区間は音程が無く、f0の値が大きく上下するので表示しない
    if (tempData.length < singingGuideEndFrame) {
      const valuesToPush = new Array(
        singingGuideEndFrame - tempData.length,
      ).fill(VALUE_INDICATING_NO_DATA);
      tempData.push(...valuesToPush);
    }
    const startFrame = Math.max(0, singingGuideStartFrame);
    const endFrame = singingGuideEndFrame;
    for (let i = startFrame; i < endFrame; i++) {
      tempData[i] = volume[i - singingGuideStartFrame];
    }
  }
  return toVolumeData(tempData, frameRate);
};

const generateVolumeEditData = () => {
  const frameRate = editFrameRate.value;

  const tempData = [...volumeEditData.value];
  // プレビュー中のピッチ編集があれば、適用する
  if (previewVolumeEdit.value != undefined) {
    const previewVolumeEditType = previewVolumeEdit.value.type;
    if (previewVolumeEditType === "draw") {
      const previewData = previewVolumeEdit.value.data;
      const previewStartFrame = previewVolumeEdit.value.startFrame;
      const previewEndFrame = previewStartFrame + previewData.length;
      if (tempData.length < previewEndFrame) {
        const valuesToPush = new Array(previewEndFrame - tempData.length).fill(
          VALUE_INDICATING_NO_DATA,
        );
        tempData.push(...valuesToPush);
      }
      for (let i = 0; i < previewData.length; i++) {
        tempData[previewStartFrame + i] = previewData[i];
      }
    } else if (previewVolumeEditType === "erase") {
      const startFrame = previewVolumeEdit.value.startFrame;
      const endFrame = Math.min(
        startFrame + previewVolumeEdit.value.frameLength,
        tempData.length,
      );
      for (let i = startFrame; i < endFrame; i++) {
        tempData[i] = VALUE_INDICATING_NO_DATA;
      }
    } else {
      throw new ExhaustiveError(previewVolumeEditType);
    }
  }
  return toVolumeData(tempData, frameRate);
};

const asyncLock = new AsyncLock({ maxPending: 1 });

watch(
  [singingGuidesInSelectedTrack, tempos, tpqn],
  async () => {
    asyncLock.acquire(
      "originalVolume",
      async () => {
        const originalVolumeData = generateOriginalVolumeData();
        await setVolumeDataToVolumeLine(originalVolumeData, originalVolumeLine);
        renderInNextFrame = true;
      },
      (err) => {
        if (err != undefined) {
          warn(`An error occurred.`, err);
        }
      },
    );
  },
  { immediate: true },
);

watch(
  [volumeEditData, previewVolumeEdit, tempos, tpqn],
  async () => {
    asyncLock.acquire(
      "volumeEdit",
      async () => {
        const volumeEditData = generateVolumeEditData();
        await setVolumeDataToVolumeLine(volumeEditData, volumeEditLine);
        renderInNextFrame = true;
      },
      (err) => {
        if (err != undefined) {
          warn(`An error occurred.`, err);
        }
      },
    );
  },
  { immediate: true },
);

watch(
  () => [
    store.state.sequencerZoomX,
    store.state.sequencerZoomY,
    props.offsetX,
    props.offsetY,
  ],
  () => {
    renderInNextFrame = true;
  },
);

onMountedOrActivated(() => {
  const canvasContainerElement = canvasContainer.value;
  if (!canvasContainerElement) {
    throw new Error("canvasContainerElement is null.");
  }

  canvasWidth = canvasContainerElement.clientWidth;
  canvasHeight = canvasContainerElement.clientHeight;

  const canvasElement = document.createElement("canvas");
  canvasElement.width = canvasWidth;
  canvasElement.height = canvasHeight;
  canvasContainerElement.appendChild(canvasElement);

  renderer = new PIXI.Renderer({
    view: canvasElement,
    backgroundAlpha: 0,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  stage = new PIXI.Container();

  // webGLVersionをチェックする
  // 2未満の場合、ピッチの表示ができないのでエラーとしてロギングする
  const webGLVersion = renderer.context.webGLVersion;
  if (webGLVersion < 2) {
    error(`webGLVersion is less than 2. webGLVersion: ${webGLVersion}`);
  }

  const callback = () => {
    if (renderInNextFrame) {
      render();
      renderInNextFrame = false;
    }
    requestId = window.requestAnimationFrame(callback);
  };
  requestId = window.requestAnimationFrame(callback);
  renderInNextFrame = true;

  resizeObserver = new ResizeObserver(() => {
    if (renderer == undefined) {
      throw new Error("renderer is undefined.");
    }
    const canvasContainerWidth = canvasContainerElement.clientWidth;
    const canvasContainerHeight = canvasContainerElement.clientHeight;

    if (canvasContainerWidth > 0 && canvasContainerHeight > 0) {
      canvasWidth = canvasContainerWidth;
      canvasHeight = canvasContainerHeight;
      renderer.resize(canvasWidth, canvasHeight);
      renderInNextFrame = true;
    }
  });
  resizeObserver.observe(canvasContainerElement);
});

onUnmountedOrDeactivated(() => {
  if (requestId != undefined) {
    window.cancelAnimationFrame(requestId);
  }
  stage?.destroy();
  originalVolumeLine.lineStripMap.forEach((value) => value.destroy());
  originalVolumeLine.lineStripMap.clear();
  volumeEditLine.lineStripMap.forEach((value) => value.destroy());
  volumeEditLine.lineStripMap.clear();
  renderer?.destroy(true);
  resizeObserver?.disconnect();
});
</script>

<style scoped lang="scss">
@use "@/styles/variables" as vars;
@use "@/styles/colors" as colors;

.canvas-container {
  overflow: hidden;
  z-index: 0;
  pointer-events: none;

  contain: strict; // canvasのサイズが変わるのを無視する
}
</style>
