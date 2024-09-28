import { PromiseExecutor } from '@nx/devkit';
import { FillPackageJsonExecutorSchema } from './schema';
import { tryCatch } from '@thalesrc/js-utils/promise/try-catch';
import { ensureDirectory } from '@thalesrc/node-utils';
import { writeFile } from 'fs/promises';

const runExecutor: PromiseExecutor<FillPackageJsonExecutorSchema> = async (
  { outputPath, packageVersion },
  {
    projectName,
    projectsConfigurations: {
      projects: {
        [projectName]: { root }
      }
    }
  }
) => {
  const [rootErr, rootPackageJson] = await tryCatch(import(`package.json`));
  const [packageErr, packagePackageJson] = await tryCatch(import(`${root}/package.json`));

  if (packageErr || rootErr) {
    console.error('Error reading package.json');

    return {
      success: false,
    };
  }

  for (const key in packagePackageJson.dependencies) {
    if (packagePackageJson.dependencies[key] !== '*') continue;

    packagePackageJson.dependencies[key] = rootPackageJson.dependencies[key];
  }

  if (packageVersion) {
    packagePackageJson.version = packageVersion;
    console.log('Version is set to', packageVersion);
  }

  await ensureDirectory(outputPath);

  const [writeErr] = await tryCatch(writeFile(`${outputPath}/package.json`, JSON.stringify(packagePackageJson, null, 2)));

  if (writeErr) {
    console.error('Error writing package.json', writeErr);

    return {
      success: false,
    };
  }

  console.log('package.json is successfully written to', outputPath);

  return {
    success: true
  };
};

export default runExecutor;
