// fast-base64の型定義が壊れているので、ここで型定義を追加する。
// FAST-Base64의 유형 정의가 깨졌으므로 여기에 유형 정의를 추가하십시오.
declare module "fast-base64" {
  export function toBytes(base64: string): Promise<Uint8Array>;
  export function toBase64(bytes: Uint8Array): Promise<string>;
}
