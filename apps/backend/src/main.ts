import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = [
    process.env.FRONTEND_URL ?? "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:3002",
    "http://127.0.0.1:12668",
    ...(process.env.REPLIT_DOMAINS
      ? process.env.REPLIT_DOMAINS.split(",").map((d) => `https://${d.trim()}`)
      : []),
  ];
  app.enableCors({ 
    origin: allowedOrigins, 
    credentials: true 
  });
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`TuitionMedia backend at http://localhost:${port}`);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
