<template>
  <AcceptDialog
    v-model="modelValueComputed"
    title="이용 약관에 관한 고지"
    rejectLabel="동의하지 않고 종료합니다"
    acceptLabel="동의하고 사용을 시작합니다"
    heading="서비스 약관"
    :terms
    @reject="handler(false)"
    @accept="handler(true)"
  >
    <p>
      많은 사람들이 안심하고 VoiceVox를 사용할 수 있도록 이용약관에 동의해 주십시오.
    </p>
  </AcceptDialog>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import AcceptDialog from "./AcceptDialog.vue";
import { useStore } from "@/store";

const props = defineProps<{
  modelValue: boolean;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const store = useStore();

const modelValueComputed = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const handler = (acceptTerms: boolean) => {
  void store.actions.SET_ACCEPT_TERMS({
    acceptTerms: acceptTerms ? "Accepted" : "Rejected",
  });
  if (!acceptTerms) {
    void store.actions.CHECK_EDITED_AND_NOT_SAVE({
      closeOrReload: "close",
    });
  }

  modelValueComputed.value = false;
};

const terms = ref("");
onMounted(async () => {
  terms.value = await store.actions.GET_POLICY_TEXT();
});
</script>
