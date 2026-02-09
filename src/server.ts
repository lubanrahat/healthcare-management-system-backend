import http from "http";
import { env } from "./config/env";
import createApp from "./app";
import { logger } from "./shared/logger/logger";

function main() {
  try {
    const PORT = +(env.PORT ?? 8080);
    const server = http.createServer(createApp());
    server.listen(PORT, () => {
      logger.info(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server", error);
  }
}

main();
