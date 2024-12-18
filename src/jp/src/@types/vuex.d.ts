// vuexのexportsにtypeがないのを回避するWorkaround。
// Vuex의 내보내기 유형을 피하기 위한 해결 방법입니다
// https://github.com/vuejs/vuex/issues/2213#issuecomment-1592267216
declare module "vuex" {
  export * from "vuex/types/index.d.ts";
  export * from "vuex/types/helpers.d.ts";
  export * from "vuex/types/logger.d.ts";
  export * from "vuex/types/vue.d.ts";
}
