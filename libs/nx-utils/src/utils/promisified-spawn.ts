import { spawn } from 'child_process';
import { logger } from "@nx/devkit";

export async function promisifiedSpawn(command: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { shell: true });

    child.stdout.on('data', (data) => {
      logger.log(data.toString());
    });

    child.stderr.on('data', (data) => {
      logger.error(data.toString());
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
  });
}
