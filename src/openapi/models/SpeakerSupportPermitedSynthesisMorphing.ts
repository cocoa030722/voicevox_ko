/* tslint:disable */
/* eslint-disable */
/**
 * VOICEVOX Engine
 * VOICEVOXの音声合成エンジンです。
 *
 * The version of the OpenAPI document: 0.14.0-preview.10
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * An enumeration.
 * @export
 * @enum {string}
 */
export enum SpeakerSupportPermitedSynthesisMorphing {
    All = 'ALL',
    SelfOnly = 'SELF_ONLY',
    Nothing = 'NOTHING'
}

export function SpeakerSupportPermitedSynthesisMorphingFromJSON(json: any): SpeakerSupportPermitedSynthesisMorphing {
    return SpeakerSupportPermitedSynthesisMorphingFromJSONTyped(json, false);
}

export function SpeakerSupportPermitedSynthesisMorphingFromJSONTyped(json: any, ignoreDiscriminator: boolean): SpeakerSupportPermitedSynthesisMorphing {
    return json as SpeakerSupportPermitedSynthesisMorphing;
}

export function SpeakerSupportPermitedSynthesisMorphingToJSON(value?: SpeakerSupportPermitedSynthesisMorphing | null): any {
    return value as any;
}

