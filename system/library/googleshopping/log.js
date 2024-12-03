module.exports = class Log {
    constructor(filename, maxSize = 8388608) {
        this.file = expressPath.join(__dirname, 'logs', filename);

        if (!fs.existsSync(this.file)) {
            if (!fs.existsSync(expressPath.dirname(this.file)) || !fs.accessSync(expressPath.dirname(this.file), fs.constants.W_OK)) {
                // Do nothing, as we have no permissions
                return;
            }
        } else {
            if (!fs.accessSync(this.file, fs.constants.W_OK)) {
                // Do nothing, as we have no permissions
                return;
            }
        }

        let mode = 'a'; // append mode
        if (fs.existsSync(this.file) && fs.statSync(this.file).size >= maxSize) {
            mode = 'w'; // write mode to truncate file
        }

        this.handle = fs.createWriteStream(this.file, { flags: mode });
    }

    write(message) {
        if (this.handle) {
            const logMessage = `${new Date().toISOString()} - ${JSON.stringify(message)}\n`;
            this.handle.write(logMessage);
        }
    }

    close() {
        if (this.handle) {
            this.handle.end();
        }
    }
}
