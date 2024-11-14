import { PromiseExecutor } from '@nx/devkit';
import { FillPackageJsonExecutorSchema } from './schema';
import { tryCatch } from '@thalesrc/js-utils/promise/try-catch';
import { ensureDirectory } from '@thalesrc/node-utils';
import { writeFile } from 'fs/promises';

const runExecutor: PromiseExecutor<FillPackageJsonExecutorSchema> = async (
  { outputPath, packageVersion, populateExports },
  {
    projectName,
    projectsConfigurations: {
      projects: {
        [projectName]: { root }
      }
    }
  }
) => {
  // Read package.json files
  const [rootErr, rootPackageJson] = await tryCatch(import(`package.json`));
  const [packageErr, packagePackageJson] = await tryCatch(import(`${root}/package.json`));

  if (packageErr || rootErr) {
    console.error('Error reading package.json');

    return {
      success: false,
    };
  }

  // Replace * dependencies with the root dependencies
  for (const key in packagePackageJson.dependencies) {
    if (packagePackageJson.dependencies[key] !== '*') continue;

    packagePackageJson.dependencies[key] = { ...rootPackageJson.devDependencies, ...rootPackageJson.dependencies }[key];
  }

  // Fill package.json fields
  for (const key of ['bugs', 'license', 'homepage', 'repository', 'author', 'funding']) {
    if (packagePackageJson[key]) continue;

    packagePackageJson[key] = rootPackageJson[key];
  }

  // Set version if it is provided
  if (packageVersion) {
    packagePackageJson.version = packageVersion;
    console.log('Version is set to', packageVersion);
  }

  if (populateExports) {
    const {
      exports = ['default', 'import', 'node', 'require', 'types'],
      exportsTemplateProperty = '_exports',
      barrelFileName = 'index',
      templates: configTemplates = {}
    } = populateExports;
    const templates = Object.assign({
      require: '<path>.js',
      default: '<path>.mjs',
      import: '<path>.mjs',
      node: '<path>.js',
      types: '<path>.d.ts',
    }, configTemplates);
    const exportsObject = {
      '.': exports.reduce((acc, field) => (acc[field] = `./${templates[field].replace('<path>', barrelFileName)}`, acc), {})
    };

    for (const exp of packagePackageJson[exportsTemplateProperty] ?? []) {
      exportsObject[`./${exp}`.replace(/\/$/, '')] = exports.reduce((acc, field) => {
        acc[field] = `./${templates[field].replace('<path>', exp.endsWith('/') ? `${exp}${barrelFileName}` : exp)}`;

        return acc;
      }, {});
    }

    packagePackageJson.exports = {
      ...packagePackageJson.exports ?? {},
      ...exportsObject
    };

    delete packagePackageJson[exportsTemplateProperty];

    console.log('Exports are populated');
  }

  // Prepare output path
  await ensureDirectory(outputPath);

  // Write package.json
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
