import "dotenv/config";
import { buildApp } from "./app";

const port = Number(process.env.PORT ?? 3333);
const app = buildApp();

app.listen(port, () => {
  console.log(`\n  ► API ProcessMap rodando em http://localhost:${port}`);
  console.log(`  ► Health:  http://localhost:${port}/health`);
  console.log(`  ► REST:    http://localhost:${port}/api\n`);
});
