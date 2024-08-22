// helloWorld.ts

import * as fs from "fs";
import * as zlib from "zlib";

function _decodeParam(value: string): any {
  // Decode from base64
  const decoded = Buffer.from(value, "base64");
  // Decompress with zlib
  const decompressed = zlib.inflateSync(decoded);
  // Deserialize from JSON
  return JSON.parse(decompressed.toString("utf-8"));
}

// Accessing a specific environment variable
function _getEnvVar(key: string): string {
  const myEnvVar = process.env[key];
  if (myEnvVar) {
    return myEnvVar;
  } else {
    return "";
  }
}

function getPipesContext(): any {
  // first, get the env var value for where the pipes context is stored
  const encodedPipesContextParam = _getEnvVar("DAGSTER_PIPES_CONTEXT");
  // then, decode the base64 encoded string
  const decodedPipesContextParam = _decodeParam(encodedPipesContextParam);
  const path = decodedPipesContextParam.path;
  const pipesContext = JSON.parse(fs.readFileSync(path, "utf-8"));
  return pipesContext;
}

function setPipesMessages(message: any) {
  // TODO: this can be better - wrap in a class so de/encode is done in the constructor

  // first, get the env var value for where the pipes message is stored
  const encodedPipesMessagesParam = _getEnvVar("DAGSTER_PIPES_MESSAGES");
  // then, decode the base64 encoded string
  const decodedPipesMessagesParam = _decodeParam(encodedPipesMessagesParam);
  const path = decodedPipesMessagesParam.path;

  fs.appendFileSync(path, JSON.stringify(message) + "\n");
}

async function main() {
  const pipesContext = getPipesContext();

  // HIGHLIGHT 1: get the asset key from the pipes context
  const asset_key = pipesContext.asset_keys[0];
  const message = `Hello, ${asset_key}!`;

  // HIGHLIGHT 2: this will be logged to stdout and
  // captured by dagster (you can find it in UI: run logs > stdout)
  console.log(message);

  async function runCountdown(count: number) {
    if (count < 1) return;

    await new Promise<void>((resolve) => {
      setTimeout(() => {
        // HIGHLIGHT 3: report the countdown back to dagster
        setPipesMessages({
          method: "log",
          params: { message: `Countdown Timer: ${count}` },
        });
        resolve();
      }, 1000);
    });

    // Recursively call runCountdown for the next number
    await runCountdown(count - 1);
  }

  // get the total count from the pipes context, passed as an extra
  const totalCount = pipesContext.extras["total_count"];
  await runCountdown(totalCount);

  setPipesMessages({ method: "log", params: { message: "Yay!" } });
}

main();
