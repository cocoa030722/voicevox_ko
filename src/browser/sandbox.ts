import { defaultEngine } from "./contract";
import {
  checkFileExistsImpl,
  readFileImpl,
  showAudioSaveDialogImpl,
  showImportFileDialogImpl,
  showOpenDirectoryDialogImpl,
  showProjectLoadDialogImpl,
  showProjectSaveDialogImpl,
  showTextSaveDialogImpl,
  writeFileImpl,
} from "./fileImpl";
import { entryKey, openDB } from "./storeImpl";

import { IpcSOData } from "@/type/ipc";
import {
  defaultHotkeySettings,
  defaultToolbarButtonSetting,
  electronStoreSchema,
  ElectronStoreType,
  EngineId,
  EngineSetting,
  EngineSettings,
  HotkeySetting,
  SandboxKey,
  ThemeConf,
} from "@/type/preload";
import {
  ContactTextFileName,
  HowToUseTextFileName,
  OssCommunityInfosFileName,
  OssLicensesJsonFileName,
  PolicyTextFileName,
  PrivacyPolicyTextFileName,
  QAndATextFileName,
  UpdateInfosJsonFileName,
} from "@/type/staticResources";

// TODO: base pathを設定できるようにするか、ビルド時埋め込みにする
const toStaticPath = (fileName: string) => `/${fileName}`;

export const api: typeof window[typeof SandboxKey] = {
  getAppInfos() {
    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    const appInfo = {
      name: process.env.APP_NAME!,
      version: process.env.APP_VERSION!,
    };
    /* eslint-enable @typescript-eslint/no-non-null-assertion */
    return Promise.resolve(appInfo);
  },
  getHowToUseText() {
    return fetch(toStaticPath(HowToUseTextFileName)).then((v) => v.text());
  },
  getPolicyText() {
    return fetch(toStaticPath(PolicyTextFileName)).then((v) => v.text());
  },
  getOssLicenses() {
    return fetch(toStaticPath(OssLicensesJsonFileName)).then((v) => v.json());
  },
  getUpdateInfos() {
    return fetch(toStaticPath(UpdateInfosJsonFileName)).then((v) => v.json());
  },
  getOssCommunityInfos() {
    return fetch(toStaticPath(OssCommunityInfosFileName)).then((v) => v.text());
  },
  getQAndAText() {
    return fetch(toStaticPath(QAndATextFileName)).then((v) => v.text());
  },
  getContactText() {
    return fetch(toStaticPath(ContactTextFileName)).then((v) => v.text());
  },
  getPrivacyPolicyText() {
    return fetch(toStaticPath(PrivacyPolicyTextFileName)).then((v) => v.text());
  },
  getAltPortInfos() {
    // NOTE: ブラウザ版ではサポートされていません
    return Promise.resolve({});
  },
  showAudioSaveDialog(obj: { title: string; defaultPath?: string }) {
    return showAudioSaveDialogImpl(obj);
  },
  showTextSaveDialog(obj: { title: string; defaultPath?: string }) {
    return showTextSaveDialogImpl(obj);
  },
  showVvppOpenDialog(obj: { title: string; defaultPath?: string }) {
    // NOTE: 今後接続先を変える手段としてVvppが使われるかもしれないので、そのタイミングで実装する
    throw new Error(
      `not implemented: showVvppOpenDialog, request: ${JSON.stringify(obj)}`
    );
  },
  showOpenDirectoryDialog(obj: { title: string }) {
    return showOpenDirectoryDialogImpl(obj);
  },
  showProjectSaveDialog(obj: { title: string; defaultPath?: string }) {
    return showProjectSaveDialogImpl(obj);
  },
  showProjectLoadDialog(obj: { title: string }) {
    return showProjectLoadDialogImpl(obj);
  },
  showMessageDialog(obj: {
    type: "none" | "info" | "error" | "question" | "warning";
    title: string;
    message: string;
  }) {
    window.alert(`${obj.title}\n${obj.message}`);
    // NOTE: どの呼び出し元も、return valueを使用していないので雑に対応している
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return Promise.resolve({} as any);
  },
  showQuestionDialog(obj: {
    type: "none" | "info" | "error" | "question" | "warning";
    title: string;
    message: string;
    buttons: string[];
    cancelId?: number;
    defaultId?: number;
  }) {
    // FIXME
    // TODO: 例えば動的にdialog要素をDOMに生成して、それを表示させるみたいのはあるかもしれない
    throw new Error(
      `Not implemented: showQuestionDialog, request: ${JSON.stringify(obj)}`
    );
  },
  showImportFileDialog(obj: { title: string }) {
    return showImportFileDialogImpl(obj);
  },
  writeFile(obj: { filePath: string; buffer: ArrayBuffer }) {
    return writeFileImpl(obj);
  },
  readFile(obj: { filePath: string }) {
    return readFileImpl(obj);
  },
  openTextEditContextMenu() {
    // NOTE: ブラウザ版では不要
    return Promise.resolve();
  },
  isAvailableGPUMode() {
    // TODO: WebAssembly版をサポートする時に実装する
    // FIXME: canvasでWebGLから調べたり、WebGPUがサポートされているかを調べたりで判断は出来そう
    return Promise.resolve(false);
  },
  isMaximizedWindow() {
    // NOTE: UIの表示状態の制御のためだけなので固定値を返している
    return Promise.resolve(true);
  },
  onReceivedIPCMsg<T extends keyof IpcSOData>(
    channel: T,
    listener: (_: unknown, ...args: IpcSOData[T]["args"]) => void
  ) {
    window.addEventListener("message", (event) => {
      if (event.data.channel === channel) {
        listener(event.data.args);
      }
    });
  },
  closeWindow() {
    throw new Error(`Not supported on Browser version: closeWindow`);
  },
  minimizeWindow() {
    throw new Error(`Not supported on Browser version: minimizeWindow`);
  },
  maximizeWindow() {
    throw new Error(`Not supported on Browser version: maximizeWindow`);
  },
  /* eslint-disable no-console */ // ログの吐き出し先は console ぐらいしかないので、ここでは特例で許可している
  logError(...params: unknown[]) {
    console.error(...params);
    return;
  },
  logWarn(...params: unknown[]) {
    console.warn(...params);
    return;
  },
  logInfo(...params: unknown[]) {
    console.info(...params);
    return;
  },
  /* eslint-enable no-console */
  engineInfos() {
    return Promise.resolve([defaultEngine]);
  },
  restartEngine(/* engineId: EngineId */) {
    throw new Error(`Not supported on Browser version: restartEngine`);
  },
  openEngineDirectory(/* engineId: EngineId */) {
    throw new Error(`Not supported on Browser version: openEngineDirectory`);
  },
  async hotkeySettings(newData?: HotkeySetting) {
    type HotkeySettingType = ReturnType<
      typeof electronStoreSchema["parse"]
    >["hotkeySettings"];
    if (newData !== undefined) {
      const hotkeySettings = (await this.getSetting(
        "hotkeySettings"
      )) as HotkeySettingType;
      const hotkeySetting = hotkeySettings.find(
        (hotkey) => hotkey.action == newData.action
      );
      if (hotkeySetting !== undefined) {
        hotkeySetting.combination = newData.combination;
      }
      await this.setSetting("hotkeySettings", hotkeySettings);
    }
    return this.getSetting("hotkeySettings") as Promise<HotkeySettingType>;
  },
  checkFileExists(file: string) {
    return checkFileExistsImpl(file);
  },
  changePinWindow() {
    throw new Error(`Not supported on Browser version: changePinWindow`);
  },
  getDefaultHotkeySettings() {
    return Promise.resolve(defaultHotkeySettings);
  },
  getDefaultToolbarSetting() {
    return Promise.resolve(defaultToolbarButtonSetting);
  },
  setNativeTheme(/* source: NativeThemeType */) {
    // TODO: Impl
    return;
  },
  async theme(newData?: string) {
    if (newData !== undefined) {
      await this.setSetting("currentTheme", newData);
      return;
    }
    return Promise.all(
      // FIXME: themeファイルのいい感じのパスの設定
      ["/themes/default.json", "/themes/dark.json"].map((url) =>
        fetch(url).then((res) => res.json())
      )
    )
      .then((v) => ({
        currentTheme: "Default",
        availableThemes: v,
      }))
      .then((v) =>
        this.getSetting("currentTheme").then(
          (currentTheme) =>
            ({
              ...v,
              currentTheme,
            } as { currentTheme: string; availableThemes: ThemeConf[] })
        )
      );
  },
  vuexReady() {
    // NOTE: 何もしなくて良さそう
    return Promise.resolve();
  },
  async getSetting<Key extends keyof ElectronStoreType>(key: Key) {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(key, "readonly");
      const store = transaction.objectStore(key);
      const request = store.get(entryKey);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  },
  async setSetting<Key extends keyof ElectronStoreType>(
    key: Key,
    newValue: ElectronStoreType[Key]
  ) {
    const db = await openDB();

    // TODO: Schemaに合っているか保存時にvalidationしたい
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(key, "readwrite");
      const store = transaction.objectStore(key);
      const request = store.put(newValue, entryKey);
      request.onsuccess = () => {
        const readRequest = db
          .transaction(key, "readonly")
          .objectStore(key)
          .get(entryKey);
        readRequest.onsuccess = () => {
          resolve(readRequest.result);
        };
        readRequest.onerror = () => {
          reject(readRequest.error);
        };
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  },
  async setEngineSetting(engineId: EngineId, engineSetting: EngineSetting) {
    const engineSettings = (await this.getSetting(
      "engineSettings"
    )) as EngineSettings;
    engineSettings[engineId] = engineSetting;
    await this.setSetting("engineSettings", engineSettings);
    return;
  },
  installVvppEngine(/* path: string */) {
    throw new Error(`Not supported on Browser version: installVvppEngine`);
  },
  uninstallVvppEngine(/* engineId: EngineId */) {
    throw new Error(`Not supported on Browser version: uninstallVvppEngine`);
  },
  validateEngineDir(/* engineDir: string */) {
    throw new Error(`Not supported on Browser version: validateEngineDir`);
  },
  restartApp(/* obj: { isMultiEngineOffMode: boolean } */) {
    throw new Error(`Not supported on Browser version: restartApp`);
  },
};
