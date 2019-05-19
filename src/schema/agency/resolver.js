import paginate from '../../lib/pagination';
import { map } from 'lodash';

export const Agency = {
    /**
     * Return list of all bookings of the aggency
     */
    bookings: async (root, args, context) => {
        const { ProjectModel, BookingModel } = context;

        // Get list of projects of the agency
        const projects = await ProjectModel.find({
            agency: root.id,
        });

        const bookings = await BookingModel.find({
            project: { $in: map(projects, project => project.id) },
        }).sort({ createdAt: -1 });

        return bookings.map(booking => ({
            ...booking.toObject(),
            totalPrice: booking.totalPrice,
        }));
    },

    /**
     * Return list of all projects of the agency
     */
    projects: (root, args, context) => {
        return context.ProjectModel.find({ agency: root.id });
    },

    /**
     * Return list of all credit cards of the agency
     */
    creditCards: (root, args, context) => {
        return context.CreditCardModel.find({ agency: root.id });
    },

    /**
     * Return list of search queries of the agency
     */
    searchQueries: async (root, args, context) => {
        const { first, after } = args;

        return paginate({
            model: context.SearchQueryModel,
            first,
            after,
            sort: { createdAt: -1 },
        });
    },
};
