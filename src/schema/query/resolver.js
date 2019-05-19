/**
 * @flow weak
 */

import { map } from 'lodash';

import { NotAuthenticated, NotExists } from '../../errors';

import type {
    ID,
    Context,
    FlightIdentity,
    SearchFlightsQuery,
    SearchDestionationsQuery,
} from '../../types';

export const Query = {
    /**
     * Returns current user data if user is authenticated OR
     * throws and error if not.
     */
    viewer(root, args, context) {
        if (!context.user) {
            throw new NotAuthenticated();
        }

        return context.user;
    },

    searchAirports(root, args, context: Context) {
        const { term, limit } = args;
        return context.AirportModel.search(term, limit);
    },

    airport(root, { iata }: { iata: string }, context: Context) {
        return context.AirportModel.findOne({ iata });
    },

    carrier(root, { code }: { code: string }, context: Context) {
        return context.CarrierModel.findOne({ code });
    },

    async booking(root, args, context: Context) {
        const booking = await context.BookingModel.findById(args.id);

        if (!booking) {
            throw new Error(`Booking with ID ${args.id} does not exists`);
        }

        return {
            ...booking.toObject(),
            totalPrice: booking.totalPrice,
            createdAt: booking.createdAt.toUTCString(),
        };
    },

    /**
     * Return single project identified by ID
     */
    async project(root, args, context: Context) {
        const { id } = args;

        const project = await context.ProjectModel.findById(id);
        if (!project) {
            throw new NotExists({ data: { type: 'id', id } });
        }

        return project.toObject();
    },

    /**
     * Return list of avaiable suppliers
     */
    suppliers(root, args, context: Context) {
        return context.Suppliers.find();
    },

    /**
     * Return list of countires
     */
    countries(root, args, context: Context) {
        return context.CountryModel.find().sort({ 'name.common': 1 });
    },
};
