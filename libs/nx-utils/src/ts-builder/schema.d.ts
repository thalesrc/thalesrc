export interface TsBuilderExecutorSchema {
  /**
   * List of files to compile
   *
   * Paths are relative to the project root
   *
   * @default ['src/**\/*.ts', '!src/**\/*.spec.ts']
   */
  files?: string[];

  /**
   * Destination path relative to the workspace root
   *
   * @default 'dist'
   */
  outputPath?: string;

  /**
   * Path to the tsconfig file
   *
   * Start with './' or '../' to indicate a relative path, otherwise it will be considered an absolute path relative to the root of the workspace
   *
   * @default 'tsconfig.json'
   */
  tsConfigPath?: string;
}
