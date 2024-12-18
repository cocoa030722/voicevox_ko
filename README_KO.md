 VOICEVOX

보이스복스 고수가 될거야!

VOICEVOX 레포지토리의 한국어 번역입니다. 번역은 기계번역으로 진행됩니다.
한국어 번역본을 별도의 파일로 추가하고, 마크업 등을 그대로 보존합니다.
현재 원본 레포지토리와의 동기화를 보장하지 않습니다. 해결할 예정입니다.
[![releases](https://img.shields.io/github/v/release/VOICEVOX/voicevox?label=Release)](https://github.com/VOICEVOX/voicevox/releases)
[![build](https://github.com/VOICEVOX/voicevox/actions/workflows/build.yml/badge.svg)](https://github.com/VOICEVOX/voicevox/actions/workflows/build.yml)
[![test](https://github.com/VOICEVOX/voicevox/actions/workflows/test.yml/badge.svg)](https://github.com/VOICEVOX/voicevox/actions/workflows/test.yml)
[![Discord](https://img.shields.io/discord/879570910208733277?color=5865f2&label=&logo=discord&logoColor=ffffff)](https://discord.gg/WMwWetrzuh)

[VOICEVOX](https://voicevox.hiroshiba.jp/) 의 편집자입니다
(엔진은 [VoiceVox Engine] (https://github.com/voicevox/voicevox_engine/), 코어는 [voiceevox] core](https://github.com/voicevox/voicevox_core/) 전체 구성은 [여기](./docs/whole configuration.md)에서 찾을 수 있습니다.

## 사용자를 위한

이 페이지는 개발용입니다. 사용법에 대한 자세한 내용은 [VoiceVox 공식 사이트] (https://voicevox.hiroshiba.jp/)를 참조하십시오.

## プロジェクトに貢献したいと考えている方へ
## 프로젝트에 기여하고자 하는 분들을 위해

VOICEVOXプロジェクトは興味ある方の参画を歓迎しています。
[貢献手順について説明したガイド](./CONTRIBUTING.md)をご用意しております。
VoiceVox 프로젝트는 관심 있는 분들의 참여를 환영합니다. 기여 절차(./contribution.md)에 대한 가이드를 준비했습니다.

貢献というとプログラム作成と思われがちですが、ドキュメント執筆、テスト生成、改善提案への議論参加など様々な参加方法があります。
初心者歓迎タスクもありますので、皆様のご参加をお待ちしております。
기여는 종종 프로그램 생성으로 생각되지만 문서 작성, 테스트 생성, 개선 제안에 대한 토론 참여와 같은 다양한 참여 방법이 있습니다. 초보자를 환영하는 작업도 있으므로 귀하의 참여를 기대합니다.

VOICEVOX のエディタは Electron・TypeScript・Vue・Vuex などが活用されており、全体構成がわかりにくくなっています。  
[コードの歩き方](./docs/コードの歩き方.md)で構成を紹介しているので、開発の一助になれば幸いです。
VoiceVox의 편집기는 Electron, TypeScript, Vue, Vuex 등을 사용하여 전체 구성을 이해하기 어렵습니다. 나는 [코드를 걷는 방법](./docs/code.md에서 걷는 방법)에 구성을 소개했으므로 개발에 도움이 되기를 바랍니다.

Issue を解決するプルリクエストを作成される際は、別の方と同じ Issue に取り組むことを避けるため、
Issue 側で取り組み始めたことを伝えるか、最初に Draft プルリクエストを作成してください。
문제를 해결하는 풀 요청을 만들 때 문제에 대해 작업을 시작했음을 문제에 알리거나 다른 문제와 함께 작업하지 않도록 먼저 초안 풀 요청을 생성합니다.

[VOICEVOX 非公式 Discord サーバー](https://discord.gg/WMwWetrzuh)にて、開発の議論や雑談を行っています。気軽にご参加ください。
[VoiceVox 비공식 Discord Server](https://discord.gg/wmwwetrzuh)에서 개발에 대해 논의하고 채팅하고 있습니다. 저희와 함께 해주세요.

### デザインガイドライン
### 디자인 지침
[UX・UI デザインの方針](./docs/UX・UIデザインの方針.md)をご参照ください。
UX/UI 디자인 정책(./docs/ux/ui 디자인 policy.md)을 참조하십시오.

## 環境構築
## 환경 빌드

[.node-version](.node-version)에 나열된 Node.js 버전을 설치합니다. Node.js 관리 도구(예: [NVS](https://github.com/jasongin/nvs) 또는 [volta](https://volta.sh) 등을 사용하여 쉽게 설치할 수 있습니다. 자동으로 전환할 수도 있습니다.

Node.js를 설치한 후 [이 저장소](https://github.com/voicevox/voicevox.git)를 사용하여 `git clone`을 포크합니다.

### 종속 라이브러리 설치

종속 라이브러리는 다음 명령을 실행하여 설치 및 업데이트됩니다.

```bash
npm ci
```

## 실행 

### 엔진 준비

`.env.production`을 복사하여 `.env`를 만든 다음 `vite_default_engine_infos` voiceVox에 `executionFilePath`를 입력하면 작동합니다. `vv-engine/run.exe`를 지정하는 경우.

Windows에서 설치 대상을 변경하지 않은 경우 `c:/users/(user name)/appdata/local/programs/voicevox/vv-engine/run.exe`를 지정하십시오. 경로의 구분 기호는 `\`가 아니라 `/`입니다.

macOS에 `voicevox.app`을 사용하는 경우 `/path/to/voicevox.app/resources/macos/vv-engine/run`을 지정하십시오.

Linux의 경우 [Releases](https://github.com/voicevox/voicevox/releases/)에서 사용할 수 있는 tar.gz 버전에 포함된 `vv-engine/run` 명령을 지정하십시오. AppImage 버전의 경우 `$ /path/to/voicevox.appImage --appImage-mount`로 파일 시스템을 마운트할 수 있습니다.

VoiceVox 편집기를 실행하는 것과 별개로 Engine API에 대한 서버를 설정하는 경우 "ExecutionFilePath"를 지정할 필요가 없지만 대신 'ExecutionEnabled'는 '거짓'이어야 합니다. VoiceVox의 제품 버전을 실행하는 경우에도 적용됩니다.

`VITE_DEFAULT_ENGINE_INFOS`에서 `HOST`를 변경하여 엔진 API의 대상 엔드포인트를 변경합니다.

### Electron 의 실행

```bash
# 개발하기 쉬운 환경에서 실행하십시오
npm run electron:serve

# 빌드 시간에 가까운 환경에서 실행합니다
npm run electron:serve -- --mode production
```

다음은 음성 합성 엔진 저장소입니다 <https://github.com/VOICEVOX/voicevox_engine>

### Storybook 의 실행

Storybook을 사용하여 구성 요소를 개발할 수 있습니다.

```bash
npm run storybook
```

main 브런치의 Storybook 은[VOICEVOX/preview-pages](https://github.com/VOICEVOX/preview-pages)에서 확인할 수 있습니다.
<https://voicevox.github.io/preview-pages/preview/branch-main/storybook/index.html>

### 브라우저 버전 실행(개발 중)

음성 합성 엔진을 별도로 시작하고 표시된 localhost에 액세스합니다.

```bash
npm run browser:serve
```

또한 기본 분기의 빌드 결과는 [VOICEVOX/preview-pages](https://github.com/VOICEVOX/preview-pages)에 배포됩니다.

<https://voicevox.github.io/preview-pages/preview/branch-main/editor/index.html>  
이제 로컬 PC에서 음성 합성 엔진을 시작해야 합니다.

## 빌드

```bash
npm run electron:build
```

### Github Actions로 빌드

fork したリポジトリで Actions を ON にし、workflow_dispatch で`build.yml`を起動すればビルドできます。
成果物は Release にアップロードされます。
fork 저장소에서 작업을 켜고 workflow_dispatch로 `build.yml`을 시작하여 빌드할 수 있습니다. 아티팩트가 업로드됩니다.

## 테스트

### 단위 테스트

`./tests/unit/` 以下にあるテストと、Storybookのテストを実行します。

```bash
npm run test:unit
npm run test-watch:unit # 모니터링 모드
npm run test-ui:unit # Vitest의 UI 보기
npm run test:unit -- --update # 스냅샷 업데이트
```

> [!NOTE]  
> `./tests/unit` 아래 테스트에서 테스트가 실행되는 환경은 파일 이름에 따라 다릅니다.
>
> - `.node.spec.ts`：Node.js 환경
> - `.browser.spec.ts`：브라우저 환경（Chromium）
> - `.spec.ts`：브라우저 환경（happy-dom과 함께 에뮬레이션）

### 브라우저 End to End 테스트

Electron 기능이 필요하지 않은 UI 및 음성 합성과 같은 종단 간 테스트를 실행합니다.
> [!NOTE]
> 일부 엔진 설정을 다시 작성하기 위한 테스트、CI(Github Actions)에서만 실행됩니다.

```bash
npm run test:browser-e2e
npm run test-watch:browser-e2e # 모니터링 모드
npm run test-watch:browser-e2e -- --headed # 테스트 중인 UI를 표시합니다
npm run test-ui:browser-e2e # Playwright 의 UI 보기
```

Playwright 를 사용하기 때문에 테스트 패턴을 생성할 수도 있습니다.。
**실행 중인 브라우저 버전과 함께**다음 명령을 실행하십시오.

```bash
npx playwright codegen http://localhost:5173/  --viewport-size=1024,630
```

자세한 내용은 [Playwright ドキュメントの Test generator](https://playwright.dev/docs/codegen-intro)를 참조하십시오.

### Storybook의 Visual Regression Testing

Storybook のコンポーネントのスクリーンショットを比較して、変更がある場合は差分を表示します。

> [!NOTE]
> このテストは Windows でのみ実行できます。

```bash
npm run test:storybook-vrt
npm run test-watch:storybook-vrt # 監視モード
npm run test-ui:storybook-vrt # Playwright の UI を表示
```

#### スクリーンショットの更新

ブラウザ End to End テストと Storybook では Visual Regression Testing を行っています。
現在 VRT テストは Windows のみで行っています。
以下の手順でスクリーンショットを更新できます：

##### Github Actions で更新する場合

1. フォークしたリポジトリの設定で GitHub Actions を有効にします。
2. リポジトリの設定の Actions > General > Workflow permissions で Read and write permissions を選択します。
3. `[update snapshots]` という文字列をコミットメッセージに含めてコミットします。

   ```bash
   git commit -m "UIを変更 [update snapshots]"
   ```

4. Github Workflow が完了すると、更新されたスクリーンショットがコミットされます。
5. プルした後、空コミットをプッシュしてテストを再実行します。

   ```bash
   git commit --allow-empty -m "（テストを再実行）"
   git push
   ```

> [!NOTE]
> トークンを作成して Secrets に追加することで、自動的にテストを再実行できます。
>
> 1. [Fine-granted Tokens](https://github.com/settings/personal-access-tokens/new) にアクセスします。
> 2. 適当な名前を入力し、 `ユーザー名/voicevox` へのアクセス権を与え、 Repository permissions の Contents で Read and write を選択します。
>    <details>
>    <summary>設定例</summary>
>    <img src="./docs/res/Fine-granted_Tokensの作成.png" width="320">
>    </details>
> 3. トークンを作成して文字列をコピーします。
> 4. `ユーザー名/voicevox` のリポジトリの Settings > Secrets and variables > Actions > New repository secret を開きます。
> 5. 名前に `PUSH_TOKEN` と入力し、先ほどの文字列を貼り付けて Secrets を追加します。

##### ローカルで更新する場合

ローカル PC の OS に対応したもののみが更新されます。

```bash
npm run test:browser-e2e -- --update-snapshots
```

### Electron End to End テスト

Electron の機能が必要な、エンジン起動・終了などを含めた End to End テストを実行します。

```bash
npm run test:electron-e2e
npm run test-watch:electron-e2e # 監視モード
```

## 依存ライブラリのライセンス情報の生成

依存ライブラリのライセンス情報は Github Workflow でのビルド時に自動生成されます。以下のコマンドで生成できます。

```bash
# get licenses.json from voicevox_engine as engine_licenses.json

npm run license:generate -- -o voicevox_licenses.json
npm run license:merge -- -o public/licenses.json -i engine_licenses.json -i voicevox_licenses.json
```

## コードフォーマット

コードのフォーマットを整えます。プルリクエストを送る前に実行してください。

```bash
npm run fmt
```

## リント（静的解析）

コードの静的解析を行い、バグを未然に防ぎます。プルリクエストを送る前に実行してください。

```bash
npm run lint
```

## タイポチェック

[typos](https://github.com/crate-ci/typos) を使ってタイポのチェックを行っています。

```bash
npm run typos
```

でタイポチェックを行えます。
もし誤判定やチェックから除外すべきファイルがあれば
[設定ファイルの説明](https://github.com/crate-ci/typos#false-positives) に従って`_typos.toml`を編集してください。

## 型チェック

TypeScript の型チェックを行います。

```bash
npm run typecheck
```

## Markdownlint

Markdown の文法チェックを行います。

```bash
npm run markdownlint
```

## Shellcheck

ShellScript の文法チェックを行います。
インストール方法は [こちら](https://github.com/koalaman/shellcheck#installing) を参照してください。

```bash
shellcheck ./build/*.sh
```

## OpenAPI generator

音声合成エンジンが起動している状態で以下のコマンドを実行してください。

```bash
curl http://127.0.0.1:50021/openapi.json >openapi.json

npx openapi-generator-cli generate \
    -i openapi.json \
    -g typescript-fetch \
    -o src/openapi/ \
    --additional-properties "modelPropertyNaming=camelCase,supportsES6=true,withInterfaces=true,typescriptThreePlus=true"

npm run fmt
```

### OpanAPI generator のバージョンアップ

新しいバージョンの確認・インストールは次のコマンドで行えます。

```bash
npx openapi-generator-cli version-manager list
```

## VS Code でのデバッグ実行

npm scripts の `serve` や `electron:serve` などの開発ビルド下では、ビルドに使用している vite で sourcemap を出力するため、ソースコードと出力されたコードの対応付けが行われます。

`.vscode/launch.template.json` をコピーして `.vscode/launch.json` を、
`.vscode/tasks.template.json` をコピーして `.vscode/tasks.json` を作成することで、
開発ビルドを VS Code から実行し、デバッグを可能にするタスクが有効になります。

## 라이센스

LGPL v3 및 소스 코드를 게시할 필요가 없는 다른 라이선스가 있는 이중 라이선스입니다. 다른 라이센스를 얻으려면 hiho에게 문의하십시오. 
x 계정: [@hiho_karuta](https://x.com/hiho_karuta)