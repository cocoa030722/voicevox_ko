import { sep } from "path";
import { directoryHandleStoreKey } from "./contract";
import { openDB } from "./storeImpl";
import { SandboxKey, WriteFileErrorResult } from "@/type/preload";

const storeDirectoryHandle = async (
  directoryHandle: FileSystemDirectoryHandle
): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(directoryHandleStoreKey, "readwrite");
    const store = transaction.objectStore(directoryHandleStoreKey);
    const request = store.put(directoryHandle, directoryHandle.name);
    request.onsuccess = () => {
      resolve();
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
};

const fetchStoredDirectoryHandle = async (maybeDirectoryHandleName: string) => {
  const db = await openDB();
  return new Promise<FileSystemDirectoryHandle | undefined>(
    (resolve, reject) => {
      const transaction = db.transaction(directoryHandleStoreKey, "readonly");
      const store = transaction.objectStore(directoryHandleStoreKey);
      const request = store.get(maybeDirectoryHandleName);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    }
  );
};

const directoryHandleMap: Map<string, FileSystemDirectoryHandle> = new Map();

type AcceptFileType = {
  description: string;
  accept: Record<string /** MIME Type */, string[] /** extension */>;
};

const showWritableDirectoryPicker = async (): Promise<
  FileSystemDirectoryHandle | undefined
> =>
  window
    .showDirectoryPicker({
      mode: "readwrite",
    })
    // キャンセルするとエラーが投げられる
    .catch(() => undefined); // FIXME: このままだとダイアログ表示エラーと見分けがつかない

const showWritableFilePicker = async ({
  suggestedName,
  fileType,
}: {
  suggestedName?: string;
  fileType: AcceptFileType;
}) =>
  window
    .showSaveFilePicker({
      types: [fileType],
      excludeAcceptAllOption: true,
      suggestedName,
    })
    .catch(() => undefined);

const showLoadableFilePicker = async ({
  fileType,
}: {
  fileType: AcceptFileType;
}) =>
  window
    .showOpenFilePicker({
      types: [fileType],
      excludeAcceptAllOption: true,
      multiple: false,
    })
    .catch(() => undefined);

const requestSaveFileNameWithDirectoryPermission = async ({
  suggestedName,
  fileType,
}: {
  suggestedName?: string;
  fileType: AcceptFileType;
}) => {
  const fileHandle = await showWritableFilePicker({
    suggestedName,
    fileType,
  });
  if (fileHandle === undefined) {
    return undefined;
  }

  // NOTE: ディレクトリのハンドラと異なるディレクトリを選択されても検知できない
  return fileHandle.name;
};

const requestLoadFileNameWithDirectoryPermission = async ({
  fileType,
}: {
  fileType: AcceptFileType;
}) => {
  const fileHandle = await showLoadableFilePicker({
    fileType,
  });
  if (fileHandle === undefined) {
    return undefined;
  }

  // NOTE: ディレクトリのハンドラと異なるディレクトリを選択されても検知できない
  return fileHandle.map((v) => v.name);
};

export const showAudioSaveDialogImpl: typeof window[typeof SandboxKey]["showAudioSaveDialog"] =
  async (obj: { title: string; defaultPath?: string }) => {
    return requestSaveFileNameWithDirectoryPermission({
      suggestedName: obj.defaultPath,
      fileType: { description: "Wave File", accept: { "audio/wav": [".wav"] } },
    });
  };

export const showTextSaveDialogImpl: typeof window[typeof SandboxKey]["showTextSaveDialog"] =
  async (obj: { title: string; defaultPath?: string }) => {
    return requestSaveFileNameWithDirectoryPermission({
      suggestedName: obj.defaultPath,
      fileType: {
        description: "Text File",
        accept: {
          "text/plain": [".txt"],
        },
      },
    });
  };

export const showOpenDirectoryDialogImpl: typeof window[typeof SandboxKey]["showOpenDirectoryDialog"] =
  async () => {
    const _directoryHandler = await showWritableDirectoryPicker();
    if (_directoryHandler === undefined) {
      return undefined;
    }

    await storeDirectoryHandle(_directoryHandler);

    // NOTE: 同一のディレクトリ名だった場合、後で選択されたディレクトリがそれ移行の処理で使用されるため、意図しない保存が発生するかもしれない
    directoryHandleMap.set(_directoryHandler.name, _directoryHandler);
    return _directoryHandler.name;
  };

export const showProjectSaveDialogImpl: typeof window[typeof SandboxKey]["showProjectSaveDialog"] =
  async (obj: { title: string; defaultPath?: string }) => {
    return requestSaveFileNameWithDirectoryPermission({
      suggestedName: obj.defaultPath,
      fileType: {
        description: "VOICEVOX Project file",
        accept: {
          "application/json": [".vvproj"],
        },
      },
    });
  };

export const showProjectLoadDialogImpl: typeof window[typeof SandboxKey]["showProjectLoadDialog"] =
  async () => {
    return requestLoadFileNameWithDirectoryPermission({
      fileType: {
        description: "VOICEVOX Project file",
        accept: {
          "application/json": [".vvproj"],
        },
      },
    });
  };

export const showImportFileDialogImpl: typeof window[typeof SandboxKey]["showImportFileDialog"] =
  async () => {
    return requestLoadFileNameWithDirectoryPermission({
      fileType: {
        description: "Text",
        accept: {
          "text/plain": [".txt"],
        },
      },
    }).then((v) => v?.[0]);
  };

// separator 以前の文字列はディレクトリ名として扱う
const resolveDirectoryName = (path: string) => path.split(sep)[0];

// FileSystemDirectoryHandle.getFileHandle では / のような separator が含まれるとエラーになるため、ファイル名のみを抽出している
const resolveFileName = (path: string) => {
  const maybeDirectoryHandleName = resolveDirectoryName(path);
  return path.slice(maybeDirectoryHandleName.length + sep.length);
};

// FileSystemDirectoryHandle.getFileHandle では / のような separator が含まれるとエラーになるため、以下の if 文で separator を除去している
// また separator 以前の文字列はディレクトリ名として扱われ、それを key として directoryHandleMap からハンドラを取得したり、set している
const getDirectoryHandleFromDirectoryPath = async (
  maybeDirectoryPathKey: string
): Promise<FileSystemDirectoryHandle> => {
  const maybeHandle = directoryHandleMap.get(maybeDirectoryPathKey);

  if (maybeHandle !== undefined) {
    return maybeHandle;
  } else {
    // NOTE: fixedDirectoryの場合こっちに落ちる場合がある
    const maybeFixedDirectory = await fetchStoredDirectoryHandle(
      maybeDirectoryPathKey
    );

    if (maybeFixedDirectory === undefined) {
      throw new Error(
        `フォルダへのアクセス許可がありません。アクセスしようとしたフォルダ名: ${maybeDirectoryPathKey}`
      );
    }

    if (!(await maybeFixedDirectory.requestPermission({ mode: "readwrite" }))) {
      throw new Error(
        "フォルダへのアクセス許可がありません。ファイルの読み書きのためにアクセス許可が必要です。"
      );
    }

    return maybeFixedDirectory;
  }
};

// NOTE: fixedExportEnabled が有効になっている GENERATE_AND_SAVE_AUDIO action では、ファイル名に加えディレクトリ名も指定された状態でfilePathが渡ってくる
// また GENERATE_AND_SAVE_ALL_AUDIO action では fixedExportEnabled の有効の有無に関わらず、ディレクトリ名も指定された状態でfilePathが渡ってくる
export const writeFileImpl: typeof window[typeof SandboxKey]["writeFile"] =
  async (obj: { filePath: string; buffer: ArrayBuffer }) => {
    const path = obj.filePath;

    if (path.indexOf(sep) === -1) {
      return Promise.resolve({
        code: undefined,
        message:
          "フォルダへのアクセス許可がありません、ブラウザ版ではファイル単体の書き出しをサポートしていません",
      });
    }

    const fileName = resolveFileName(path);
    const maybeDirectoryHandleName = resolveDirectoryName(path);

    const directoryHandle = await getDirectoryHandleFromDirectoryPath(
      maybeDirectoryHandleName
    );

    directoryHandleMap.set(maybeDirectoryHandleName, directoryHandle);

    return directoryHandle
      .getFileHandle(fileName, { create: true })
      .then(async (fileHandle) => {
        const writable = await fileHandle.createWritable();
        await writable.write(obj.buffer);
        return writable.close();
      })
      .then(() => undefined)
      .catch((e) => {
        return {
          code: undefined,
          message: e.message as string,
        } as WriteFileErrorResult;
      });
  };

export const checkFileExistsImpl: typeof window[typeof SandboxKey]["checkFileExists"] =
  async (file) => {
    const path = file;

    if (path.indexOf(sep) === -1) {
      throw new Error(
        "ブラウザ版ではフォルダを固定しないファイルへのアクセスをサポートしていません"
      );
    }

    const fileName = resolveFileName(path);
    const maybeDirectoryHandleName = resolveDirectoryName(path);

    const directoryHandle = await getDirectoryHandleFromDirectoryPath(
      maybeDirectoryHandleName
    );

    directoryHandleMap.set(maybeDirectoryHandleName, directoryHandle);

    const fileEntries = [];
    for await (const [
      fileOrDirectoryName,
      entry,
    ] of directoryHandle.entries()) {
      if (entry.kind === "file") {
        fileEntries.push(fileOrDirectoryName);
      }
    }

    return Promise.resolve(fileEntries.includes(fileName));
  };
