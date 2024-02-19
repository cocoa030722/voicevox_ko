import { Note, Singer, Tempo } from "@/store/type";
import { generateHash } from "@/sing/utility";

export const DEFAULT_TPQN = 480;
export const DEFAULT_BPM = 120;
export const DEFAULT_BEATS = 4;
export const DEFAULT_BEAT_TYPE = 4;

export const generatePhraseHash = async (obj: {
  singer: Singer | undefined;
  notesKeyShift: number;
  voiceKeyShift: number;
  tpqn: number;
  tempos: Tempo[];
  notes: Note[];
}) => {
  return generateHash(obj);
};

/**
 * 頻繁に変更される値を保持します。
 * 値変更時に実行する関数を登録できます。
 */
export class FrequentlyUpdatedState<T> {
  private _value: T;
  private listeners = new Set<(newValue: T) => void>();

  get value() {
    return this._value;
  }

  set value(newValue: T) {
    this._value = newValue;
    this.listeners.forEach((listener) => listener(newValue));
  }

  constructor(initialValue: T) {
    this._value = initialValue;
  }

  addValueChangeListener(listener: (newValue: T) => void) {
    if (this.listeners.has(listener)) {
      throw new Error("The listener already exists.");
    }
    this.listeners.add(listener);
    listener(this.value);
  }

  removeValueChangeListener(listener: (newValue: T) => void) {
    if (!this.listeners.has(listener)) {
      throw new Error("The listener does not exist.");
    }
    this.listeners.delete(listener);
  }
}

export type NoteInfo = {
  startTicks: number;
  endTicks: number;
  overlappingNoteIds: Set<string>;
};

export type OverlappingNoteInfos = Map<string, NoteInfo>;

/**
 * 重なっているノートを検出します。
 */
export function addNotesToOverlappingNoteInfos(
  prevNoteInfos: OverlappingNoteInfos,
  notes: Note[]
): OverlappingNoteInfos {
  const currentNoteInfos = new Map(prevNoteInfos.entries());
  for (const note of notes) {
    currentNoteInfos.set(note.id, {
      startTicks: note.position,
      endTicks: note.position + note.duration,
      overlappingNoteIds: new Set(),
    });
  }
  // TODO: 計算量がO(n^2)になっているので、区間木などを使用してO(nlogn)にする
  for (const note of notes) {
    const overlappingNoteIds = new Set<string>();
    for (const [noteId, noteInfo] of currentNoteInfos) {
      if (noteId === note.id) {
        continue;
      }
      if (noteInfo.startTicks >= note.position + note.duration) {
        continue;
      }
      if (noteInfo.endTicks <= note.position) {
        continue;
      }
      overlappingNoteIds.add(noteId);
    }

    const noteId1 = note.id;
    const noteInfo1 = currentNoteInfos.get(noteId1);
    if (!noteInfo1) {
      throw new Error("noteInfo1 is undefined.");
    }
    for (const noteId2 of overlappingNoteIds) {
      const noteInfo2 = currentNoteInfos.get(noteId2);
      if (!noteInfo2) {
        throw new Error("noteInfo2 is undefined.");
      }
      noteInfo2.overlappingNoteIds.add(noteId1);
      noteInfo1.overlappingNoteIds.add(noteId2);
    }
  }

  return currentNoteInfos;
}

export function removeNotesFromOverlappingNoteInfos(
  prevNoteInfos: OverlappingNoteInfos,
  notes: Note[]
): OverlappingNoteInfos {
  const currentNoteInfos = new Map(prevNoteInfos.entries());

  for (const note of notes) {
    const noteId1 = note.id;
    const noteInfo1 = currentNoteInfos.get(noteId1);
    if (!noteInfo1) {
      throw new Error("noteInfo1 is undefined.");
    }
    for (const noteId2 of noteInfo1.overlappingNoteIds) {
      const noteInfo2 = currentNoteInfos.get(noteId2);
      if (!noteInfo2) {
        throw new Error("noteInfo2 is undefined.");
      }
      noteInfo2.overlappingNoteIds.delete(noteId1);
      noteInfo1.overlappingNoteIds.delete(noteId2);
    }
  }
  for (const note of notes) {
    currentNoteInfos.delete(note.id);
  }

  return currentNoteInfos;
}

export function updateNotesOfOverlappingNoteInfos(
  prevNoteInfos: OverlappingNoteInfos,
  notes: Note[]
): OverlappingNoteInfos {
  let currentNoteInfos = removeNotesFromOverlappingNoteInfos(
    prevNoteInfos,
    notes
  );
  currentNoteInfos = addNotesToOverlappingNoteInfos(currentNoteInfos, notes);

  return currentNoteInfos;
}

export function getOverlappingNoteIds(
  currentNoteInfos: OverlappingNoteInfos
): Set<string> {
  const overlappingNoteIds = new Set<string>();
  for (const [noteId, noteInfo] of currentNoteInfos) {
    if (noteInfo.overlappingNoteIds.size !== 0) {
      overlappingNoteIds.add(noteId);
    }
  }
  return overlappingNoteIds;
}
