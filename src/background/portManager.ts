import { execFileSync } from "child_process";
import log from "electron-log";

const isWindows = process.platform === "win32";

export class PortManager {
  constructor(private hostname: string, private port: number) {}

  /**
   * ex) url: `http://localhost:50021`
   *  host -> `localhost`
   *  port -> `50021`
   */

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  portLog = (...message: any) => log.info(`PORT ${this.port}: ${message}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  portWarn = (...message: any) => log.warn(`PORT ${this.port}: ${message}`);

  public getUrl(isHttps = false): string {
    return `${isHttps ? "https" : "http"}://${this.hostname}:${this.port}`;
  }

  /**
   * "netstat -ano" の stdout から, 指定したポートを使用しているプロセスの process id を取得する
   *
   * ex) stdout:
   * ``` cmd
   * TCP  127.0.0.1:5173   127.0.0.1:50170  TIME_WAIT  0
   * TCP  127.0.0.1:6463   0.0.0.0:0        LISTENING  18692
   * TCP  127.0.0.1:50021  0.0.0.0:0        LISTENING  17320
   * ```
   * -> `17320`
   *
   * @param stdout netstat の stdout
   * @returns `process id` or `undefined` (ポートが使用されていないとき)
   */
  private stdout2processId(stdout: string): number | undefined {
    const lines = stdout.split("\n");
    for (const line of lines) {
      if (line.includes(`${this.hostname}:${this.port}`)) {
        const parts = line.trim().split(/\s+/);
        return parseInt(parts[parts.length - 1], 10);
      }
    }
    return undefined;
  }

  async getProcessIdFromPort(): Promise<number | undefined> {
    this.portLog("Getting process id...");
    const exec = isWindows
      ? {
          cmd: "netstat",
          args: ["-ano"],
        }
      : {
          cmd: "lsof",
          args: ["-i", `:${this.port}`, "-t", "-sTCP:LISTEN"],
        };

    this.portLog(`Running command: "${exec.cmd} ${exec.args.join(" ")}"`);

    let stdout = execFileSync(exec.cmd, exec.args, {
      shell: true,
    }).toString();

    // windows
    if (isWindows) {
      stdout = this.stdout2processId(stdout)?.toString() ?? "";
    }

    // bash
    if (!stdout || !stdout.length) {
      this.portLog("Assignable; Nobody uses this port!");
      return undefined;
    }
    this.portWarn(`Nonassignable; pid=${stdout} uses this port!`);
    return parseInt(stdout);
  }

  async getProcessNameFromPid(pid: number): Promise<string> {
    this.portLog(`Getting process name from pid=${pid}...`);
    const exec = isWindows
      ? // TODO: `TCPポートの除外範囲` というものがあって, そこに該当しているかを確認する
        {
          cmd: "wmic",
          args: ["process", "where", `"ProcessID=${pid}"`, "get", "name"],
        }
      : // TODO: MacOS だとroot権限が必要かも？  場合によって, 代替コマンド `ss` や `fuser` を使うかも
        {
          cmd: "ps",
          args: ["-p", pid.toString(), "-o", "comm="],
        };

    let stdout = execFileSync(exec.cmd, exec.args, { shell: true }).toString();

    if (isWindows) {
      /*
       * ex) stdout:
       * ```
       * Name
       * node.exe
       * ```
       * -> `node.exe`
       */
      stdout = stdout.split("\r\n")[1];
    }

    this.portLog(`Found process name: ${stdout}`);

    return stdout.trim();
  }

  /**
   * 割り当て可能な他のポートを探します
   *
   * @returns 割り当て可能なポート番号 or `undefined` (割り当て可能なポートが見つからなかったとき)
   */
  async findAltPort(): Promise<number | undefined> {
    this.portLog(`Find another assignable port from ${this.port}...`);
    const altPortMax = 50100;

    for (let altPort = this.port + 1; altPort <= altPortMax; altPort++) {
      this.portLog(`Trying whether port ${altPort} is assignable...`);
      const altPid = await new PortManager(
        this.hostname,
        altPort
      ).getProcessIdFromPort();

      // ポートを既に割り当てられているプロセスidの取得: undefined → ポートが空いている
      if (altPid === undefined) return altPort;
    }

    this.portWarn(`No alternative port found! ${this.port}...${altPortMax}`);
    return undefined;
  }
}
