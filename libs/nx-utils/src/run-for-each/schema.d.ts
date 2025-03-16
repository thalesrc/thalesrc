export interface RunForEachExecutorSchema {
  /**
   * List of items to run the command for
   */
  items: string[];

  /**
   * Command to run for each item
   *
   * <<item>> will be replaced with the item
   */
  command: string;
}
