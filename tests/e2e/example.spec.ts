import { promises as fs } from "fs";
import path from "path";
import { _electron as electron, test } from "@playwright/test";
import dotenv from "dotenv";

test.beforeAll(async () => {
  dotenv.config(); // FIXME: エンジンの設定直読み

  console.log("Waiting for background.js to be built...");
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await fs.access("./dist/background.js");
      break;
    } catch (e) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
  console.log("background.js is built.");

  // キャッシュなどでテスト結果が変化しないように、appDataをテスト起動時に毎回消去する。
  // cf: https://www.electronjs.org/ja/docs/latest/api/app#appgetpathname
  const appDataMap: Partial<Record<NodeJS.Platform, string>> = {
    win32: process.env.APPDATA,
    darwin: "~/Library/Application Support",
    linux: process.env.XDG_CONFIG_HOME || "~/.config",
  } as const;

  const appData = appDataMap[process.platform];
  if (!appData) {
    throw new Error("Unsupported platform");
  }
  console.log(appData);
  await fs.rm(path.resolve(appData, "voicevox-test"), {
    recursive: true,
    force: true,
  });
});

test("起動したら「利用規約に関するお知らせ」が表示される", async () => {
  console.log("launch");
  const executablePath = path.resolve(
    process.cwd(),
    "node_modules",
    ".bin",
    process.platform == "win32" ? "electron.cmd" : "electron"
  );
  console.log(await fs.readdir(path.dirname(executablePath)));
  const app = await electron.launch({
    args: ["."],
    timeout: process.env.CI ? 0 : 60000,
    executablePath,
    env: {
      ...process.env,
      VITE_DEV_SERVER_URL: "http://localhost:5173",
    },
  });

  // FIXME:
  //   firstWindowにタイムアウトが設定できないのでワークアラウンドを使用している。
  //   （cf: https://github.com/microsoft/playwright/issues/21846#issuecomment-1479106814）
  //   正式版でタイムアウトを設定できるようになったら（cf: https://github.com/microsoft/playwright/pull/21863 ）
  //   app.firstWindowを使うようにする。
  console.log("test started");
  const sut = await app.firstWindow();

  // エンジンが起動し「利用規約に関するお知らせ」が表示されるのを待つ
  await sut.waitForSelector("text=利用規約に関するお知らせ", { timeout: 0 });
  await app.close();
});
