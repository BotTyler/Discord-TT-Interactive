// import path from "node:path";
// import pino from "pino";
//
// const isProd = process.env.NODE_ENV === "production";
// const logDir = process.env.LOG_DIR ?? path.join(process.cwd(), "logs");
//
// export const logger = pino({
//   level: process.env.LOG_LEVEL ?? "info",
//   redact: ["req.headers.authorization", "req.headers.cookie", "*.password"],
//   transport: {
//     targets: [
//       // Console: pretty in dev, raw JSON to stdout in prod
//       isProd
//         ? { target: "pino/file", options: { destination: 1 } }
//         : {
//             target: "pino-pretty",
//             options: {
//               colorize: true,
//               translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
//             },
//           },
//
//       {
//         target: "pino-roll",
//         options: {
//           file: path.join(logDir, "app"),
//           extension: ".log",
//           frequency: "daily",
//           dateFormat: "yyyy-MM-dd",
//           size: "10m",
//           limit: { count: 14 },
//           mkdir: true,
//         },
//       },
//     ],
//   },
// });
// src/logger.ts
import path from "node:path";
import pino from "pino";

const isProd = process.env.NODE_ENV === "production";
const prettyConsole = process.env.LOG_PRETTY ? process.env.LOG_PRETTY === "true" : !isProd; // pretty by default in dev, JSON in prod
const logDir = process.env.LOG_DIR ?? path.join(process.cwd(), "logs");

// Console destination
const consoleStream = prettyConsole
  ? pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:yyyy-mm-dd HH:MM:ss.l",
        ignore: "pid,hostname",
      },
    })
  : pino.destination(1); // stdout, JSON (what Docker captures)

// Rotating file destination (always JSON)
const fileStream = pino.transport({
  target: "pino-roll",
  options: {
    file: path.join(logDir, "app"),
    extension: ".log",
    frequency: "daily",
    dateFormat: "yyyy-MM-dd",
    size: "10m",
    limit: { count: 14 },
    mkdir: true,
  },
});

export const logger = pino(
  {
    level: process.env.LOG_LEVEL ?? "info",
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }), // "info" instead of 30
    },
    redact: ["req.headers.authorization", "req.headers.cookie", "*.password"],
  },
  pino.multistream([{ stream: consoleStream }, { stream: fileStream }]),
);
