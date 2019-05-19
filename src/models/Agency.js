/**
 * Model of agency
 */

import Mongoose, { Schema } from 'mongoose';

const AgencySchema = new Schema({
    // Agency or company name. Should be unique in
    // the system,
    name: {
        type: String,
        unique: true,
        required: true,
    },
    // An administartor of the agency
    administrator: {
        type: String,
        required: true,
    },
});

const AgencyModel = Mongoose.model('agency', AgencySchema);

export { AgencySchema, AgencyModel };
