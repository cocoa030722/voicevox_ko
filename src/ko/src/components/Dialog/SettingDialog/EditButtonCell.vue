<!-- 현재 값 + 편집 버튼 설정 -->

<template>
  <BaseRowCard :title :description>
    {{ props.currentValue }}
    <BaseButton label="編集する" icon="edit" @click="emit('buttonClick')" />
  </BaseRowCard>
</template>

<script setup lang="ts">
import BaseRowCard from "@/components/Base/BaseRowCard.vue";
import BaseButton from "@/components/Base/BaseButton.vue";

const props = defineProps<{
  title: string;
  description: string;
  currentValue: string;
  disable?: boolean;
}>();

const emit = defineEmits<{
  buttonClick: [];
}>();
</script>
