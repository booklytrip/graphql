import { property, map, find, filter } from 'lodash';
import { differenceInSeconds } from 'date-fns';

/**
 * The resolver of project entity
 */
export const Project = {
    /**
     * Return unique project ID
     */
    id: property('_id'),

    /**
     * The project payment settings
     */
    payment: project => {
        return { project, ...project.payment };
    },

    /**
     * Search flights relative to project
     */
    flights: async (root, args, context) => {
        const {
            FlightModel,
            SupplierModel,
            SearchQueryModel,
            request,
        } = context;

        const startTime = new Date();

        // Get list of suppliers
        const suppliers = filter(root.suppliers, o => o.enabled);
        const suppliersKeys = await SupplierModel.find({
            _id: { $in: map(suppliers, o => o.supplier) },
        }).then(data => map(data, o => o.key));

        const flights = await FlightModel.find(
            {
                ...args,
                suppliers: suppliersKeys,
            },
            root,
        );

        // Save search query
        const searchQuery = new SearchQueryModel({
            agency: root.agency,
            project: root._id,
            ipAddress: request.ip,
            query: args,
            results: flights.length,
            duration: differenceInSeconds(new Date(), startTime),
        });

        await searchQuery.save();

        return flights;
    },

    /**
     * Find specific flight identified by cachedId and priceKey
     */
    flight: (root, args, context) => {
        return context.FlightModel.findOneByIdentity(args, root);
    },

    /**
     * Return list of all suppliers and their status relative to
     * current project.
     */
    suppliers: async (root, args, context) => {
        const suppliers = await context.SupplierModel.find({}).lean();

        // Prepare list of suppliers settings
        const suppliersSettings = map(suppliers, supplier => {
            const settings = find(root.suppliers, {
                supplier: supplier._id.toString(),
            });

            // If settings are not found, return supplier as disabled
            if (!settings) {
                return {
                    supplier,
                    enabled: false,
                };
            }

            // Return supplier and it's settings
            return {
                ...settings,
                supplier,
            };
        });

        if (args.enabled === undefined) {
            return suppliersSettings;
        } else {
            // Filter results by provided status
            return filter(suppliersSettings, supplier => {
                return supplier.enabled === args.enabled;
            });
        }
    },
};

/**
 * The resolver of project payment settings
 */
export const PaymentSettings = {
    paysera: ({ project, paysera }) => {
        return { project, ...paysera };
    },
};

/**
 * Paysera settings resolver
 */
export const PayseraSettings = {
    /**
     * Get list of payment methods with their status (enabled / disabled)
     * for current project.
     */
    methods: async (root, args, context) => {
        const { PaymentModel } = context;
        const data = await PaymentModel.getMethodsSettings(root.project);

        return data;
    },
};
