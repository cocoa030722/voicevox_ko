/* tslint:disable */
/* eslint-disable */
/**
 * VOICEVOX Engine
 * VOICEVOXの音声合成エンジンです。
 *
 * The version of the OpenAPI document: 0.15.0-projects.3
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import type { LibrarySpeaker } from './LibrarySpeaker';
import {
    LibrarySpeakerFromJSON,
    LibrarySpeakerFromJSONTyped,
    LibrarySpeakerToJSON,
} from './LibrarySpeaker';

/**
 * インストール済み音声ライブラリの情報
 * @export
 * @interface InstalledLibrary
 */
export interface InstalledLibrary {
    /**
     * 
     * @type {string}
     * @memberof InstalledLibrary
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof InstalledLibrary
     */
    uuid: string;
    /**
     * 
     * @type {string}
     * @memberof InstalledLibrary
     */
    version: string;
    /**
     * 
     * @type {string}
     * @memberof InstalledLibrary
     */
    downloadUrl: string;
    /**
     * 
     * @type {number}
     * @memberof InstalledLibrary
     */
    bytes: number;
    /**
     * 
     * @type {Array<LibrarySpeaker>}
     * @memberof InstalledLibrary
     */
    speakers: Array<LibrarySpeaker>;
    /**
     * 
     * @type {boolean}
     * @memberof InstalledLibrary
     */
    uninstallable: boolean;
}

/**
 * Check if a given object implements the InstalledLibrary interface.
 */
export function instanceOfInstalledLibrary(value: object): boolean {
    let isInstance = true;
    isInstance = isInstance && "name" in value;
    isInstance = isInstance && "uuid" in value;
    isInstance = isInstance && "version" in value;
    isInstance = isInstance && "downloadUrl" in value;
    isInstance = isInstance && "bytes" in value;
    isInstance = isInstance && "speakers" in value;
    isInstance = isInstance && "uninstallable" in value;

    return isInstance;
}

export function InstalledLibraryFromJSON(json: any): InstalledLibrary {
    return InstalledLibraryFromJSONTyped(json, false);
}

export function InstalledLibraryFromJSONTyped(json: any, ignoreDiscriminator: boolean): InstalledLibrary {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'name': json['name'],
        'uuid': json['uuid'],
        'version': json['version'],
        'downloadUrl': json['download_url'],
        'bytes': json['bytes'],
        'speakers': ((json['speakers'] as Array<any>).map(LibrarySpeakerFromJSON)),
        'uninstallable': json['uninstallable'],
    };
}

export function InstalledLibraryToJSON(value?: InstalledLibrary | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'uuid': value.uuid,
        'version': value.version,
        'download_url': value.downloadUrl,
        'bytes': value.bytes,
        'speakers': ((value.speakers as Array<any>).map(LibrarySpeakerToJSON)),
        'uninstallable': value.uninstallable,
    };
}

