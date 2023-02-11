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
import {
    SpeakerSupportPermittedSynthesisMorphing,
    SpeakerSupportPermittedSynthesisMorphingFromJSON,
    SpeakerSupportPermittedSynthesisMorphingFromJSONTyped,
    SpeakerSupportPermittedSynthesisMorphingToJSON,
} from './';

/**
 * 話者の対応機能の情報
 * @export
 * @interface SpeakerSupportedFeatures
 */
export interface SpeakerSupportedFeatures {
    /**
     * 
     * @type {SpeakerSupportPermittedSynthesisMorphing}
     * @memberof SpeakerSupportedFeatures
     */
    permittedSynthesisMorphing?: SpeakerSupportPermittedSynthesisMorphing | null;
}

export function SpeakerSupportedFeaturesFromJSON(json: any): SpeakerSupportedFeatures {
    return SpeakerSupportedFeaturesFromJSONTyped(json, false);
}

export function SpeakerSupportedFeaturesFromJSONTyped(json: any, ignoreDiscriminator: boolean): SpeakerSupportedFeatures {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'permittedSynthesisMorphing': !exists(json, 'permitted_synthesis_morphing') ? undefined : SpeakerSupportPermittedSynthesisMorphingFromJSON(json['permitted_synthesis_morphing']),
    };
}

export function SpeakerSupportedFeaturesToJSON(value?: SpeakerSupportedFeatures | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'permitted_synthesis_morphing': SpeakerSupportPermittedSynthesisMorphingToJSON(value.permittedSynthesisMorphing),
    };
}

