/**
 * A record of aliases to replace in the script.
 */
type Alias = Record<string, string | number | boolean>;

export interface PlatformRunnerExecutorSchema {
  /**
   * The script to execute.
   *
   * Wrap the alias names with <<>> to replace them with the corresponding values.
   */
  script: string;

  /**
   * The default aliases to replace in the script.
   *
   * If the platform-specific aliases are not provided, the default aliases are used.
   */
  default: Alias;

  /**
   * Windows-specific aliases to replace in the script.
   */
  win32?: Alias;

  /**
   * macOS-specific aliases to replace in the script.
   */
  darwin?: Alias;

  /**
   * Linux-specific aliases to replace in the script.
   */
  linux?: Alias;

  /**
   * AIX-specific aliases to replace in the script.
   */
  aix?: Alias;

  /**
   * FreeBSD-specific aliases to replace in the script.
   */
  freebsd?: Alias;

  /**
   * OpenBSD-specific aliases to replace in the script.
   */
  openbsd?: Alias;

  /**
   * SunOS-specific aliases to replace in the script.
   */
  sunos?: Alias;

  /**
   * Android-specific aliases to replace in the script.
   */
  android?: Alias;
}
