/**
 * Implements basic mock of bunyan logger
 */

function Logger() {
    return {
        fatal: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
        child: () => new Logger(),
    };
}

const bunyan = new Logger();
bunyan.createLogger = () => {
    return new Logger();
};

export default bunyan;
