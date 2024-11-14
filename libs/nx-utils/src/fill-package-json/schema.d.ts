export type ExportType = 'require' | 'default' | 'import' | 'node' | 'types';

export interface FillPackageJsonExecutorSchema {
  /**
   * Output path for the package.json file
   */
  outputPath: string;

  /**
   * Version to set in the package.json file
   */
  packageVersion?: string;

  /**
   *
   * @default false
   */
  populateExports?: false | {
    /**
     * @default ['require', 'default', 'import', 'node', 'types']
     */
    exports: ExportType[];

    /**
     * @default '_exports'
     */
    exportsTemplateProperty?: string;

    /**
     * @default 'index.js'
     */
    barrelFileName?: string;

    templates?: {
      /**
       * @default '<path>.cjs'
       */
      require?: string;

      /**
       * @default '<path>.cjs'
       */
      default?: string;

      /**
       * @default '<path>.js'
       */
      import?: string;

      /**
       * @default '<path>.cjs'
       */
      node?: string;

      /**
       * @default '<path>.d.ts'
       */
      types?: string;
    }
  };
}
