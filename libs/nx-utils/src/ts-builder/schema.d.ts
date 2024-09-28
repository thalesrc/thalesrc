export interface TsBuilderExecutorSchema {
  /**
   * Path to the tsconfig file
   *
   * Start with './' or '../' to indicate a relative path, otherwise it will be considered an absolute path relative to the root of the workspace
   *
   * @default 'tsconfig.json'
   */
  tsConfigPath?: string;
}
