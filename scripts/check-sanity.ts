import { checkSanityConnectivity } from "../src/sanity/health";

async function main() {
  const result = await checkSanityConnectivity();

  if (result.ok) {
    console.log(result.message);
  } else {
    console.error(result.message);
    process.exitCode = 1;
  }
}

void main();
