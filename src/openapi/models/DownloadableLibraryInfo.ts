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
import type { LibrarySpeaker } from "./LibrarySpeaker";
import {
  LibrarySpeakerFromJSON,
  LibrarySpeakerFromJSONTyped,
  LibrarySpeakerToJSON,
} from "./LibrarySpeaker";

/**
 * ダウンロード可能な音声ライブラリの情報
 * @export
 * @interface DownloadableLibraryInfo
 */
export interface DownloadableLibraryInfo {
  /**
   *
   * @type {string}
   * @memberof DownloadableLibraryInfo
   */
  name: string;
  /**
   *
   * @type {string}
   * @memberof DownloadableLibraryInfo
   */
  uuid: string;
  /**
   *
   * @type {string}
   * @memberof DownloadableLibraryInfo
   */
  version: string;
  /**
   *
   * @type {string}
   * @memberof DownloadableLibraryInfo
   */
  downloadUrl: string;
  /**
   *
   * @type {number}
   * @memberof DownloadableLibraryInfo
   */
  bytes: number;
  /**
   *
   * @type {Array<LibrarySpeaker>}
   * @memberof DownloadableLibraryInfo
   */
  speakers: Array<LibrarySpeaker>;
}

/**
 * Check if a given object implements the DownloadableLibraryInfo interface.
 */
export function instanceOfDownloadableLibraryInfo(value: object): boolean {
  let isInstance = true;
  isInstance = isInstance && "name" in value;
  isInstance = isInstance && "uuid" in value;
  isInstance = isInstance && "version" in value;
  isInstance = isInstance && "downloadUrl" in value;
  isInstance = isInstance && "bytes" in value;
  isInstance = isInstance && "speakers" in value;

  return isInstance;
}

export function DownloadableLibraryInfoFromJSON(
  json: any
): DownloadableLibraryInfo {
  return DownloadableLibraryInfoFromJSONTyped(json, false);
}

export function DownloadableLibraryInfoFromJSONTyped(
  json: any,
  ignoreDiscriminator: boolean
): DownloadableLibraryInfo {
  if (json === undefined || json === null) {
    return json;
  }
  return {
    name: json["name"],
    uuid: json["uuid"],
    version: json["version"],
    downloadUrl: json["download_url"],
    bytes: json["bytes"],
    speakers: (json["speakers"] as Array<any>).map(LibrarySpeakerFromJSON),
  };
}

export function DownloadableLibraryInfoToJSON(
  value?: DownloadableLibraryInfo | null
): any {
  if (value === undefined) {
    return undefined;
  }
  if (value === null) {
    return null;
  }
  return {
    name: value.name,
    uuid: value.uuid,
    version: value.version,
    download_url: value.downloadUrl,
    bytes: value.bytes,
    speakers: (value.speakers as Array<any>).map(LibrarySpeakerToJSON),
  };
}
