import { createError } from 'apollo-errors';

/**
 * General error for action which executaion has provoke an error
 */
export const ActionFailed = createError('ActionFailed', {
    message: 'Performed action has failed',
});

/**
 * Should be thrown when user trying to reach resource that
 * requires authenticated user.
 */
export const NotAuthenticated = createError('NotAuthenticated', {
    message: 'User is not authenticated for this request',
});

/**
 * Should be throws when authentication has failed bacause
 * user with provided username OR email does not exists.
 */
export const UserNotFound = createError('UserNotFound', {
    message: 'User with specified username does not exists',
});

/**
 * Should be thrown when user exists, but provided password
 * doesn't match.
 */
export const InvalidPassword = createError('InvalidPassword', {
    message: 'Password does not match',
});

/**
 * Thrown when an operation (such as create, or rename) expects a resource to not exist,
 * but does indeed exist.
 */
export const AlreadyExists = createError('AlreadyExists', {
    message: 'Provided entity already exists',
});

/**
 * An exception indicating a resource requested by a client was not found on the server.
 * 
 * TODO: Rename NotFound
 */
export const NotExists = createError('NotExists', {
    message: 'Requested entity does not exists',
});

/**
 * An exception indicating a client requesting a resource method that is not allowed.
 */
export const NotAllowed = createError('Forbidden', {
    message: 'Operation is not allowed',
});
