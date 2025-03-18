import '@thalesrc/js-utils/array/proto/async-map';

import { copyFile as fsCopyFile, readFile, writeFile, watch as fsWatch } from 'fs/promises';

import { ExecutorContext, logger } from '@nx/devkit';
import { arrayize, never } from "@thalesrc/js-utils";
import { config, parse } from 'dotenv';
import { glob } from 'glob';
//@ts-expect-error this import shows error but works anyway
import * as regexParser from 'regex-parser';
import * as sharp from 'sharp';

import { ensureDirectory } from "@thalesrc/node-utils";

import { CopyExecutorSchema } from './schema';

// Apply root .env config
config({ override: true });

const isWindows = process.platform === "win32";

interface Input {
  file: string;
  output: string;
  replace?: Map<RegExp, string>;
  resize?: {width: number; height: number; name: string;}
}

function getFileName(path: string) {
  return path.split(isWindows ? '\\' : '/').at(-1);
}

async function readReplaceWrite({ file, output, replace }: Input) {
  let fileContent = await readFile(file, 'utf-8');

  for (const [find, replaceStr] of replace) {
    fileContent = fileContent.replace(find, replaceStr);
  }

  await writeFile(`${output}/${getFileName(file)}`, fileContent, 'utf-8');
}

async function basicCopy({ file, output }: Input) {
  await fsCopyFile(file, `${output}/${getFileName(file)}`);
}

function resize({ file, output, resize: { width, height, name } }: Input) {
  const [fileName, ext] = getFileName(file).split('.');

  sharp(file).resize(width, height).toFile(`${output}/${name.replace('{name}', fileName).replace('{ext}', ext)}`);
}

async function copyFile(input: Input) {
  await ensureDirectory(input.output);

  if (input.replace)
    await readReplaceWrite(input);
  else if (input.resize)
    resize(input);
  else
    await basicCopy(input);

  logger.log(`Copied ${input.file} to ${input.output}`);
}

async function watchAndCopy(input: Input) {
  for await (const event of fsWatch(input.file)) {
    if (event.eventType !== 'change') {
      logger.error(`Stopped watching '${input.file}'`);

      break;
    }

    logger.log(`'${input.file}' is changed.`);
    await copyFile(input);
  }
}

export default async function runExecutor(
  { output, input, watch = false }: CopyExecutorSchema,
  { projectGraph: { nodes }, projectName }: ExecutorContext
) {
  // Prepends project root path when the path starts with `.` or `/`
  function normalizePath(path: string) {
    return /^[/.]/.test(path) ? `${nodes[projectName].data.root}/${path.replace(/(^\.?\/)/g, '')}` : path;
  }

  // Apply project .env config
  const projectEnv = parse(`${nodes[projectName].data.root}/.env`);
  Object.assign(process.env, projectEnv);

  // Get default output path
  const baseOutput = normalizePath(output);
  // Adjust inputs
  const inputsWithGlobs = await arrayize(input)
    .asyncMap(async (item) => typeof item === 'string' ? {
        glob: await glob(normalizePath(item)),
        output: baseOutput
      } : {
        glob: await glob(normalizePath(item.path)),
        output: item.output ? normalizePath(item.output) : baseOutput,
        replace: !item.replace ? undefined : new Map(Object.entries(item.replace).map(([find, replace]) => [
          regexParser(find),
          replace.replace(/(#{\w+})/gm, match => process.env[match.replace(/#{(\w+)}/g, '$1')])
        ])),
        resize: !item.resize
          ? undefined
          : typeof item.resize === 'number'
          ? [{ width: item.resize, height: item.resize, name: '{name}.{ext}' }]
          : item.resize instanceof Array
          ? [{ width: item.resize[0], height: item.resize[1], name: '{name}.{ext}' }]
          : Object.entries(item.resize).map(([key, value]) => ({ width: +key.split('x')[0], height: +key.split('x')[1], name: value }))
      });
  // Populate all files into single array
  const inputs: Input[] = inputsWithGlobs
    .map(({ glob, ...rest }) => glob.map(file => ({ file, ...rest })))
    .flat()
    .map(({ resize, ...rest }) => !resize ? rest : resize.map(r => ({ resize: r, ...rest })))
    .flat();

  await Promise.all(inputs.map(input => copyFile(input)));

  if (!watch) {
    return {
      success: true,
    };
  }

  for (const input of inputs) {
    watchAndCopy(input);
  }

  logger.info('Started watching. Waiting for file changes');

  return await never();
}
