/* tslint:disable */
/* eslint-disable */
/**
 * VOICEVOX Engine
 * VOICEVOXの音声合成エンジンです。
 *
 * The version of the OpenAPI document: latest
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * CORSの許可モード
 * @export
 */
export const CorsPolicyMode = {
  All: "all",
  Localapps: "localapps",
} as const;
export type CorsPolicyMode = typeof CorsPolicyMode[keyof typeof CorsPolicyMode];

export function CorsPolicyModeFromJSON(json: any): CorsPolicyMode {
  return CorsPolicyModeFromJSONTyped(json, false);
}

export function CorsPolicyModeFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): CorsPolicyMode {
  return json as CorsPolicyMode;
}

export function CorsPolicyModeToJSON(value?: CorsPolicyMode | null): any {
  return value as any;
}
