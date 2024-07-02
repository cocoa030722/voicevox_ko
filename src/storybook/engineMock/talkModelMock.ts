/**
 * トーク系の構造体を作るモック。
 * 値は適当だが、UIのバグに気づけるよう決定論的に決まるようにしたり、ある程度規則を持たせている。
 */

import { IpadicFeatures } from "kuromoji";
import { moraToPhonemes } from "./phonemeMock";
import { convertHiraToKana, moraPattern } from "@/domain/japanese";
import { AccentPhrase, Mora } from "@/openapi";

/** アルファベット文字列を適当な0~1の適当な数値に変換する */
function alphabetsToNumber(text: string): number {
  const codes = text.split("").map((c) => c.charCodeAt(0));
  const sum = codes.reduce((a, b) => a + b);
  return (sum % 256) / 256;
}

// 0.1~1になるように適当な長さを決める
function phonemeToLengthMock(phoneme: string): number {
  return alphabetsToNumber(phoneme) * 0.9 + 0.1;
}

// 3~6になるように適当なピッチを決める
function phonemeToPitchMock(phoneme: string): number {
  return (1 - alphabetsToNumber(phoneme)) * 3 + 3;
}

/** カタカナテキストをモーラに変換する */
function textToMoraMock(text: string): Mora {
  const phonemes = moraToPhonemes[text];
  if (phonemes == undefined) throw new Error(`モーラに変換できません: ${text}`);

  return {
    text,
    consonant: phonemes[0],
    consonantLength: phonemes[0] == undefined ? undefined : 0,
    vowel: phonemes[1],
    vowelLength: 0,
    pitch: 0,
  };
}

/**
 * カタカナテキストを適当なアクセント句に変換する。
 * アクセント位置は適当に決める。
 */
function textToAccentPhraseMock(text: string): AccentPhrase {
  const moras: Mora[] = [...text.matchAll(moraPattern)].map((m) =>
    textToMoraMock(m[0]),
  );
  const alphabets = moras.map((m) => (m.consonant ?? "") + m.vowel).join("");
  const accent =
    1 + Math.round(alphabetsToNumber(alphabets) * (moras.length - 1));
  return { moras, accent };
}

/**
 * アクセント句内のモーラの長さを適当に代入する。
 * 最後のモーラだけ長くする。
 */
export function replaseLengthMock(
  accentPhrases: AccentPhrase[],
  speaker: number,
) {
  for (const accentPhrase of accentPhrases) {
    for (let i = 0; i < accentPhrase.moras.length; i++) {
      const mora = accentPhrase.moras[i];

      // 最後のモーラだけ長く
      const offset = i == accentPhrase.moras.length - 1 ? 0.1 : 0;

      if (mora.consonant != undefined)
        mora.consonantLength = phonemeToLengthMock(mora.consonant) + offset;
      mora.vowelLength = phonemeToLengthMock(mora.vowel) + offset;
    }
  }

  // 別のアクセント句や話者で同じにならないように適当に値をずらす
  for (let i = 0; i < accentPhrases.length; i++) {
    const diff = i * 0.01 + speaker * 0.03;
    const accentPhrase = accentPhrases[i];
    for (const mora of accentPhrase.moras) {
      if (mora.consonantLength != undefined) mora.consonantLength += diff;
      mora.vowelLength += diff;
    }
    if (accentPhrase.pauseMora != undefined) {
      accentPhrase.pauseMora.vowelLength += diff;
    }
  }
}

/**
 * アクセント句内のモーラのピッチを適当に代入する。
 * アクセント位置のモーラだけ高くする。
 */
export function replasePitchMock(
  accentPhrases: AccentPhrase[],
  speaker: number,
) {
  for (const accentPhrase of accentPhrases) {
    for (let i = 0; i < accentPhrase.moras.length; i++) {
      const mora = accentPhrase.moras[i];

      // 無声化している場合はピッチを0にする
      if (mora.vowel == "U") {
        mora.pitch = 0;
        continue;
      }

      // アクセント位置のモーラだけ高く
      const offset = i == accentPhrase.accent ? 0.3 : 0;

      const phoneme = (mora.consonant ?? "") + mora.vowel[1];
      mora.pitch = phonemeToPitchMock(phoneme) + offset;
    }
  }

  // 別のアクセント句や話者で同じにならないように適当に値をずらす
  for (let i = 0; i < accentPhrases.length; i++) {
    const diff = i * 0.01 + speaker * 0.03;
    const accentPhrase = accentPhrases[i];
    for (const mora of accentPhrase.moras) {
      if (mora.pitch > 0) mora.pitch += diff;
    }
  }
}

/**
 * テキストを適当なアクセント句に分割する。
 * 助詞ごとに区切る。記号ごとに無音を入れる。
 * 無音で終わるアクセント句の最後のモーラが「す」「つ」の場合は無声化する。
 */
export function tokensToActtentPhrasesMock(
  tokens: IpadicFeatures[],
  speaker: number,
) {
  const accentPhrases: AccentPhrase[] = [];
  let textPhrase = "";
  for (const token of tokens) {
    // 記号の場合は無音を入れて区切る
    if (token.pos == "記号") {
      if (textPhrase.length == 0) continue;

      const accentPhrase = textToAccentPhraseMock(textPhrase);
      accentPhrase.pauseMora = {
        text: "、",
        vowel: "",
        vowelLength: 1 - 1 / (accentPhrases.length + 1),
        pitch: 0,
      };
      accentPhrases.push(accentPhrase);
      textPhrase = "";
      continue;
    }

    // 記号以外は連結
    if (token.reading == undefined)
      throw new Error(`発音がないトークン: ${token.surface_form}`);
    textPhrase += token.reading;

    // 助詞の場合は区切る
    if (token.pos == "助詞") {
      accentPhrases.push(textToAccentPhraseMock(textPhrase));
      textPhrase = "";
    }
  }
  if (textPhrase != "") {
    accentPhrases.push(textToAccentPhraseMock(textPhrase));
  }

  // 最後のアクセント句の無音をなくす
  if (accentPhrases.length > 0) {
    const lastPhrase = accentPhrases[accentPhrases.length - 1];
    lastPhrase.pauseMora = undefined;
  }

  // 無音のあるアクセント句を無声化
  for (const phrase of accentPhrases) {
    if (phrase.pauseMora == undefined) continue;
    const lastMora = phrase.moras[phrase.moras.length - 1];
    if (lastMora.text == "ス" || lastMora.text == "ツ") {
      lastMora.vowel = "U";
      lastMora.pitch = 0;
    }
  }

  // 長さとピッチを代入
  replaseLengthMock(accentPhrases, speaker);
  replasePitchMock(accentPhrases, speaker);

  return accentPhrases;
}
