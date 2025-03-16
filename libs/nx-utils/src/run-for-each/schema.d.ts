export interface RunForEachExecutorSchema {
  /**
   * Command to run for each item
   *
   * <item> will be replaced with the item
   */
  command: string;

  /**
   * List of items to run the command for
   */
  items?: string[];

  /**
   * Glob to get items from
   *
   * \<path\> will be replaced with the path to the file
   * \<fileName\> will be replaced with the file name
   * \<fileExt\> will be replaced with the file extension
   */
  glob?: string;

  /**
   * Run the commands in parallel
   *
   * Default: true
   */
  parallel?: boolean;
}
