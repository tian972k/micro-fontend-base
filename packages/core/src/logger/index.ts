/**
 * Beautiful Logger Utility
 * Premium console output with colors, icons, and visual formatting
 */

// ANSI color codes for terminal
const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",

  // Text colors
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Bright text colors
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",

  // Background colors
  bgBlack: "\x1b[40m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
  bgMagenta: "\x1b[45m",
  bgCyan: "\x1b[46m",
  bgWhite: "\x1b[47m",
} as const;

type LogLevel = "info" | "success" | "warn" | "error" | "debug";

interface LoggerOptions {
  prefix?: string;
  timestamp?: boolean;
}

function getTimestamp(): string {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  return `${c.gray}${time}${c.reset}`;
}

const levelStyles = {
  info: {
    icon: "○",
    label: "INFO",
    color: c.cyan,
    bg: c.bgCyan,
  },
  success: {
    icon: "✔",
    label: "SUCCESS",
    color: c.green,
    bg: c.bgGreen,
  },
  warn: {
    icon: "⚠",
    label: "WARN",
    color: c.yellow,
    bg: c.bgYellow,
  },
  error: {
    icon: "✖",
    label: "ERROR",
    color: c.red,
    bg: c.bgRed,
  },
  debug: {
    icon: "◈",
    label: "DEBUG",
    color: c.magenta,
    bg: c.bgMagenta,
  },
};

function formatLog(
  level: LogLevel,
  message: string,
  options: LoggerOptions = {},
): string {
  const { prefix, timestamp = true } = options;
  const style = levelStyles[level];

  const parts: string[] = [];

  // Timestamp
  if (timestamp) {
    parts.push(getTimestamp());
  }

  // Badge style label
  parts.push(`${style.color}${c.bold}[${style.icon} ${style.label}]${c.reset}`);

  // Prefix
  if (prefix) {
    parts.push(`${c.gray}(${prefix})${c.reset}`);
  }

  // Message
  parts.push(`${c.white}${message}${c.reset}`);

  return parts.join(" ");
}

function createLogger(defaultOptions: LoggerOptions = {}) {
  return {
    // Standard log methods
    info(message: string, ...args: unknown[]) {
      console.log(formatLog("info", message, defaultOptions), ...args);
    },

    success(message: string, ...args: unknown[]) {
      console.log(formatLog("success", message, defaultOptions), ...args);
    },

    warn(message: string, ...args: unknown[]) {
      console.warn(formatLog("warn", message, defaultOptions), ...args);
    },

    error(message: string, ...args: unknown[]) {
      console.error(formatLog("error", message, defaultOptions), ...args);
    },

    debug(message: string, ...args: unknown[]) {
      if (process.env.NODE_ENV === "development" || process.env.DEBUG) {
        console.log(formatLog("debug", message, defaultOptions), ...args);
      }
    },

    // ═══════════════════════════════════════════════════════
    // Premium Visual Methods
    // ═══════════════════════════════════════════════════════

    /** Display app startup banner */
    banner(name: string, version?: string) {
      const ver = version ? ` v${version}` : "";
      console.log("");
      console.log(
        `  ${c.cyan}${c.bold}╭${"─".repeat(name.length + ver.length + 6)}╮${c.reset}`,
      );
      console.log(
        `  ${c.cyan}${c.bold}│${c.reset}   ${c.brightCyan}${c.bold}${name}${c.reset}${c.gray}${ver}${c.reset}   ${c.cyan}${c.bold}│${c.reset}`,
      );
      console.log(
        `  ${c.cyan}${c.bold}╰${"─".repeat(name.length + ver.length + 6)}╯${c.reset}`,
      );
      console.log("");
    },

    /** Display server ready message with URLs */
    server(port: number, host = "localhost") {
      const localUrl = `http://${host}:${port}`;
      console.log("");
      console.log(`  ${c.green}${c.bold}⚡ Server Ready${c.reset}`);
      console.log("");
      console.log(
        `  ${c.gray}┃${c.reset}  ${c.bold}Local${c.reset}    ${c.cyan}${c.underline}${localUrl}${c.reset}`,
      );
      console.log(
        `  ${c.gray}┃${c.reset}  ${c.bold}Network${c.reset}  ${c.gray}use --host to expose${c.reset}`,
      );
      console.log("");
    },

    /** Display MFE (Micro Frontend) ready message */
    mfeReady(name: string, port: number) {
      console.log(
        `  ${c.green}●${c.reset} ${c.bold}${name}${c.reset} ${c.gray}→${c.reset} ${c.cyan}http://localhost:${port}${c.reset}`,
      );
    },

    /** Display multiple MFEs status */
    mfeStatus(
      apps: Array<{
        name: string;
        port: number;
        status: "ready" | "building" | "error";
      }>,
    ) {
      console.log("");
      console.log(`  ${c.bold}${c.white}Micro Frontends${c.reset}`);
      console.log(`  ${c.gray}${"─".repeat(40)}${c.reset}`);

      apps.forEach((app) => {
        const statusIcon = {
          ready: `${c.green}●${c.reset}`,
          building: `${c.yellow}◌${c.reset}`,
          error: `${c.red}✖${c.reset}`,
        }[app.status];

        const url =
          app.status === "ready"
            ? `${c.cyan}http://localhost:${app.port}${c.reset}`
            : app.status === "building"
              ? `${c.yellow}building...${c.reset}`
              : `${c.red}failed${c.reset}`;

        console.log(
          `  ${statusIcon} ${c.bold}${app.name.padEnd(12)}${c.reset} ${url}`,
        );
      });
      console.log("");
    },

    /** Display build complete message */
    build(appName: string, duration?: number) {
      const time = duration ? `${c.gray}in ${duration}ms${c.reset}` : "";
      console.log(
        `  ${c.green}▲${c.reset} ${c.bold}${appName}${c.reset} ${c.green}built${c.reset} ${time}`,
      );
    },

    /** Display a styled box message */
    box(message: string, type: "info" | "success" | "warn" | "error" = "info") {
      const colors = {
        info: c.cyan,
        success: c.green,
        warn: c.yellow,
        error: c.red,
      };
      const icons = {
        info: "ℹ",
        success: "✔",
        warn: "⚠",
        error: "✖",
      };
      const color = colors[type];
      const icon = icons[type];
      const padding = 2;
      const width = message.length + padding * 2 + 2;

      console.log("");
      console.log(`  ${color}╭${"─".repeat(width)}╮${c.reset}`);
      console.log(
        `  ${color}│${c.reset} ${icon}  ${message}${" ".repeat(padding - 1)}${color}│${c.reset}`,
      );
      console.log(`  ${color}╰${"─".repeat(width)}╯${c.reset}`);
      console.log("");
    },

    /** Display horizontal divider */
    divider(style: "single" | "double" | "dotted" = "single") {
      const chars = {
        single: "─",
        double: "═",
        dotted: "┄",
      };
      console.log(`  ${c.gray}${chars[style].repeat(50)}${c.reset}`);
    },

    /** Display blank line */
    blank() {
      console.log("");
    },

    /** Display step progress */
    step(current: number, total: number, message: string) {
      const progress = `${c.cyan}[${current}/${total}]${c.reset}`;
      console.log(`  ${progress} ${message}`);
    },

    /** Display a table */
    table(
      headers: string[],
      rows: string[][],
      options: { color?: string } = {},
    ) {
      const color = options.color || c.cyan;
      const colWidths = headers.map((h, i) =>
        Math.max(h.length, ...rows.map((r) => (r[i] || "").length)),
      );

      const separator = `  ${color}├${"─".repeat(
        colWidths.reduce((a, b) => a + b + 3, 1),
      )}┤${c.reset}`;
      const topBorder = `  ${color}╭${"─".repeat(
        colWidths.reduce((a, b) => a + b + 3, 1),
      )}╮${c.reset}`;
      const bottomBorder = `  ${color}╰${"─".repeat(
        colWidths.reduce((a, b) => a + b + 3, 1),
      )}╯${c.reset}`;

      console.log("");
      console.log(topBorder);
      console.log(
        `  ${color}│${c.reset} ${headers
          .map((h, i) => `${c.bold}${h.padEnd(colWidths[i])}${c.reset}`)
          .join(" │ ")} ${color}│${c.reset}`,
      );
      console.log(separator);

      rows.forEach((row) => {
        console.log(
          `  ${color}│${c.reset} ${row
            .map((cell, i) => cell.padEnd(colWidths[i]))
            .join(" │ ")} ${color}│${c.reset}`,
        );
      });

      console.log(bottomBorder);
      console.log("");
    },

    /** Display loading spinner text */
    loading(message: string) {
      console.log(`  ${c.cyan}◌${c.reset} ${c.gray}${message}...${c.reset}`);
    },

    /** Display key-value pair */
    keyValue(key: string, value: string) {
      console.log(`  ${c.gray}${key}:${c.reset} ${c.white}${value}${c.reset}`);
    },

    /** Group of key-value pairs */
    group(title: string, items: Record<string, string>) {
      console.log("");
      console.log(`  ${c.bold}${title}${c.reset}`);
      Object.entries(items).forEach(([key, value]) => {
        console.log(
          `  ${c.gray}├${c.reset} ${key}: ${c.cyan}${value}${c.reset}`,
        );
      });
      console.log("");
    },
  };
}

// Default logger instance
export const logger = createLogger();

// Factory function to create prefixed loggers
export function createPrefixedLogger(prefix: string) {
  return createLogger({ prefix });
}

// Export types and colors for advanced usage
export { c as colors };
export type { LoggerOptions, LogLevel };
