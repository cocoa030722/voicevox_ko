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
import type { AccentPhrase } from './AccentPhrase';
import {
    AccentPhraseFromJSON,
    AccentPhraseFromJSONTyped,
    AccentPhraseToJSON,
} from './AccentPhrase';

/**
 * 音声合成用のクエリ
 * @export
 * @interface AudioQuery
 */
export interface AudioQuery {
    /**
     * 
     * @type {Array<AccentPhrase>}
     * @memberof AudioQuery
     */
    accentPhrases: Array<AccentPhrase>;
    /**
     * 
     * @type {number}
     * @memberof AudioQuery
     */
    speedScale: number;
    /**
     * 
     * @type {number}
     * @memberof AudioQuery
     */
    pitchScale: number;
    /**
     *
     * @type {number}
     * @memberof AudioQuery
     */
    intonationScale: number;
    /**
     * 
     * @type {number}
     * @memberof AudioQuery
     */
    volumeScale: number;
    /**
     * 
     * @type {number}
     * @memberof AudioQuery
     */
    prePhonemeLength: number;
    /**
     * 
     * @type {number}
     * @memberof AudioQuery
     */
    postPhonemeLength: number;
    /**
     * 
     * @type {number | null}
     * @memberof AudioQuery
     */
    pauseLength: number | null;
     /**
      * 
      * @type {number}
      * @memberof AudioQuery
      */
      pauseLengthScale: number;
     /**
      * 
      * @type {number}
      * @memberof AudioQuery
      */
    outputSamplingRate: number;
    /**
     * 
     * @type {boolean}
     * @memberof AudioQuery
     */
    outputStereo: boolean;
    /**
     * 
     * @type {string}
     * @memberof AudioQuery
     */
    kana?: string;
}

/**
 * Check if a given object implements the AudioQuery interface.
 */
export function instanceOfAudioQuery(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "accentPhrases" in value;
    isInstance = isInstance && "speedScale" in value;
    isInstance = isInstance && "pitchScale" in value;
    isInstance = isInstance && "intonationScale" in value;
    isInstance = isInstance && "volumeScale" in value;
    isInstance = isInstance && "prePhonemeLength" in value;
    isInstance = isInstance && "postPhonemeLength" in value;
    isInstance = isInstance && "pauseLength" in value;
    isInstance = isInstance && "pauseLengthScale" in value;
    isInstance = isInstance && "outputSamplingRate" in value;
    isInstance = isInstance && "outputStereo" in value;

    return isInstance;
}

export function AudioQueryFromJSON(json: any): AudioQuery {
    return AudioQueryFromJSONTyped(json, false);
}

export function AudioQueryFromJSONTyped(json: any, ignoreDiscriminator: boolean): AudioQuery {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {

        'accentPhrases': ((json['accent_phrases'] as Array<any>).map(AccentPhraseFromJSON)),
        'speedScale': json['speedScale'],
        'pitchScale': json['pitchScale'],
        'intonationScale': json['intonationScale'],
        'volumeScale': json['volumeScale'],
        'prePhonemeLength': json['prePhonemeLength'],
        'postPhonemeLength': json['postPhonemeLength'],
        'pauseLength': json['pauseLength'],
        'pauseLengthScale': json['pauseLengthScale'],
        'outputSamplingRate': json['outputSamplingRate'],
        'outputStereo': json['outputStereo'],
        'kana': !exists(json, 'kana') ? undefined : json['kana'],
    };
}

export function AudioQueryToJSON(value?: AudioQuery | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {

        'accent_phrases': ((value.accentPhrases as Array<any>).map(AccentPhraseToJSON)),
        'speedScale': value.speedScale,
        'pitchScale': value.pitchScale,
        'intonationScale': value.intonationScale,
        'volumeScale': value.volumeScale,
        'prePhonemeLength': value.prePhonemeLength,
        'postPhonemeLength': value.postPhonemeLength,
        'pauseLength': value.pauseLength,
        'pauseLengthScale': value.pauseLengthScale,
        'outputSamplingRate': value.outputSamplingRate,
        'outputStereo': value.outputStereo,
        'kana': value.kana,
    };
}
