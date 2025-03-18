const core = require('@actions/core');

try {
  const input = core.getInput('example_input');
  console.log(`Wartość input: ${input}`);
  // Twoja logika...
  core.setOutput("result", "sukces");
} catch (error) {
  core.setFailed(error.message);
}
