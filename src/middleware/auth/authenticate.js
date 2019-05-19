import jwt from 'express-jwt';
import config from '../../config';

const authMiddleware = jwt({
    secret: config.jwtSecret,
    // Authentication is optional, but gives more power to the user
    credentialsRequired: false,
    requestProperty: 'auth',
});

export default authMiddleware;
