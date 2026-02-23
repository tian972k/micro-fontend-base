/**
 * Centralized Logger - For debugging and monitoring MFEs
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
  CRITICAL = "CRITICAL",
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
  source?: string;
  stack?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 500;
  private minLevel = LogLevel.DEBUG;
  private isDev =
    typeof window !== "undefined" && window.location.hostname === "localhost";
  private listeners: Array<(entry: LogEntry) => void> = [];

  constructor() {
    // Check environment
    this.minLevel =
      typeof process !== "undefined" && process.env.NODE_ENV === "production"
        ? LogLevel.INFO
        : LogLevel.DEBUG;
  }

  /**
   * Log at DEBUG level
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Log at INFO level
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Log at WARN level
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Log at ERROR level
   */
  error(message: string, error?: any): void {
    this.log(LogLevel.ERROR, message, error, (error as Error)?.stack);
  }

  /**
   * Log at CRITICAL level
   */
  critical(message: string, data?: any): void {
    this.log(LogLevel.CRITICAL, message, data);
  }

  /**
   * Get all logs
   */
  getLogs(filter?: { level?: LogLevel; source?: string }): LogEntry[] {
    let result = [...this.logs];

    if (filter?.level) {
      result = result.filter((log) => log.level === filter.level);
    }

    if (filter?.source) {
      result = result.filter((log) => log.source?.includes(filter.source!));
    }

    return result;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Subscribe to log entries
   */
  subscribe(listener: (entry: LogEntry) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Export logs (for debugging/analytics)
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // ========== PRIVATE ==========

  private log(
    level: LogLevel,
    message: string,
    data?: any,
    stack?: string,
  ): void {
    // Check minimum log level
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date(),
      stack,
    };

    // Add to internal logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in dev
    if (this.isDev) {
      this.consoleLog(entry);
    }

    // Notify listeners
    this.listeners.forEach((listener) => {
      try {
        listener(entry);
      } catch (error) {
        // Silent fail to avoid infinite loops
        if (this.isDev) {
          console.warn("Logger listener failed", error);
        }
      }
    });
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.CRITICAL,
    ];
    const minIndex = levels.indexOf(this.minLevel);
    const levelIndex = levels.indexOf(level);
    return levelIndex >= minIndex;
  }

  private consoleLog(entry: LogEntry): void {
    const prefix = `[${entry.level}] ${entry.message}`;
    const style = this.getConsoleStyle(entry.level);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(`%c${prefix}`, style, entry.data);
        break;
      case LogLevel.INFO:
        console.info(`%c${prefix}`, style, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(`%c${prefix}`, style, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(`%c${prefix}`, style, entry.data);
        if (entry.stack) console.error(entry.stack);
        break;
      case LogLevel.CRITICAL:
        console.error(`%c${prefix}`, style, entry.data);
        if (entry.stack) console.error(entry.stack);
        break;
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    const styles = {
      [LogLevel.DEBUG]: "color: #888; font-weight: bold;",
      [LogLevel.INFO]: "color: #0066cc; font-weight: bold;",
      [LogLevel.WARN]: "color: #ff9900; font-weight: bold;",
      [LogLevel.ERROR]: "color: #cc0000; font-weight: bold;",
      [LogLevel.CRITICAL]:
        "color: #cc0000; font-weight: bold; background: #ffcccc;",
    };
    return styles[level] || "";
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();
