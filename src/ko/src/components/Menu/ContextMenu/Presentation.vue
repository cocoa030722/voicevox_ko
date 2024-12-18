<template>
  <QMenu
    ref="contextMenu"
    touchPosition
    contextMenu
    :noFocus
    transitionShow="none"
    transitionHide="none"
  >
    <QList dense>
      <QItem v-if="header" dense class="bg-background">
        <QItemSection class="text-weight-bold">{{ header }}</QItemSection>
      </QItem>
      <MenuItem
        v-for="(menu, index) of menudata"
        :key="index + 1"
        :menudata="menu"
        :disable="
          (menu.type !== 'separator' && menu.disabled) ||
          (uiLocked && menu.type !== 'separator' && menu.disableWhenUiLocked)
        "
      >
      </MenuItem>
    </QList>
  </QMenu>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { QMenu } from "quasar";
import MenuItem from "../MenuItem.vue";
import { MenuItemButton, MenuItemSeparator } from "../type";

defineProps<{
  header?: string;
  menudata: ContextMenuItemData[];

  uiLocked?: boolean;
}>();
defineExpose({
  show: (event?: MouseEvent | undefined) => {
    contextMenu.value?.show(event);
  },
  hide: () => {
    contextMenu.value?.hide();
  },
});

const contextMenu = ref<QMenu>();
/**
 * 컨텍스트 메뉴가 포커스를 끄는지 여부를 제어합니다.
 * 일반적으로 접근성 고려 사항을 위해 초점이 이동되지만 입력 요소를 사용하면 문자 선택이 숨겨집니다.
 * 이 동작이 불필요하다고 생각하는 사용자를 박탈하지 마십시오.
 */
const noFocus = ref(false);

const buttonCapturer = (event: Event) => {
  if (event instanceof PointerEvent) {
    // 키보드에서 열면 접근성에 초점이 맞춰집니다(탭 키를 사용한 작업).
    // 마우스 등에서 열면 선택을 피하기 위해 초점을 맞추지 않습니다.
    noFocus.value = event.button !== -1;
  }
};
onMounted(() => {
  parent.addEventListener("contextmenu", buttonCapturer, { capture: true });
});
onUnmounted(() => {
  parent.removeEventListener("contextmenu", buttonCapturer);
});

export type ContextMenuItemData = MenuItemSeparator | MenuItemButton;
</script>
