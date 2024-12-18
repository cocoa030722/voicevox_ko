<template>
  <AcceptDialog
    v-model="modelValueComputed"
    title="사용성 향상을 요청합니다"
    rejectLabel="부정"
    acceptLabel="허가"
    heading="개인정보 정책"
    :terms="privacyPolicy"
    @reject="handler(false)"
    @accept="handler(true)"
  >
    <p>VoiceVox는 소프트웨어를 더 쉽게 사용할 수 있도록 개발되었습니다.</p>
    <p>
      버튼의 위치 변경과 같은 정책을 결정할 때 각 UI의 사용률과 같은 정보가 중요합니다. 괜찮으시다면 소프트웨어 사용 상태에 대한 데이터를 수집하는 데 도움을 주세요.
    </p>
    <p>
      （입력한 텍스트 또는 오디오 데이터에 대한 정보를 수집하지 않습니다.）
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

const handler = (acceptRetrieveTelemetry: boolean) => {
  void store.actions.SET_ACCEPT_RETRIEVE_TELEMETRY({
    acceptRetrieveTelemetry: acceptRetrieveTelemetry ? "Accepted" : "Refused",
  });

  modelValueComputed.value = false;
};

const privacyPolicy = ref("");
onMounted(async () => {
  privacyPolicy.value = await store.actions.GET_PRIVACY_POLICY_TEXT();
});
</script>
