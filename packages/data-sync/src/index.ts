import { spawn } from "node:child_process";
import path from "node:path";

export interface DataSyncOptions {
  projectRoot?: string;
  scriptPath?: string;
}

export interface DataSyncResult {
  ok: true;
  stdout: string;
  stderr: string;
}

function resolveProjectRoot(projectRoot?: string) {
  return projectRoot ? path.resolve(projectRoot) : process.cwd();
}

export function runStructureSync(options: DataSyncOptions = {}): Promise<DataSyncResult> {
  const projectRoot = resolveProjectRoot(options.projectRoot);
  const scriptPath = options.scriptPath || path.join(projectRoot, "项目结构数据", "sync_database_config.mjs");

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      cwd: projectRoot,
      shell: false,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      reject(error);
    });
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ ok: true, stdout, stderr });
        return;
      }
      const error = new Error(`数据同步脚本失败，退出码 ${code}。\n${stderr || stdout}`);
      reject(error);
    });
  });
}
