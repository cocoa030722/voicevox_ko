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

/**
 * fastapiでword_type引数を検証する時に使用するクラス
 * @export
 * @enum {string}
 */
export enum WordTypes {
     '固有名詞',
     '普通名詞',
     '動詞',
     '形容詞',
     '語尾'
}

export function WordTypesFromJSON(json: any): WordTypes {
    return WordTypesFromJSONTyped(json, false);
}

export function WordTypesFromJSONTyped(json: any, ignoreDiscriminator: boolean): WordTypes {
    return json as WordTypes;
}

export function WordTypesToJSON(value?: WordTypes | null): any {
    return value as any;
}

