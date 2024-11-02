interface Command {
  command: string;
  cwd?: string;
  readyWhen?: string;
  stopWhenReady?: boolean;
}

export interface RunParallelExecutorSchema {
  commands: Command[];
  cwd?: string;
}
