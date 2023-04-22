import { registerPlugin } from "@capacitor/core";

const loadPlugin = () => {
  const plugin =
    registerPlugin<{
      getVersion: () => Promise<{ value: string }>;
    }>("VoicevoxCore");

  plugin.getVersion().then((value) => {
    console.log(value.value);
  });
  return plugin;
};

export default loadPlugin;
