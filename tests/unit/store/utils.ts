import { getEngineManifestMock } from "@/mock/engineMock/manifestMock";
import { AllActions, AllGetters, AllMutations, State } from "@/store/type";
import { Store } from "@/store/vuex";
import {
  CharacterInfo,
  DefaultStyleId,
  EngineId,
  EngineInfo,
  SpeakerId,
  StyleId,
} from "@/type/preload";
import { mockHost } from "@/mock/engineMock";
import { assetsPath } from "@/mock/engineMock/constants";
import {
  getSpeakersMock,
  getSpeakerInfoMock,
} from "@/mock/engineMock/speakerResourceMock";

/** ソフトウェアが正しく起動した場合のようにVuex.stateを初期化する */
export function initializeStateAsSoftwareStarted(
  store: Store<State, AllGetters, AllActions, AllMutations>,
) {
  // エンジンの情報
  const engineManifest = getEngineManifestMock();
  const engineId = EngineId(engineManifest.uuid);
  const engineInfo: EngineInfo = {
    uuid: engineId,
    host: mockHost,
    name: engineManifest.name,
    path: undefined,
    executionEnabled: false,
    executionFilePath: "not_found",
    executionArgs: [],
    isDefault: true,
    type: "path",
  };
  store.commit("SET_ENGINE_INFOS", {
    engineIds: [engineId],
    engineInfos: [engineInfo],
  });
  store.commit("SET_ENGINE_MANIFESTS", {
    engineManifests: { [engineId]: engineManifest },
  });
  store.commit("SET_ENGINE_SETTING", {
    engineId,
    engineSetting: {
      outputSamplingRate: engineManifest.defaultSamplingRate,
      useGpu: false,
    },
  });
  store.commit("SET_ENGINE_STATE", { engineId, engineState: "READY" });

  // キャラクター情報
  const speakers = getSpeakersMock();
  const characterInfos: CharacterInfo[] = speakers.map((speaker) => {
    const speakerInfo = getSpeakerInfoMock(speaker.speakerUuid, assetsPath);
    return {
      portraitPath: speakerInfo.portrait,
      metas: {
        speakerUuid: SpeakerId(speaker.speakerUuid),
        speakerName: speaker.name,
        styles: speakerInfo.styleInfos.map((styleInfo) => {
          const style = speaker.styles.find((s) => s.id === styleInfo.id);
          if (style == undefined) throw new Error("style not found");
          return {
            styleName: style.name,
            styleId: StyleId(style.id),
            styleType: style.type,
            iconPath: styleInfo.icon,
            portraitPath: styleInfo.portrait ?? speakerInfo.portrait,
            engineId,
            voiceSamplePaths: styleInfo.voiceSamples,
          };
        }),
        policy: speakerInfo.policy,
      },
    };
  });
  store.commit("SET_CHARACTER_INFOS", { engineId, characterInfos });

  // キャラクターの表示順
  store.commit("SET_USER_CHARACTER_ORDER", {
    userCharacterOrder: store.state.characterInfos[engineId].map(
      (c) => c.metas.speakerUuid,
    ),
  });

  // デフォルトスタイルID
  const defaultStyleIds: DefaultStyleId[] = speakers.map((speaker) => ({
    engineId: engineId,
    speakerUuid: SpeakerId(speaker.speakerUuid),
    defaultStyleId: StyleId(speaker.styles[0].id),
  }));
  store.commit("SET_DEFAULT_STYLE_IDS", { defaultStyleIds });
}