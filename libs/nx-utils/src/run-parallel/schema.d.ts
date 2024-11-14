interface Command {
  /**
   * The command to run
   */
  command: string;

  /**
   * The directory to run the command in
   */
  cwd?: string;

  /**
   * The string or strings to look for in the output to determine if the task is ready to continue to the next task
   */
  readyWhen?: string | string[];

  /**
   * Whether to stop the running child process of the command when the task is ready to continue to the next task
   */
  stopWhenReady?: boolean;
}

export interface RunParallelExecutorSchema {
  /**
   * The commands to run in parallel but sequentially
   */
  commands: Command[];

  /**
   * The default directory to run the commands in
   */
  cwd?: string;
}
