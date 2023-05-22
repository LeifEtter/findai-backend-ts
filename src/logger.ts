import pino from "pino";

const logger = pino({
  transport: {
    targets: [
      {
        level: "trace",
        target: "pino/file",
        options: {
          destination: "./src/logs/file.log",
        },
      },
      {
        level: "trace",
        target: "pino-pretty",
        options: {
          translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
          ignore: "pid,hostname",
        },
      },
    ],
  },
});

export default logger;
