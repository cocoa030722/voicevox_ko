<!-- 두 개 이상의 버튼 중 하나를 선택합니다 -->

<template>
  <BaseRowCard :title :description :disabled="disable">
    <BaseToggleGroup v-model="model" type="single" :disabled="disable">
      <template v-for="option in options" :key="option.label">
        <BaseTooltip
          v-if="option.description != null"
          :label="option.description"
        >
          <BaseToggleGroupItem :label="option.label" :value="option.value" />
        </BaseTooltip>
        <BaseToggleGroupItem
          v-else
          :label="option.label"
          :value="option.value"
        />
      </template>
    </BaseToggleGroup>
  </BaseRowCard>
</template>

<script setup lang="ts" generic="T extends string">
import BaseRowCard from "@/components/Base/BaseRowCard.vue";
import BaseToggleGroup from "@/components/Base/BaseToggleGroup.vue";
import BaseToggleGroupItem from "@/components/Base/BaseToggleGroupItem.vue";
import BaseTooltip from "@/components/Base/BaseTooltip.vue";

defineProps<{
  title: string;
  description: string;
  options: { label: string; value: T; description?: string }[];
  disable?: boolean;
}>();

const model = defineModel<string | string[]>({ required: true });
</script>
