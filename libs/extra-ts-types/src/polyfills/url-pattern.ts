/**
 * URLPatternInit is used to initialize a URLPattern object.
 * It contains patterns for the individual URL components.
 */
export interface URLPatternInit {
  /**
   * A string containing a pattern for the protocol part of a URL.
   */
  protocol?: string;

  /**
   * A string containing a pattern for the username part of a URL.
   */
  username?: string;

  /**
   * A string containing a pattern for the password part of a URL.
   */
  password?: string;

  /**
   * A string containing a pattern for the hostname part of a URL.
   */
  hostname?: string;

  /**
   * A string containing a pattern for the port part of a URL.
   */
  port?: string;

  /**
   * A string containing a pattern for the pathname part of a URL.
   */
  pathname?: string;

  /**
   * A string containing a pattern for the search part of a URL.
   */
  search?: string;

  /**
   * A string containing a pattern for the hash part of a URL.
   */
  hash?: string;

  /**
   * A string representing a base URL to use in cases where the input pattern is a relative URL.
   */
  baseURL?: string;
}

/**
 * URLPatternComponentResult contains the matched text and groups for a URL component.
 */
export interface URLPatternComponentResult {
  /**
   * The matched string for this component.
   */
  input: string;

  /**
   * An object containing the matched groups for this component.
   * The keys are the group names and the values are the matched text.
   */
  groups: Record<string, string | undefined>;
}

/**
 * URLPatternResult contains the results of matching a URL against a pattern.
 */
export interface URLPatternResult {
  /**
   * An array of the matched input strings.
   */
  inputs: [string] | [URLPatternInit];

  /**
   * The result for the protocol component.
   */
  protocol: URLPatternComponentResult;

  /**
   * The result for the username component.
   */
  username: URLPatternComponentResult;

  /**
   * The result for the password component.
   */
  password: URLPatternComponentResult;

  /**
   * The result for the hostname component.
   */
  hostname: URLPatternComponentResult;

  /**
   * The result for the port component.
   */
  port: URLPatternComponentResult;

  /**
   * The result for the pathname component.
   */
  pathname: URLPatternComponentResult;

  /**
   * The result for the search component.
   */
  search: URLPatternComponentResult;

  /**
   * The result for the hash component.
   */
  hash: URLPatternComponentResult;
}

/**
 * The URLPattern API provides a way to match URLs against a pattern.
 * The pattern syntax is based on the path-to-regexp library used in Express.js.
 *
 * @example
 * ```typescript
 * const pattern = new URLPattern({ pathname: '/books/:id' });
 * const result = pattern.exec('https://example.com/books/123');
 * console.log(result?.pathname.groups.id); // '123'
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URLPattern
 */
export interface URLPattern {
  /**
   * The pattern string for the protocol component.
   */
  readonly protocol: string;

  /**
   * The pattern string for the username component.
   */
  readonly username: string;

  /**
   * The pattern string for the password component.
   */
  readonly password: string;

  /**
   * The pattern string for the hostname component.
   */
  readonly hostname: string;

  /**
   * The pattern string for the port component.
   */
  readonly port: string;

  /**
   * The pattern string for the pathname component.
   */
  readonly pathname: string;

  /**
   * The pattern string for the search component.
   */
  readonly search: string;

  /**
   * The pattern string for the hash component.
   */
  readonly hash: string;

  /**
   * Tests whether the given input matches the pattern.
   *
   * @param input - A string or URLPatternInit object to test against the pattern.
   * @param baseURL - An optional base URL to use for relative URLs.
   * @returns true if the input matches the pattern, false otherwise.
   */
  test(input: string | URLPatternInit, baseURL?: string): boolean;

  /**
   * Executes the pattern match against the given input and returns the result.
   *
   * @param input - A string or URLPatternInit object to match against the pattern.
   * @param baseURL - An optional base URL to use for relative URLs.
   * @returns A URLPatternResult object if the input matches, or null if it doesn't match.
   */
  exec(input: string | URLPatternInit, baseURL?: string): URLPatternResult | null;
}

/**
 * The URLPattern constructor creates a new URLPattern object.
 */
export interface URLPatternConstructor {
  prototype: URLPattern;

  /**
   * Creates a new URLPattern object.
   *
   * @param input - A string or URLPatternInit object containing the pattern.
   * @param baseURL - An optional base URL to use for relative patterns.
   *
   * @example
   * ```typescript
   * // Pattern from string
   * const pattern1 = new URLPattern('https://example.com/books/:id');
   *
   * // Pattern from object
   * const pattern2 = new URLPattern({ pathname: '/books/:id' });
   *
   * // Pattern with base URL
   * const pattern3 = new URLPattern('/books/:id', 'https://example.com');
   * ```
   */
  new (input: string | URLPatternInit, baseURL?: string): URLPattern;
}

declare global {
  /**
   * The URLPattern API provides a way to match URLs against a pattern.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/URLPattern
   */
  var URLPattern: URLPatternConstructor;
}
