export interface WatchExecutorSchema {
  /**
   * The glob or globs to watch
   */
  glob: string | string[];

  /**
   * The command or commands to run when the glob or globs change
   */
  command: string | string[];
}
