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

import { exists, mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface MorphableTargetInfo
 */
export interface MorphableTargetInfo {
    /**
     * 
     * @type {boolean}
     * @memberof MorphableTargetInfo
     */
    isMorphable: boolean;
}

export function MorphableTargetInfoFromJSON(json: any): MorphableTargetInfo {
    return MorphableTargetInfoFromJSONTyped(json, false);
}

export function MorphableTargetInfoFromJSONTyped(json: any, ignoreDiscriminator: boolean): MorphableTargetInfo {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'isMorphable': json['is_morphable'],
    };
}

export function MorphableTargetInfoToJSON(value?: MorphableTargetInfo | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'is_morphable': value.isMorphable,
    };
}


