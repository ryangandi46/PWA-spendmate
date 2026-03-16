import * as dotenv from "dotenv";
dotenv.config();
import { AIEngine } from "./src/services/ai-engine";
import { prisma } from "./src/lib/prisma";

async function main() {
  console.log("Running AI Engine manually...");
  await AIEngine.runPipeline();
  console.log("AI Engine completed.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
