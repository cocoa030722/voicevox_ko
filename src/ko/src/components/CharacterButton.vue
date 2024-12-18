<template>
  <QBtn
    ref="buttonRef"
    flat
    class="q-pa-none character-button"
    :disable="uiLocked"
    :class="{ opaque: loading }"
    aria-haspopup="menu"
  >
    <!-- q-img인 경우 비활성화 시점에 깜박입니다. -->
    <div class="icon-container">
      <img
        v-if="selectedStyleInfo != undefined"
        class="q-pa-none q-ma-none"
        :src="selectedStyleInfo.iconPath"
        :alt="selectedVoiceInfoText"
      />
      <QAvatar v-else-if="!emptiable" rounded size="2rem" color="primary"
        ><span color="text-display-on-primary">?</span></QAvatar
      >
    </div>
    <div v-if="loading" class="loading">
      <QSpinner color="primary" size="1.6rem" :thickness="7" />
    </div>
    <QMenu
      class="character-menu"
      transitionShow="none"
      transitionHide="none"
      :max-height="maxMenuHeight"
      @beforeShow="updateMenuHeight"
    >
      <QList style="min-width: max-content" class="character-item-container">
        <QItem
          v-if="selectedStyleInfo == undefined && !emptiable"
          class="warning-item row no-wrap items-center"
        >
          <span class="text-warning vertical-middle"
            >유효한 스타일이 선택되지 않았습니다</span
          >
        </QItem>
        <QItem
          v-if="characterInfos.length === 0"
          class="warning-item row no-wrap items-center"
        >
          <span class="text-warning vertical-middle"
            >선택 가능한 스타일이 없습니다</span
          >
        </QItem>
        <QItem v-if="emptiable" class="to-unselect-item q-pa-none">
          <QBtn
            v-close-popup
            flat
            noCaps
            class="full-width"
            :class="selectedCharacter == undefined && 'selected-background'"
            @click="$emit('update:selectedVoice', undefined)"
          >
            <span>선택을 취소합니다</span>
          </QBtn>
        </QItem>
        <QItem
          v-for="(characterInfo, characterIndex) in characterInfos"
          :key="characterIndex"
          class="q-pa-none"
          :class="isSelectedItem(characterInfo) && 'selected-character-item'"
        >
          <QBtnGroup flat class="col full-width">
            <QBtn
              v-close-popup
              flat
              noCaps
              class="col-grow"
              @click="onSelectSpeaker(characterInfo.metas.speakerUuid)"
              @mouseover="reassignSubMenuOpen(-1)"
              @mouseleave="reassignSubMenuOpen.cancel()"
            >
              <QAvatar rounded size="2rem" class="q-mr-md">
                <QImg
                  v-if="characterInfo"
                  noSpinner
                  noTransition
                  :ratio="1"
                  :src="
                    getDefaultStyleWrapper(characterInfo.metas.speakerUuid)
                      .iconPath
                  "
                />
                <QAvatar
                  v-if="showEngineInfo && characterInfo.metas.styles.length < 2"
                  class="engine-icon"
                  rounded
                >
                  <img
                    :src="
                      engineIcons[
                        getDefaultStyleWrapper(characterInfo.metas.speakerUuid)
                          .engineId
                      ]
                    "
                  />
                </QAvatar>
              </QAvatar>
              <div>{{ characterInfo.metas.speakerName }}</div>
            </QBtn>
            <!-- 두 개 이상의 스타일로만 스타일 선택 버튼 표시-->
            <template v-if="characterInfo.metas.styles.length >= 2">
              <QSeparator vertical />

              <div
                class="flex items-center q-px-sm q-py-none cursor-pointer"
                :class="
                  subMenuOpenFlags[characterIndex] && 'selected-background'
                "
                role="application"
                :aria-label="`${characterInfo.metas.speakerName}의 스타일、마우스 오버 또는 오른쪽 화살표 키를 눌러 스타일 선택을 볼 수 있습니다.`"
                tabindex="0"
                @mouseover="reassignSubMenuOpen(characterIndex)"
                @mouseleave="reassignSubMenuOpen.cancel()"
                @keyup.right="reassignSubMenuOpen(characterIndex)"
              >
                <QIcon name="keyboard_arrow_right" color="grey-6" size="sm" />
                <QMenu
                  v-model="subMenuOpenFlags[characterIndex]"
                  noParentEvent
                  anchor="top end"
                  self="top start"
                  transitionShow="none"
                  transitionHide="none"
                  class="character-menu"
                >
                  <QList style="min-width: max-content">
                    <QItem
                      v-for="(style, styleIndex) in characterInfo.metas.styles"
                      :key="styleIndex"
                      v-close-popup
                      clickable
                      activeClass="selected-style-item"
                      :active="
                        selectedVoice != undefined &&
                        style.styleId === selectedVoice.styleId
                      "
                      :aria-pressed="
                        selectedVoice != undefined &&
                        style.styleId === selectedVoice.styleId
                      "
                      role="button"
                      @click="
                        $emit('update:selectedVoice', {
                          engineId: style.engineId,
                          speakerId: characterInfo.metas.speakerUuid,
                          styleId: style.styleId,
                        })
                      "
                    >
                      <QAvatar rounded size="2rem" class="q-mr-md">
                        <QImg
                          noSpinner
                          noTransition
                          :ratio="1"
                          :src="characterInfo.metas.styles[styleIndex].iconPath"
                        />
                        <QAvatar
                          v-if="showEngineInfo"
                          rounded
                          class="engine-icon"
                        >
                          <img
                            :src="
                              engineIcons[
                                characterInfo.metas.styles[styleIndex].engineId
                              ]
                            "
                          />
                        </QAvatar>
                      </QAvatar>
                      <QItemSection v-if="style.styleName"
                        >{{ characterInfo.metas.speakerName }}（{{
                          style.styleName
                        }}）</QItemSection
                      >
                      <QItemSection v-else>{{
                        characterInfo.metas.speakerName
                      }}</QItemSection>
                    </QItem>
                  </QList>
                </QMenu>
              </div>
            </template>
          </QBtnGroup>
        </QItem>
      </QList>
    </QMenu>
  </QBtn>
</template>

<script setup lang="ts">
import { debounce, QBtn } from "quasar";
import { computed, Ref, ref } from "vue";
import { useStore } from "@/store";
import { CharacterInfo, SpeakerId, Voice } from "@/type/preload";
import { formatCharacterStyleName } from "@/store/utility";
import { getDefaultStyle } from "@/domain/talk";
import { useEngineIcons } from "@/composables/useEngineIcons";

const props = withDefaults(
  defineProps<{
    characterInfos: CharacterInfo[];
    loading?: boolean;
    selectedVoice: Voice | undefined;
    showEngineInfo?: boolean;
    emptiable?: boolean;
    uiLocked: boolean;
  }>(),
  {
    loading: false,
    showEngineInfo: false,
    emptiable: false,
  },
);

const emit = defineEmits({
  "update:selectedVoice": (selectedVoice: Voice | undefined) => {
    return (
      selectedVoice == undefined ||
      (typeof selectedVoice.engineId === "string" &&
        typeof selectedVoice.speakerId === "string" &&
        typeof selectedVoice.styleId === "number")
    );
  },
});

const store = useStore();

const selectedCharacter = computed(() => {
  const selectedVoice = props.selectedVoice;
  if (selectedVoice == undefined) return undefined;
  const character = props.characterInfos.find(
    (characterInfo) =>
      characterInfo.metas.speakerUuid === selectedVoice?.speakerId &&
      characterInfo.metas.styles.some(
        (style) =>
          style.engineId === selectedVoice.engineId &&
          style.styleId === selectedVoice.styleId,
      ),
  );
  return character;
});

const selectedVoiceInfoText = computed(() => {
  if (!selectedCharacter.value) {
    return "캐릭터가 선택되지 않았습니다";
  }

  const speakerName = selectedCharacter.value.metas.speakerName;
  if (!selectedStyleInfo.value) {
    return speakerName;
  }

  const styleName = selectedStyleInfo.value.styleName;
  return formatCharacterStyleName(speakerName, styleName);
});

const isSelectedItem = (characterInfo: CharacterInfo) =>
  selectedCharacter.value != undefined &&
  characterInfo.metas.speakerUuid ===
    selectedCharacter.value?.metas.speakerUuid;

const selectedStyleInfo = computed(() => {
  const selectedVoice = props.selectedVoice;
  const style = selectedCharacter.value?.metas.styles.find(
    (style) =>
      style.engineId === selectedVoice?.engineId &&
      style.styleId === selectedVoice.styleId,
  );
  return style;
});

const engineIcons = useEngineIcons(() => store.state.engineManifests);

const getDefaultStyleWrapper = (speakerUuid: SpeakerId) =>
  getDefaultStyle(
    speakerUuid,
    props.characterInfos,
    store.state.defaultStyleIds,
  );

const onSelectSpeaker = (speakerUuid: SpeakerId) => {
  const style = getDefaultStyleWrapper(speakerUuid);
  emit("update:selectedVoice", {
    engineId: style.engineId,
    speakerId: speakerUuid,
    styleId: style.styleId,
  });
};

const subMenuOpenFlags = ref(
  [...Array(props.characterInfos.length)].map(() => false),
);

const reassignSubMenuOpen = debounce((idx: number) => {
  if (subMenuOpenFlags.value[idx]) return;
  const arr = [...Array(props.characterInfos.length)].map(() => false);
  arr[idx] = true;
  subMenuOpenFlags.value = arr;
}, 100);

// 메뉴가 아래로 확장되도록 높이를 제한하십시오.
const buttonRef: Ref<InstanceType<typeof QBtn> | undefined> = ref();
const heightLimit = "65vh"; // QMenu의 기본값
const maxMenuHeight = ref(heightLimit);
const updateMenuHeight = () => {
  if (buttonRef.value == undefined)
    throw new Error("buttonRef.value == undefined");
  const el = buttonRef.value.$el;
  if (!(el instanceof Element)) throw new Error("!(el instanceof Element)");
  const buttonRect = el.getBoundingClientRect();
  // QMenu는 확장 방향에 공간이 충분하지 않으면 확장 방향을 자동으로 변경하므로 최대 높이로 제한합니다.
  // 버튼은 오디오 세부 정보에서 내려오지 않으므로 최소 높이를 185px의 여백으로 170px로 설정하십시오.
  // PX에서 지정한 경우 창 크기 조정을 따를 수 없으므로 메뉴의 높이는 창 높이의 96% 버튼 하단에 있는 좌표에 의해 결정됩니다.
  maxMenuHeight.value = `max(170px, min(${heightLimit}, calc(96vh - ${buttonRect.bottom}px)))`;
};
</script>

<style scoped lang="scss">
@use "@/styles/colors" as colors;

.character-button {
  border: solid 1px;
  border-color: colors.$primary;
  font-size: 0;
  height: fit-content;

  background: colors.$background;

  .icon-container {
    height: 2rem;
    width: 2rem;

    img {
      max-height: 100%;
      max-width: 100%;
      object-fit: scale-down;
    }
  }

  .loading {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    background-color: rgba(colors.$background-rgb, 0.74);
    display: grid;
    justify-content: center;
    align-content: center;

    svg {
      filter: drop-shadow(0 0 1px colors.$background);
    }
  }
}

.opaque {
  opacity: 1 !important;
}

.character-menu {
  .character-item-container {
    display: flex;
    flex-direction: column;
  }

  .q-item {
    color: colors.$display;
  }

  .q-btn-group {
    > .q-btn:first-child > :deep(.q-btn__content) {
      justify-content: flex-start;
    }

    > div:last-child:hover {
      background-color: rgba(colors.$primary-rgb, 0.1);
    }
  }

  .warning-item {
    order: -3;
  }
  .to-unselect-item {
    order: -2;
  }

  .selected-character-item,
  .selected-style-item,
  .selected-background {
    background-color: rgba(colors.$primary-rgb, 0.2);
  }

  .engine-icon {
    position: absolute;
    width: 13px;
    height: 13px;
    bottom: -6px;
    right: -6px;
  }
}
</style>
