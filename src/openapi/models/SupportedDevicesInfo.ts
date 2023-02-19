/* tslint:disable */
/* eslint-disable */
/**
 * VOICEVOX Engine
 * VOICEVOXの音声合成エンジンです。
 *
 * The version of the OpenAPI document: 0.15.0-preview.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 対応しているデバイスの情報
 * @export
 * @interface SupportedDevicesInfo
 */
export interface SupportedDevicesInfo {
    /**
     * 
     * @type {boolean}
     * @memberof SupportedDevicesInfo
     */
    cpu: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedDevicesInfo
     */
    cuda: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedDevicesInfo
     */
    dml: boolean;
}

export function SupportedDevicesInfoFromJSON(json: any): SupportedDevicesInfo {
    return SupportedDevicesInfoFromJSONTyped(json, false);
}

export function SupportedDevicesInfoFromJSONTyped(json: any, ignoreDiscriminator: boolean): SupportedDevicesInfo {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'cpu': json['cpu'],
        'cuda': json['cuda'],
        'dml': json['dml'],
    };
}

export function SupportedDevicesInfoToJSON(value?: SupportedDevicesInfo | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'cpu': value.cpu,
        'cuda': value.cuda,
        'dml': value.dml,
    };
}

