export interface WatchExecutorSchema {
  /**
   * The glob or globs to watch
   */
  glob: string | string[];

  /**
   * The command or commands to run when the glob or globs change
   *
   * <path> will be replaced with the path to the file
   * <fileName> will be replaced with the file name
   * <fileExt> will be replaced with the file extension
   */
  command: string | string[];
}
