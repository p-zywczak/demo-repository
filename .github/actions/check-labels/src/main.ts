import * as core from '@actions/core';

async function run(): Promise<void> {
    const requiredLabels = JSON.parse(core.getInput('required_labels')) as string[];
    const anyOfLabels = JSON.parse(core.getInput('any_of_labels')) as string[];
    core.info(`🔍 Sprawdzam wymagane etykiety: ${requiredLabels.join(', ')}`);
    core.info(`🔍 Sprawdzam przynajmniej jedną z etykiet: ${anyOfLabels.join(', ')}`);
}

run();