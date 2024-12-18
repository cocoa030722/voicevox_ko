// immerの内部APIの型定義。exportsで指定されていないファイルを参照するために用意したもの。
// Immer의 내부 API 유형 정의. 내보내기에 지정되지 않은 파일에 대해 참조할 준비가 된 것입니다.
declare module "immer/src/plugins/patches" {
  export function enablePatches(): void;
}
declare module "immer/src/plugins/mapset" {
  export function enableMapSet(): void;
}
declare module "immer/src/utils/plugins" {
  import { Patch } from "immer";
  export function getPlugin(name: "Patches"): {
    applyPatches_: (state: unknown, patches: Patch[]) => void;
  };
}
