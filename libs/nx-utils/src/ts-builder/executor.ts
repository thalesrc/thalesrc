import { PromiseExecutor } from '@nx/devkit';
import { TsBuilderExecutorSchema } from './schema';
import { exec } from 'child_process';
import { OpenPromise } from '@thalesrc/js-utils';

const runExecutor: PromiseExecutor<TsBuilderExecutorSchema> = async (
  {
    tsConfigPath = 'tsconfig.json',
  },
  { projectName, projectsConfigurations: {
    projects: {
      [projectName]: { root }
    }
  } }
) => {
  const promise = new OpenPromise<void>();
  const normalizedTsConfigPath = tsConfigPath.startsWith('.') ? `${root}/${tsConfigPath}` : tsConfigPath;
  const ch = exec(`tsc -p ${normalizedTsConfigPath}`, { }, (err, stdout, stderr) => {
    console.log(err, stdout, stderr);
  });

  ch.on('exit', (code) => {
    console.log('Exit code:', code);
    promise.resolve();
  });

  await promise;

  return {
    success: true,
  };
};

export default runExecutor;

// gulp.task('ts:default', function () {
//   return gulp.src(files)
//     .pipe(sourcemaps.init())
//     .pipe(ts.createProject(tsConfigPath, {
//       declaration: true
//     })())
//     .pipe(sourcemaps.write('.'))
//     .pipe(gulp.dest(outputPath));
// });

// gulp.task('ts:commonjs', function () {
//   return gulp.src(files)
//     .pipe(ts.createProject(tsConfigPath, {
//       module: 'commonjs'
//     })())
//     .pipe(rename({ extname: '.cjs' }))
//     .pipe(gulp.dest(outputPath));
// });


