/**
 * @flow
 */

import Mongoose, { Schema } from 'mongoose';
import { MarkupSchema } from './Markup';
import { SupplierModel } from './Supplier';
import Promise from 'bluebird';
import { filter } from 'lodash';

// List of support themes that change appearance of frame
const themes = [
    'default',
    'jelly_bean',
    'wax_flower',
    'bubble_gum',
    'lavander_purple',
    'moonstone_blue',
    'ryanair',
    'wizzair',
    'airbaltic',
];

// Add default markup that applies 10 fixed units
// in any currency to all flights, only if other
// does not match.
const defaultMarkup = {
    name: 'Default',
    default: true,
    general: {
        markupType: 'FIXED',
        submissionPlace: 'SEARCH_RESULTS',
        value: {
            fixed: 10,
        },
        currency: 'EUR',
    },
};

// Schema for project localization settings
const LocalizationSettingsSchema = new Schema({
    _id: { id: false },
    defaultLanguage: {
        type: String,
    },
    languages: {
        type: [String],
    },
});

// PaySera payment method settings
const PayseraPaymentMethod = new Schema({
    _id: { id: false },
    id: {
        type: String,
    },
    transactionFee: {
        type: Number,
    },
    minTransactionFee: {
        type: Number,
    },
    maxTransactionFee: {
        type: Number,
    },
    enabled: {
        type: Boolean,
    },
});

// The schema for PaySera settings
const PayseraSettingsSchema = new Schema({
    _id: { id: false },
    // Project ID in PaySera
    id: {
        type: String,
    },
    // Project password
    password: {
        type: String,
    },
    methods: {
        type: [PayseraPaymentMethod],
    },
});

// The schema for project payment settings
const PaymentSettingsSchema = new Schema({
    _id: { id: false },
    paysera: {
        type: PayseraSettingsSchema,
    },
});

const ProjectDetailsSchema = new Schema({
    _id: { id: false },
    phone: {
        type: String,
    },
    email: {
        type: String,
    },
});

const SupplierSettings = new Schema({
    _id: { id: false },
    supplier: {
        type: String,
        required: true,
    },
    enabled: {
        type: Boolean,
        required: true,
        default: true,
    },
    settings: {
        type: Object,
        required: false,
    },
});

const ProjectSchema = new Schema({
    // An agency that the project belongs to
    agency: {
        type: String,
        required: true,
    },
    // Descriptive name of the project
    name: String,
    // The URL to project's frame
    url: String,
    // Defines project visual customization
    theme: {
        type: String,
        default: 'default',
        enum: themes,
    },
    // Additional project infor mation
    details: {
        type: ProjectDetailsSchema,
    },
    // Markup settings
    markups: {
        type: [MarkupSchema],
        default: defaultMarkup,
    },
    // List of suppliers the project support
    suppliers: {
        type: [SupplierSettings],
    },
    // Project localization settings
    localization: {
        type: LocalizationSettingsSchema,
        default: {
            defaultLanguage: 'en',
            languages: ['en', 'lv', 'ru'],
        },
    },
    // Project payment settings
    payment: {
        type: PaymentSettingsSchema,
    },
    // The project creation date
    createdAt: {
        type: Date,
        default: new Date(),
    },
});

ProjectSchema.methods.getSuppliers = function() {
    if (!this.suppliers) {
        return [];
    }

    const suppliers = filter(this.suppliers, supplier => supplier.enabled);
    return Promise.map(suppliers, supplier => {
        return SupplierModel.findById(supplier);
    });
};

/**
 * Return list of normalized suppliers
 */
ProjectSchema.methods.getMarkups = function() {
    if (!this.markups) {
        return [];
    }

    const suppliers = this.getSuppliers();

    return {
        ...this.markups,
        suppliers,
    };
};

ProjectSchema.pre('save', async function(next) {
    // Add list of all available suppliers and set them as enabled
    if (this.isNew) {
        const suppliers = await SupplierModel.find({});
        suppliers.forEach(supplier => {
            this.suppliers.push({
                supplier: supplier._id,
                enabled: true,
            });
        });
    }

    next();
});

const ProjectModel = Mongoose.model('projects', ProjectSchema);

export { ProjectSchema, ProjectModel };
