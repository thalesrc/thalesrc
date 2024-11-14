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
       * @default '<path>.js'
       */
      require?: string;

      /**
       * @default '<path>.mjs'
       */
      default?: string;

      /**
       * @default '<path>.mjs'
       */
      import?: string;

      /**
       * @default '<path>.js'
       */
      node?: string;

      /**
       * @default '<path>.d.ts'
       */
      types?: string;
    }
  };
}
