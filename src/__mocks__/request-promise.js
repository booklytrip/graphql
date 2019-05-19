/**
 * Implements basic mock for the `request` library.
 */

const request = jest.fn();
request.post = jest.fn();
request.get = jest.fn();

const mockImplementation = cb => {
    request.post.mockImplementation(cb);
    request.get.mockImplementation(cb);

    return request.mockImplementation(cb);
};

const mockImplementationOnce = cb => {
    request.post.mockImplementationOnce(cb);
    request.get.mockImplementationOnce(cb);

    return request.mockImplementationOnce(cb);
};

request.mockResponse = body => {
    return mockImplementation(() => {
        return Promise.resolve(body);
    });
};

request.mockReject = () => {
    return mockImplementation(() => {
        return Promise.reject();
    });
};

request.mockResponseOnce = body => {
    return mockImplementationOnce(() => {
        return Promise.resolve(body);
    });
};

request.mockRejectOnce = () => {
    return mockImplementationOnce(() => {
        return Promise.reject();
    });
};

request.resetMocks = () => {
    request.mockReset();
    request.post.mockReset();
    request.get.mockReset();
};

// Default mock is just an empty string
request.mockResponse('');

export default request;
