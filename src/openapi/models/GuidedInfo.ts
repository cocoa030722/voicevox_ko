/* tslint:disable */
/* eslint-disable */
/**
 * VOICEVOX ENGINE
 * VOICEVOXの音声合成エンジンです。
 *
 * The version of the OpenAPI document: 0.10.4
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface GuidedInfo
 */
export interface GuidedInfo {
    /**
     * 
     * @type {boolean}
     * @memberof GuidedInfo
     */
    enabled: boolean;
    /**
     * 
     * @type {string}
     * @memberof GuidedInfo
     */
    audioPath: string;
    /**
     * 
     * @type {boolean}
     * @memberof GuidedInfo
     */
    normalize: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof GuidedInfo
     */
    precise: boolean;
}

export function GuidedInfoFromJSON(json: any): GuidedInfo {
    return GuidedInfoFromJSONTyped(json, false);
}

export function GuidedInfoFromJSONTyped(json: any, ignoreDiscriminator: boolean): GuidedInfo {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'enabled': json['enabled'],
        'audioPath': json['audioPath'],
        'normalize': json['normalize'],
        'precise': json['precise'],
    };
}

export function GuidedInfoToJSON(value?: GuidedInfo | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'enabled': value.enabled,
        'audioPath': value.audioPath,
        'normalize': value.normalize,
        'precise': value.precise,
    };
}

