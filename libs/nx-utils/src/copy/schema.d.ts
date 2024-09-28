export interface Input {
	/**
	 * File glob
	 */
	path: string;

	/**
	 * Output path
	 */
	output?: string;

	/**
	 * Replace strings in file content
	 */
	replace?: Record<string, string>;

	/**
	 * Resize an image
	 * 
	 * Exp:
	 * ```
	 * resize: 40 // width 40px height 40px
	 * resize: [80, 60] // width 80px height 60px
	 * resize: { // create multiple copies
	 *   "20x20": "{name}-20x20.{ext}",
	 *   "40x40": "{name}-40x40.{ext}",
	 *   "128x128": "{name}-128x128.{ext}",
	 * }
	 * ```
	 */
	resize?: number | [number, number] | Record<string, string>
}

export interface CopyExecutorSchema {
	/**
	 * File glob pattern
	 */
	input: string | Input | Array<string | Input>;

	/**
	 * Base output
	 */
	output?: string;

	/**
	 * Watch file changes
	 * @default false
	 */
	watch?: boolean;
}
