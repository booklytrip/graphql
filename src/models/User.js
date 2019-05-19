/**
 * Schema of registered user
 */

import Mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    fullName: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

/**
 * Save encrypted password for provided plain string, and
 * return password hash when requesting password.
 */
UserSchema.virtual('password')
    .set(function(password) {
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
        return this.hashedPassword;
    });

/**
 * Encrypt provided password
 *
 * @param {String} password - Password to encrypt
 */
UserSchema.methods.encryptPassword = function(password) {
    return bcrypt.hashSync(password, 8);
};

/**
 * Encrypt and compare plain-text password with in database
 *
 * @param {String} password - The plain-text password
 */
UserSchema.methods.checkPassword = function(password) {
    return bcrypt.compareSync(password, this.hashedPassword);
};

const UserModel = Mongoose.model('users', UserSchema);

export { UserSchema, UserModel };
