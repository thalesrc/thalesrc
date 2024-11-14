import { PromiseExecutor } from '@nx/devkit';
import { TsBuilderExecutorSchema } from './schema';
import * as gulp from 'gulp';
import * as ts from 'gulp-typescript';
import * as sourcemaps from 'gulp-sourcemaps';
import * as rename from 'gulp-rename';

function promisifyStream(stream: NodeJS.ReadableStream) {
  return new Promise((resolve, reject) => {
    stream.on('end', resolve);
    stream.on('error', reject);
  });
}

const runExecutor: PromiseExecutor<TsBuilderExecutorSchema> = async (
  {
    files = ['src/**/*.ts', '!src/**/*.spec.ts'],
    tsConfigPath = './tsconfig.json',
    outputPath = 'dist',
  },
  { projectName, root: workspaceRoot, projectsConfigurations: {
    projects: {
      [projectName]: { root }
    }
  } }
) => {
  const normalizedTsConfigPath = tsConfigPath.startsWith('.') ? `${root}/${tsConfigPath}` : `${workspaceRoot}/${tsConfigPath}`;

  function getFileStream() {
    return gulp.src(files.map(file => file.startsWith('!') ? `!${root}/${file.substring(1)}` : `${root}/${file}`));
  }

  function getDestStream() {
    return gulp.dest(`${workspaceRoot}/${outputPath}`);
  }

  function defaultTask() {
    return promisifyStream(getFileStream()
      .pipe(sourcemaps.init())
      .pipe(ts.createProject(normalizedTsConfigPath, {
        module: 'ESNext',
        declaration: true
      })())
      .pipe(sourcemaps.write('.'))
      .pipe(getDestStream()));
  }

  function commonjsTask() {
    return promisifyStream(getFileStream()
      .pipe(ts.createProject(normalizedTsConfigPath, {
        module: 'CommonJS',
        declaration: false,
      })())
      .pipe(getDestStream()));
  }

  function renameDefault() {
    return promisifyStream(
      gulp.src(`${workspaceRoot}/${outputPath}/**/*.js`)
        .pipe(rename({ extname: '.mjs' }))
        .pipe(gulp.dest(`${workspaceRoot}/${outputPath}`))
    );
  }

  await defaultTask();
  await renameDefault();
  await commonjsTask();

  return {
    success: true,
  };
};

export default runExecutor;


