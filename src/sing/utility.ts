import { CharacterInfo, StyleInfo, StyleType } from "@/type/preload";

export const isSingingStyle = (styleInfo: StyleInfo) => {
  return styleInfo.styleType === "humming" || styleInfo.styleType === "sing";
};

export const filterCharacterInfosByStyleType = (
  characterInfos: CharacterInfo[],
  styleType: StyleType | "singerLike"
): CharacterInfo[] => {
  const withStylesFiltered: CharacterInfo[] = characterInfos.map(
    (characterInfo) => {
      const styles = characterInfo.metas.styles.filter((styleInfo) => {
        // singerLike：歌う系のスタイル
        if (styleType === "singerLike") {
          return isSingingStyle(styleInfo);
        }
        // talk：singerLike以外のスタイル。
        // styleTypeが存在しない（マルチエンジン）場合があるので、「singerLike以外」をtalkとして扱っている。
        if (styleType === "talk") {
          return !isSingingStyle(styleInfo);
        }
        return styleInfo.styleType === styleType;
      });
      return { ...characterInfo, metas: { ...characterInfo.metas, styles } };
    }
  );

  const withoutEmptyStyles = withStylesFiltered.filter(
    (characterInfo) => characterInfo.metas.styles.length > 0
  );

  return withoutEmptyStyles;
};

export function round(value: number, digits: number) {
  const powerOf10 = 10 ** digits;
  return Math.round(value * powerOf10) / powerOf10;
}

export const generateHash = async <T>(obj: T) => {
  const textEncoder = new TextEncoder();
  const data = textEncoder.encode(JSON.stringify(obj));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
};

export const createPromiseThatResolvesWhen = (
  condition: () => boolean,
  interval = 200
) => {
  return new Promise<void>((resolve) => {
    const checkCondition = () => {
      if (condition()) {
        resolve();
      }
      window.setTimeout(checkCondition, interval);
    };
    checkCondition();
  });
};

/**
 * タイマーです。関数を定期的に実行します。
 */
export class Timer {
  private readonly interval: number;
  private timeoutId?: number;

  get isStarted() {
    return this.timeoutId != undefined;
  }

  /**
   * @param interval 関数を実行する間隔（ミリ秒）
   */
  constructor(interval: number) {
    this.interval = interval;
  }

  start(onTick: () => void) {
    const callback = () => {
      onTick();
      this.timeoutId = window.setTimeout(callback, this.interval);
    };
    this.timeoutId = window.setTimeout(callback, this.interval);
  }

  stop() {
    if (this.timeoutId == undefined) {
      throw new Error("The timer is not started.");
    }
    window.clearTimeout(this.timeoutId);
    this.timeoutId = undefined;
  }
}

/**
 * requestAnimationFrameを使用して関数を定期的に実行します。
 * 関数は、指定された最大フレームレート以下で実行されます。
 */
export class AnimationTimer {
  private readonly maxFrameTime: number;
  private readonly maxDiff: number;

  private requestId?: number;
  private prevTimeStamp?: number;
  private diff = 0;

  get isStarted() {
    return this.requestId != undefined;
  }

  /**
   * @param maxFrameRate 最大フレームレート（フレーム毎秒）
   */
  constructor(maxFrameRate = 60) {
    this.maxFrameTime = 1000 / maxFrameRate;
    this.maxDiff = this.maxFrameTime * 10;
  }

  start(onAnimationFrame: () => void) {
    if (this.requestId != undefined) {
      throw new Error("The animation frame runner is already started.");
    }

    this.diff = 0;
    this.prevTimeStamp = undefined;

    const callback = (timeStamp: number) => {
      if (this.prevTimeStamp == undefined) {
        this.diff += this.maxFrameTime;
      } else {
        this.diff += timeStamp - this.prevTimeStamp;
      }
      this.diff = Math.min(this.maxDiff, this.diff);
      if (this.diff >= this.maxFrameTime) {
        this.diff -= this.maxFrameTime;
        onAnimationFrame();
      }
      this.prevTimeStamp = timeStamp;
      this.requestId = window.requestAnimationFrame(callback);
    };
    this.requestId = window.requestAnimationFrame(callback);
  }

  stop() {
    if (this.requestId == undefined) {
      throw new Error("The animation frame runner is not started.");
    }
    window.cancelAnimationFrame(this.requestId);
    this.requestId = undefined;
  }
}
