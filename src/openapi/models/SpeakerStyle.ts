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

import { exists, mapValues } from "../runtime";
/**
 * 話者のスタイル情報
 * @export
 * @interface SpeakerStyle
 */
export interface SpeakerStyle {
  /**
   *
   * @type {string}
   * @memberof SpeakerStyle
   */
  name: string;
  /**
   *
   * @type {number}
   * @memberof SpeakerStyle
   */
  id: number;
  /**
   *
   * @type {string}
   * @memberof SpeakerStyle
   */
  type?: SpeakerStyleTypeEnum;
}

/**
 * @export
 */
export const SpeakerStyleTypeEnum = {
  Talk: "talk",
  Humming: "humming",
  SingTeacher: "sing_teacher",
  Sing: "sing",
} as const;
export type SpeakerStyleTypeEnum =
  typeof SpeakerStyleTypeEnum[keyof typeof SpeakerStyleTypeEnum];

/**
 * Check if a given object implements the SpeakerStyle interface.
 */
export function instanceOfSpeakerStyle(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && "name" in value;
  isInstance = isInstance && "id" in value;

  return isInstance;
}

export function SpeakerStyleFromJSON(json: any): SpeakerStyle {
  return SpeakerStyleFromJSONTyped(json, false);
}

export function SpeakerStyleFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): SpeakerStyle {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    name: json["name"],
    id: json["id"],
    type: !exists(json, "type") ? undefined : json["type"],
  };
}

export function SpeakerStyleToJSON(value?: SpeakerStyle | null): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    name: value.name,
    id: value.id,
    type: value.type,
  };
}
