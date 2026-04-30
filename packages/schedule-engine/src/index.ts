export interface ScheduleRunOptions {
  mode?: "save" | "publish" | string;
}

export interface ScheduleIssue {
  level: "error" | "warn" | "info" | string;
  module?: string;
  message: string;
  [key: string]: unknown;
}

export interface ScheduleRunResult {
  issues: ScheduleIssue[];
  [key: string]: unknown;
}

type BrowserEngine = {
  run(input: unknown, options?: ScheduleRunOptions): ScheduleRunResult;
};

declare global {
  interface Window {
    ProjectScheduleEngine?: BrowserEngine;
  }
}

export function runScheduleEngine(input: unknown, options: ScheduleRunOptions = {}): ScheduleRunResult {
  if (typeof window !== "undefined" && window.ProjectScheduleEngine) {
    return window.ProjectScheduleEngine.run(input, options);
  }
  return {
    issues: [
      {
        level: "warn",
        module: "schedule-engine",
        message: "排程引擎包已初始化；Node 端纯函数迁移将在后续阶段替换 legacy 浏览器实现。",
      },
    ],
  };
}
