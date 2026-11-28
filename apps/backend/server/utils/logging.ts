import winston from "winston";

const levels = { error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5 };
const level = () => {
  return import.meta.dev ? "debug" : "info";
};

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "cyan",
  debug: "white",
  verbose: "blue",
};
winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: any) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

const transports = [
  new winston.transports.Console({
    format,
  }),
];

const Logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  defaultMeta: {
    app: "envo",
    environment: process.env.NODE_ENV ?? "production",
  },
  rejectionHandlers: [],
});

export function useLogger(meta: Record<string, any> = {}) {
  return Logger.child(meta);
}
