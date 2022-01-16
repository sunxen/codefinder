enum LogLevel {
    Trace = 0,
    Debug,
    Info,
    Warn,
    Error,
}

class Logger {
    private level: LogLevel

    constructor(level?: LogLevel) {
        if (level >= 0) {
            this.level = level
        } else if (process.argv.includes('--log-trace')) {
            this.level = LogLevel.Trace
        } else if (process.argv.includes('--log-debug')) {
            this.level = LogLevel.Debug
        } else {
            this.level = LogLevel.Info
        }
    }

    log(level: LogLevel, msg: string): void {
        if (level >= this.level) {
            console.log(`[Codefinder][${LogLevel[level]}] ${msg}`)
        }
    }

    trace(msg: string): void {
        this.log(LogLevel.Trace, msg)
    }

    debug(msg: string): void {
        this.log(LogLevel.Debug, msg)
    }

    info(msg: string): void {
        this.log(LogLevel.Info, msg)
    }

    warn(msg: string): void {
        this.log(LogLevel.Warn, msg)
    }

    error(msg: string): void {
        this.log(LogLevel.Error, msg)
    }
}

export default new Logger()
