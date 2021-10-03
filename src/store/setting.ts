import { HotkeyAction, HotkeySetting, SavingSetting } from "@/type/preload";
import {
  SettingActions,
  SettingGetters,
  SettingMutations,
  VoiceVoxStoreOptions,
} from "./type";
import Mousetrap from "mousetrap";

const hotkeyFunctionCache: Record<string, () => any> = {};

export const settingStore: VoiceVoxStoreOptions<
  SettingGetters,
  SettingActions,
  SettingMutations
> = {
  getters: {
    GET_SAVING_SETTING(state) {
      return state.savingSetting;
    },
  },
  mutations: {
    SET_SAVING_SETTING(
      state,
      { savingSetting }: { savingSetting: SavingSetting }
    ) {
      state.savingSetting = savingSetting;
    },
    SET_HOTKEY_SETTINGS(
      state,
      { hotkeySettings }: { hotkeySettings: HotkeySetting[] }
    ) {
      state.hotkeySettings = hotkeySettings;
    },
  },
  actions: {
    GET_SAVING_SETTING({ commit }) {
      const newData = window.electron.savingSetting();
      newData.then((savingSetting) => {
        commit("SET_SAVING_SETTING", { savingSetting: savingSetting });
      });
    },
    SET_SAVING_SETTING({ commit }, { data }: { data: SavingSetting }) {
      const newData = window.electron.savingSetting(data);
      newData.then((savingSetting) => {
        commit("SET_SAVING_SETTING", { savingSetting: savingSetting });
      });
    },
    GET_HOTKEY_SETTINGS({ commit }) {
      const hotkeys = window.electron.hotkeySettings();
      hotkeys.then((value) => {
        value.forEach((item) => {
          if (hotkeyFunctionCache[item.action] !== undefined) {
            Mousetrap.bind(
              hotkey2Combo(item.combination),
              hotkeyFunctionCache[item.action]
            );
          }
        });
        commit("SET_HOTKEY_SETTINGS", {
          hotkeySettings: value,
        });
      });
    },
    SET_HOTKEY_SETTINGS({ state, commit }, { data }: { data: HotkeySetting }) {
      const hotkeys = window.electron.hotkeySettings(data);
      state.hotkeySettings.forEach((item) => {
        if (item.action == data.action) {
          // pass the hotkey actions implemented with native js
          if (hotkeyFunctionCache[data.action] !== undefined) {
            if (item.combination != "") {
              Mousetrap.unbind(hotkey2Combo(item.combination));
            }
            if (data.combination != "") {
              Mousetrap.bind(
                hotkey2Combo(data.combination),
                hotkeyFunctionCache[data.action]
              );
            }
          }
        }
      });
      hotkeys.then((value) => {
        commit("SET_HOTKEY_SETTINGS", {
          hotkeySettings: value,
        });
      });
      return hotkeys;
    },
  },
};

export const setHotkeyFunctions = (
  actionKeys: HotkeyAction[],
  hotkeyActionFunctions: (() => any)[]
): void => {
  for (let i = 0; i < actionKeys.length; i++) {
    hotkeyFunctionCache[actionKeys[i]] = hotkeyActionFunctions[i];
  }
};

const hotkey2Combo = (hotkeyCombo: string) => {
  return hotkeyCombo.toLowerCase().replace(" ", "+");
};

export const parseCombo = (event: KeyboardEvent): string => {
  let recordedCombo = "";
  if (event.ctrlKey) {
    recordedCombo += "Ctrl ";
  }
  if (event.altKey) {
    recordedCombo += "Alt ";
  }
  if (event.shiftKey) {
    recordedCombo += "Shift ";
  }
  if (event.key === " ") {
    recordedCombo += "Space";
  } else {
    recordedCombo += event.key.length > 1 ? event.key : event.key.toUpperCase();
  }
  return recordedCombo;
};
