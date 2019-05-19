/**
 * Schema for service suppliers
 */

import Mongoose, { Schema } from 'mongoose';

const SupplierSchema = new Schema({
    // Supplier name in readable form
    name: {
        type: String,
        required: true,
    },
    // Unique key of the supplier
    key: {
        type: String,
        required: true,
    },
    // Set of settings fields
    fields: {
        type: [String],
        required: false,
    },
    // The creation date of supplier
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

const SupplierModel = Mongoose.model('supplier', SupplierSchema);

export { SupplierModel, SupplierSchema };
