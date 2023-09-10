import { LibraryStoreState, LibraryStoreTypes } from "./type";
import { createPartialStore } from "./vuex";

export const libraryStoreState: LibraryStoreState = {
  libraryInstallStatuses: {},
  libraryInfoFetchStatuses: {},
};

export const libraryStore = createPartialStore<LibraryStoreTypes>({
  START_LIBRARY_DOWNLOAD_AND_INSTALL: {
    async action(
      { dispatch },
      { engineId, libraryId, libraryName, libraryDownloadUrl, librarySize }
    ) {
      await dispatch("UPDATE_LIBRARY_INSTALL_STATUS", {
        libraryId,
        status: {
          status: "pending",
        },
      });
      return await window.electron.startLibraryDownloadAndInstall({
        engineId,
        libraryId,
        libraryName,
        libraryDownloadUrl,
        librarySize,
      });
    },
  },

  UPDATE_LIBRARY_INSTALL_STATUS: {
    action: ({ commit }, { libraryId, status }) => {
      commit("SET_LIBRARY_INSTALL_STATUS", { libraryId, status });
    },
  },

  SET_LIBRARY_INSTALL_STATUS: {
    mutation: async (state, { libraryId, status }) => {
      state.libraryInstallStatuses = {
        ...state.libraryInstallStatuses,
        [libraryId]: status,
      };
    },
  },

  UNINSTALL_LIBRARY: {
    action: async ({ dispatch }, { engineId, libraryId, libraryName }) => {
      await dispatch("UPDATE_LIBRARY_INSTALL_STATUS", {
        libraryId,
        status: { status: "pending" },
      });
      return await window.electron.uninstallLibrary({
        engineId,
        libraryId,
        libraryName,
      });
    },
  },

  SET_LIBRARY_INFO_FETCH_STATUS: {
    action: ({ commit }, { engineId, status }) => {
      commit("SET_LIBRARY_INFO_FETCH_STATUS", { engineId, status });
    },
    mutation: async (state, { engineId, status }) => {
      state.libraryInfoFetchStatuses = {
        ...state.libraryInfoFetchStatuses,
        [engineId]: status,
      };
    },
  },
});
