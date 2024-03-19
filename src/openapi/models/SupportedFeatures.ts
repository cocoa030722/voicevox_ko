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
 * エンジンが持つ機能の一覧
 * @export
 * @interface SupportedFeatures
 */
export interface SupportedFeatures {
    /**
     * 
     * @type {boolean}
     * @memberof SupportedFeatures
     */
    adjustMoraPitch: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedFeatures
     */
    adjustPhonemeLength: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedFeatures
     */
    adjustSpeedScale: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedFeatures
     */
    adjustPitchScale: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedFeatures
     */
    adjustIntonationScale: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedFeatures
     */
    adjustVolumeScale: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedFeatures
     */
    interrogativeUpspeak: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedFeatures
     */
    synthesisMorphing: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedFeatures
     */
    sing?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedFeatures
     */
    manageLibrary?: boolean;
    /**
     * 
     * @type {boolean}
     * @memberof SupportedFeatures
     */
    optimalPitch?: boolean;
}

/**
 * Check if a given object implements the SupportedFeatures interface.
 */
export function instanceOfSupportedFeatures(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "adjustMoraPitch" in value;
    isInstance = isInstance && "adjustPhonemeLength" in value;
    isInstance = isInstance && "adjustSpeedScale" in value;
    isInstance = isInstance && "adjustPitchScale" in value;
    isInstance = isInstance && "adjustIntonationScale" in value;
    isInstance = isInstance && "adjustVolumeScale" in value;
    isInstance = isInstance && "interrogativeUpspeak" in value;
    isInstance = isInstance && "synthesisMorphing" in value;

    return isInstance;
}

export function SupportedFeaturesFromJSON(json: any): SupportedFeatures {
    return SupportedFeaturesFromJSONTyped(json, false);
}

export function SupportedFeaturesFromJSONTyped(json: any, ignoreDiscriminator: boolean): SupportedFeatures {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'adjustMoraPitch': json['adjust_mora_pitch'],
        'adjustPhonemeLength': json['adjust_phoneme_length'],
        'adjustSpeedScale': json['adjust_speed_scale'],
        'adjustPitchScale': json['adjust_pitch_scale'],
        'adjustIntonationScale': json['adjust_intonation_scale'],
        'adjustVolumeScale': json['adjust_volume_scale'],
        'interrogativeUpspeak': json['interrogative_upspeak'],
        'synthesisMorphing': json['synthesis_morphing'],
        'sing': !exists(json, 'sing') ? undefined : json['sing'],
        'manageLibrary': !exists(json, 'manage_library') ? undefined : json['manage_library'],
        'optimalPitch': !exists(json, 'optimal_pitch') ? undefined : json['optimal_pitch'],
    };
}

export function SupportedFeaturesToJSON(value?: SupportedFeatures | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'adjust_mora_pitch': value.adjustMoraPitch,
        'adjust_phoneme_length': value.adjustPhonemeLength,
        'adjust_speed_scale': value.adjustSpeedScale,
        'adjust_pitch_scale': value.adjustPitchScale,
        'adjust_intonation_scale': value.adjustIntonationScale,
        'adjust_volume_scale': value.adjustVolumeScale,
        'interrogative_upspeak': value.interrogativeUpspeak,
        'synthesis_morphing': value.synthesisMorphing,
        'sing': value.sing,
        'manage_library': value.manageLibrary,
        'optimal_pitch': value.optimalPitch,
    };
}

