import { PlatformRunnerExecutorSchema } from "../platform-runner/schema";

export interface WatchExecutorSchema {
  /**
   * The glob or globs to watch
   */
  glob: string | string[];

  /**
   * The command or commands to run whenever the glob or globs detect a change
   *
   * \<path\> will be replaced with the path to the file
   * \<fileName\> will be replaced with the file name
   * \<fileExt\> will be replaced with the file extension
   */
  command: string | string[];

  /**
   * The platform-specific variables to replace in the command
   *
   * <<variableName>> will be replaced with the value of the variable
   */
  platformVariables?: Omit<PlatformRunnerExecutorSchema, 'script'>;
}
