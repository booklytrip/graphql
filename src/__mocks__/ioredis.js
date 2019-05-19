const ioredis = jest.fn();

// In memory storage
const store = {};

// Implement mock of set method
ioredis.set = jest.fn();
ioredis.set.mockImplementation((key, value) => {
    store[key] = value;
    return Promise.resolve();
});

// Implement mock of get method
ioredis.get = jest.fn();
ioredis.get.mockImplementation(key => {
    return new Promise((resolve, reject) => {
        if (store[key] !== undefined) {
            resolve(store[key]);
        } else {
            reject();
        }
    });
});

export default ioredis;
