/**
 * HTMLAudioElement周りの音声再生・停止などを担当する。
 */
import { createPartialStore } from "./vuex";
import { AudioPlayerStoreState, AudioPlayerStoreTypes } from "./type";
import { AudioKey } from "@/type/preload";

// ユニットテストが落ちるのを回避するための遅延読み込み
const getAudioElement = (() => {
  let audioElement: HTMLAudioElement | undefined = undefined;
  return () => {
    if (audioElement == undefined) {
      audioElement = new Audio();
    }
    return audioElement;
  };
})();

export const audioPlayerStoreState: AudioPlayerStoreState = {
  //
};

export const audioPlayerStore = createPartialStore<AudioPlayerStoreTypes>({
  //

  // NOTE: リファクタリング中、別ファイルに移動予定
  SET_AUDIO_SOURCE: {
    mutation(_, { audioBlob }: { audioBlob: Blob }) {
      getAudioElement().src = URL.createObjectURL(audioBlob);
    },
  },

  // NOTE: リファクタリング中、別ファイルに移動予定
  PLAY_AUDIO_PLAYER: {
    async action(
      { state, commit },
      { offset, audioKey }: { offset?: number; audioKey?: AudioKey }
    ) {
      const audioElement = getAudioElement();

      if (offset !== undefined) {
        audioElement.currentTime = offset;
      }

      // 一部ブラウザではsetSinkIdが実装されていないので、その環境では無視する
      if (audioElement.setSinkId) {
        audioElement
          .setSinkId(state.savingSetting.audioOutputDevice)
          .catch((err) => {
            const stop = () => {
              audioElement.pause();
              audioElement.removeEventListener("canplay", stop);
            };
            audioElement.addEventListener("canplay", stop);
            window.electron.showMessageDialog({
              type: "error",
              title: "エラー",
              message: "再生デバイスが見つかりません",
            });
            throw new Error(err);
          });
      }

      // 再生終了時にresolveされるPromiseを返す
      const played = async () => {
        if (audioKey) {
          commit("SET_AUDIO_NOW_PLAYING", { audioKey, nowPlaying: true });
        }
      };
      audioElement.addEventListener("play", played);

      let paused: () => void;
      const audioPlayPromise = new Promise<boolean>((resolve) => {
        paused = () => {
          resolve(audioElement.ended);
        };
        audioElement.addEventListener("pause", paused);
      }).finally(async () => {
        audioElement.removeEventListener("play", played);
        audioElement.removeEventListener("pause", paused);
        if (audioKey) {
          commit("SET_AUDIO_NOW_PLAYING", { audioKey, nowPlaying: false });
        }
      });

      audioElement.play();

      return audioPlayPromise;
    },
  },
});
