export function globCommandParser(command: string, path: string): string {
  const [fileName, fileExt] = path.split(/[\\/]/ig).pop().split('.');

  return command
      .replace(/<fileName>/ig, fileName)
      .replace(/<path>/ig, path)
      .replace(/<fileExt>/ig, fileExt);
}
