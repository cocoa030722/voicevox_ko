import { QVueGlobals } from "quasar";
import { AudioKey, Encoding as EncodingType } from "@/type/preload";
import {
  AllActions,
  SaveResultObject,
  SaveResult,
  ErrorTypeForSaveAllResultDialog,
} from "@/store/type";
import SaveAllResultDialog from "@/components/SaveAllResultDialog.vue";
import { Dispatch } from "@/store/vuex";
import { withProgress } from "@/store/ui";

type QuasarDialog = QVueGlobals["dialog"];
type QuasarNotify = QVueGlobals["notify"];
type MediaType = "audio" | "text";

export async function generateAndSaveOneAudioWithDialog({
  audioKey,
  quasarNotify,
  dispatch,
  filePath,
  encoding,
  disableNotifyOnGenerate,
}: {
  audioKey: AudioKey;
  quasarNotify: QuasarNotify;
  dispatch: Dispatch<AllActions>;
  filePath?: string;
  encoding?: EncodingType;
  disableNotifyOnGenerate: boolean;
}): Promise<void> {
  const result: SaveResultObject = await withProgress(
    dispatch("GENERATE_AND_SAVE_AUDIO", {
      audioKey,
      filePath,
      encoding,
    }),
    dispatch
  );

  if (result.result === "CANCELED") return;

  if (result.result === "SUCCESS") {
    if (disableNotifyOnGenerate) return;
    // 書き出し成功時に通知をする
    showWriteSuccessNotify({
      mediaType: "audio",
      quasarNotify,
      dispatch,
    });
  } else {
    showWriteErrorDialog({ mediaType: "audio", result, dispatch });
  }
}

export async function generateAndSaveAllAudioWithDialog({
  quasarDialog,
  quasarNotify,
  dispatch,
  dirPath,
  encoding,
  disableNotifyOnGenerate,
}: {
  quasarDialog: QuasarDialog;
  quasarNotify: QuasarNotify;
  dispatch: Dispatch<AllActions>;
  dirPath?: string;
  encoding?: EncodingType;
  disableNotifyOnGenerate: boolean;
}): Promise<void> {
  const result = await withProgress(
    dispatch("GENERATE_AND_SAVE_ALL_AUDIO", {
      dirPath,
      encoding,
      callback: (finishedCount, totalCount) =>
        dispatch("SET_PROGRESS_FROM_COUNT", { finishedCount, totalCount }),
    }),
    dispatch
  );

  if (result === undefined) return;

  // 書き出し成功時の出力先パスを配列に格納
  const successArray: Array<string | undefined> = result.flatMap((result) =>
    result.result === "SUCCESS" ? result.path : []
  );

  // 書き込みエラーを配列に格納
  const writeErrorArray: Array<ErrorTypeForSaveAllResultDialog> =
    result.flatMap((result) =>
      result.result === "WRITE_ERROR"
        ? { path: result.path ?? "", message: result.errorMessage ?? "" }
        : []
    );

  // エンジンエラーを配列に格納
  const engineErrorArray: Array<ErrorTypeForSaveAllResultDialog> =
    result.flatMap((result) =>
      result.result === "ENGINE_ERROR"
        ? { path: result.path ?? "", message: result.errorMessage ?? "" }
        : []
    );

  if (successArray.length === result.length) {
    if (disableNotifyOnGenerate) return;
    // 書き出し成功時に通知をする
    showWriteSuccessNotify({
      mediaType: "audio",
      quasarNotify,
      dispatch,
    });
  }

  if (writeErrorArray.length > 0 || engineErrorArray.length > 0) {
    quasarDialog({
      component: SaveAllResultDialog,
      componentProps: {
        successArray: successArray,
        writeErrorArray: writeErrorArray,
        engineErrorArray: engineErrorArray,
      },
    });
  }
}

export async function generateAndConnectAndSaveAudioWithDialog({
  quasarNotify,
  dispatch,
  filePath,
  encoding,
  disableNotifyOnGenerate,
}: {
  quasarNotify: QuasarNotify;
  dispatch: Dispatch<AllActions>;
  filePath?: string;
  encoding?: EncodingType;
  disableNotifyOnGenerate: boolean;
}): Promise<void> {
  const result = await withProgress(
    dispatch("GENERATE_AND_CONNECT_AND_SAVE_AUDIO", {
      filePath,
      encoding,
      callback: (finishedCount, totalCount) =>
        dispatch("SET_PROGRESS_FROM_COUNT", { finishedCount, totalCount }),
    }),
    dispatch
  );

  if (result === undefined || result.result === "CANCELED") return;

  if (result.result === "SUCCESS") {
    if (disableNotifyOnGenerate) return;
    showWriteSuccessNotify({
      mediaType: "audio",
      quasarNotify,
      dispatch,
    });
  } else {
    showWriteErrorDialog({ mediaType: "audio", result, dispatch });
  }
}

export async function connectAndExportTextWithDialog({
  quasarNotify,
  dispatch,
  filePath,
  encoding,
  disableNotifyOnGenerate,
}: {
  quasarNotify: QuasarNotify;
  dispatch: Dispatch<AllActions>;
  filePath?: string;
  encoding?: EncodingType;
  disableNotifyOnGenerate: boolean;
}): Promise<void> {
  const result = await dispatch("CONNECT_AND_EXPORT_TEXT", {
    filePath,
    encoding,
  });

  if (result === undefined || result.result === "CANCELED") return;

  if (result.result === "SUCCESS") {
    if (disableNotifyOnGenerate) return;
    showWriteSuccessNotify({
      mediaType: "text",
      quasarNotify,
      dispatch,
    });
  } else {
    showWriteErrorDialog({ mediaType: "text", result, dispatch });
  }
}

// 書き出し成功時の通知を表示
const showWriteSuccessNotify = ({
  mediaType,
  quasarNotify,
  dispatch,
}: {
  mediaType: MediaType;
  quasarNotify: QuasarNotify;
  dispatch: Dispatch<AllActions>;
}): void => {
  const mediaTypeNames: Record<MediaType, string> = {
    audio: "音声",
    text: "テキスト",
  };

  quasarNotify({
    message: `${mediaTypeNames[mediaType]}を書き出しました`,
    color: "toast",
    textColor: "toast-display",
    icon: "info",
    timeout: 5000,
    actions: [
      {
        label: "今後この通知をしない",
        textColor: "toast-button-display",
        handler: () => {
          dispatch("SET_CONFIRMED_TIP", {
            confirmedTip: {
              notifyOnGenerate: true,
            },
          });
        },
      },
    ],
  });
};

// 書き出し失敗時のダイアログを表示
const showWriteErrorDialog = ({
  mediaType,
  result,
  dispatch,
}: {
  mediaType: MediaType;
  result: SaveResultObject;
  dispatch: Dispatch<AllActions>;
}) => {
  if (mediaType === "text") {
    // テキスト書き出し時のエラーを出力
    dispatch("SHOW_ALERT_DIALOG", {
      title: "テキストの書き出しに失敗しました。",
      message:
        "書き込みエラーによって失敗しました。空き容量があることや、書き込み権限があることをご確認ください。",
    });
  } else {
    const defaultErrorMessages: Partial<Record<SaveResult, string>> = {
      WRITE_ERROR:
        "何らかの理由で書き出しに失敗しました。ログを参照してください。",
      ENGINE_ERROR:
        "エンジンのエラーによって失敗しました。エンジンの再起動をお試しください。",
      UNKNOWN_ERROR:
        "何らかの理由で書き出しに失敗しました。ログを参照してください。",
    };

    // 音声書き出し時のエラーを出力
    dispatch("SHOW_ALERT_DIALOG", {
      title: "書き出しに失敗しました。",
      message: result.errorMessage ?? defaultErrorMessages[result.result] ?? "",
    });
  }
};
