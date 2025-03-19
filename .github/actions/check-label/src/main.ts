import * as core from '@actions/core';

async function run(): Promise<void> {
  try {
    const name: string = core.getInput('name');
    core.info(`Witaj, ${name}! To twoja pierwsza własna akcja w TS!`);

    core.setOutput('greeting', `Cześć ${name}, akcja zakończona sukcesem!`);
  } catch (error) {
    core.setFailed((error as Error).message);
  }
}

run();