/**
 * @flow
 */

import jwt from 'jsonwebtoken';
import {
    omit,
    last,
    pick,
    map,
    find,
    indexOf,
    merge,
    property,
    has,
    isNil,
    some,
    each,
} from 'lodash';
import logger from '../../lib/logger';
import mailer from '../../lib/mailer';
import {
    AlreadyExists,
    NotExists,
    UserNotFound,
    NotAuthenticated,
    InvalidPassword,
    NotAllowed,
    ActionFailed,
} from '../../errors';
import config from '../../config';

import type { ID, Context, CheckinInput, Flight } from '../../types';

export const Mutation = {
    /**
     * Try to authenticate user, and if credetials are right
     * return JWT token back.
     */
    async login(root, args, context) {
        const { username, password } = args.input;
        const user = await context.UserModel.findOne({ email: username });
        if (!user) {
            throw new UserNotFound({ data: { email: username } });
        }

        if (!user.checkPassword(password)) {
            throw new InvalidPassword();
        }

        const token = jwt.sign({ id: user.id }, config.jwtSecret);
        return { token, user };
    },

    /**
     * Create a new agency and administrator user
     */
    async createAgency(root, args, context) {
        const { name, administrator } = args.input;

        // Validate agency name uniqueness
        let agency = await context.AgencyModel.findOne({ name });
        if (agency) {
            throw new AlreadyExists({ data: { name, type: 'name' } });
        }

        // Make sure that user with specified email address
        // does not exists
        let user = await context.UserModel.findOne({
            email: administrator.email,
        });
        if (user) {
            throw new AlreadyExists({
                data: {
                    email: administrator.email,
                    type: 'administrator.email',
                },
            });
        }

        user = new context.UserModel(administrator);
        await user.save();

        agency = new context.AgencyModel({
            name,
            administrator: user.id,
        });
        await agency.save();

        // Generate JWT token for a new user for imediate
        // authentication
        const token = jwt.sign({ id: user.id }, config.jwtSecret);

        return { agency, administrator: { token, user } };
    },

    /**
     * Create a new project
     */
    async createProject(root, args, context) {
        const { agency } = context;
        const { name, url } = args.input;

        // Validate a new project name
        let project = await context.ProjectModel.findOne({ name });
        if (project) {
            throw new AlreadyExists({ data: { type: 'name', name } });
        }

        project = new context.ProjectModel({
            agency: agency.id,
            ...args.input,
        });
        await project.save();

        return { project };
    },

    /**
     * Update project identified by ID
     */
    async updateProject(root, args, context) {
        const { projectId, ...data } = args.input;

        // Verify that project with specified ID exists
        const project = await context.ProjectModel.findById(projectId);
        if (!project) {
            throw new NotExists({ data: { type: 'project', projectId } });
        }

        // Validate project name
        const validateProject = await context.ProjectModel.findOne({
            name: data.name,
        });
        if (validateProject && validateProject.id !== project.id) {
            throw new AlreadyExists({
                data: { type: 'name', name: data.name },
            });
        }

        Object.assign(project, data);
        await project.save();

        return { project };
    },

    /**
     * Delete project identified by ID
     */
    async deleteProject(root, args, context) {
        const { projectId } = args.input;

        // Verify that project exists
        const project = context.ProjectModel.findById(projectId);
        if (!project) {
            throw new NotExists({ data: { type: 'project', projectId } });
        }

        await project.remove();

        return { projectId };
    },

    /**
     * Add a markup to a project
     */
    async addMarkup(root, args, context) {
        const { projectId, markupId, markup: data } = args.input;

        // Verify that project exists
        const project = await context.ProjectModel.findById(projectId);
        if (!project) {
            throw new NotExists({ data: { type: 'project', projectId } });
        }

        const markup = project.markups.create(data);
        project.markups.unshift(markup);
        await project.save();

        return { markup };
    },

    /**
     * Update existing markup of specified project
     */
    async updateMarkup(root, args, context) {
        const { projectId, markupId, markup: data } = args.input;

        // Verify that project exists
        const project = await context.ProjectModel.findById(projectId);
        if (!project) {
            throw new NotExists({ data: { type: 'project', projectId } });
        }

        // Verify that markup exists
        const markup = project.markups.id(markupId);
        if (!markup) {
            throw new NotExists({ data: { type: 'markup', markupId } });
        }

        Object.assign(markup, data);
        project.save();

        return { markup };
    },

    /**
     * Delete the project markup
     */
    async deleteMarkup(root, args, context) {
        const { projectId, markupId } = args.input;

        // Verify that project exists
        const project = await context.ProjectModel.findById(projectId);
        if (!project) {
            throw new NotExists({ data: { type: 'project', projectId } });
        }

        // Verify that markup exists
        const markup = project.markups.id(markupId);
        if (!markup) {
            throw new NotExists({ data: { type: 'markup', markupId } });
        }

        markup.remove();
        await project.save();

        return {
            projectId: projectId,
            markupId: markupId,
        };
    },

    /**
     * Move markup to specified position
     */
    async moveMarkup(root, args, context) {
        const { input } = args;
        const project = await context.ProjectModel.findOne({
            _id: input.projectId,
        });
        if (!project) {
            throw new Error(
                `Project with ID ${input.projectId} does not exists`,
            );
        }

        const markup = project.markups.id(input.markupId);
        if (!markup) {
            throw new Error(`Markup with ID ${input.markupId} does not exists`);
        }

        const index = indexOf(project.markups, markup);
        project.markups.splice(index, 1);
        project.markups.splice(input.atIndex, 0, markup);

        project.save();

        return {
            projectId: input.projectId,
            markupId: input.markupId,
            index: input.atIndex,
        };
    },

    /**
     * Create a enw booking
     */
    async createBooking(root, args, context) {
        const { project, FlightModel, BookingModel } = context;

        // Request flight to confirm it's availability
        const originalFlight = await FlightModel.findOneByIdentity(
            {
                priceKey: args.input.priceKey,
                cachedID: args.input.cachedID,
            },
            project,
        );

        if (!originalFlight) {
            throw new NotExists({ data: { type: 'flight' } });
        }

        // Pick only required sections of flight object
        const flight: Flight = pick(originalFlight, [
            'params',
            'general',
            'forwardSegments',
            'comebackSegments',
            'baggagesDetailed',
        ]);

        const booking = new BookingModel({
            ...args.input,
            project: context.project.id,
            flight,
        });

        // Group all semgnets in single list to generate orders
        const segments = [
            ...booking.flight.forwardSegments,
            ...booking.flight.comebackSegments,
        ];

        // Generate orders for each OR group of segments depending on supplier
        if (booking.flight.general.supplier === 'multiple_lc') {
            // If there are multiple suppliers, create a separate order for each segment
            each(segments, segment => {
                booking.orders.push({
                    segments: [segment._id],
                    supplier: segment.supplier,
                });
            });
        } else {
            // Or single order for all segments if supplier is the same
            booking.orders.push({
                segments: map(segments, property('_id')),
                supplier: segments[0].supplier,
            });

            // If supplier is travelport, we can book flight imediately without payment,
            // because we will have an option to cancel it
            if (flight.general.supplier === 'travelport') {
                const order = await FlightModel.booking(
                    booking.toObject(),
                    context.project,
                );

                if (order.error) {
                    logger.error(
                        `Unable to complete flight because of error: ${order.error}`,
                    );
                    booking.error = order.error;
                } else {
                    logger.info(order, 'Flight order successfully received');
                    // Assign returned details about the order
                    Object.assign(
                        booking.orders[0],
                        omit(order.data[0], ['reference']),
                    );

                    booking.states.addToSet('RESERVATION');
                    booking.error = null;
                }
            }
        }

        await booking.save();

        // Send reservation confirmation
        mailer.send('reservationCreated', {
            booking: booking.id,
        });

        return {
            booking: booking.toObject(),
        };
    },

    /**
     * Update existing booking identified by ID
     */
    async updateBooking(root, args, context) {
        const { BookingModel, agency } = context;
        const { bookingId, ...data } = args.input;

        // Find booking with specified ID
        const booking = await BookingModel.findById(bookingId);
        if (!booking) {
            throw new NotExists({
                data: { type: 'bookingId', bookingId },
            });
        }

        // TODO: Verify that we can update this booking

        // Add aditional fields required for payment
        if (has(data, 'payment.amount')) {
            if (!booking.states.indexOf('PAYMENT') !== -1) {
                // Send payment confirmation
                mailer.send('paymentReceived', { booking: booking.id });
            }

            Object.assign(data.payment, {
                status: 'success',
                currency: 'EUR',
            });
            booking.states.addToSet('PAYMENT');
        }

        Object.assign(booking, data);
        await booking.save();

        return { booking };
    },

    /**
     * Update booking order identified by ID
     */
    async updateBookingOrder(root, args, context) {
        const { BookingModel } = context;
        const { orderId, ...data } = args.input;

        // Find booking by order ID
        const booking = await BookingModel.findOne({
            'orders._id': orderId,
        });
        if (!booking) {
            throw new NotExists();
        }

        // Get order object
        const order = booking.orders.id(orderId);
        if (!order) {
            throw new NotExists();
        }

        Object.assign(order, data);
        await booking.save();

        return { order };
    },

    /**
     * Update passenger details
     */
    async updatePassenger(root, args, context) {
        const { BookingModel } = context;
        const { passengerId, ...data } = args.input;

        // Find booking by passenger ID
        const booking = await BookingModel.findOne({
            'passengers._id': passengerId,
        });
        if (!booking) {
            throw new NotExists();
        }

        // Get passenger object
        const passenger = booking.passengers.id(passengerId);
        if (!passenger) {
            throw new NotExists();
        }

        Object.assign(passenger, data);
        await booking.save();

        return {
            passenger: {
                ...passenger.toObject(),
                flight: booking.flight.toObject(),
            },
        };
    },

    /**
     * Order flights of provided booking
     */
    async orderBookingFlights(root, args, context) {
        const { BookingModel, FlightModel, ProjectModel } = context;
        const { bookingId } = args.input;

        // Get booking object or throw an exception
        const booking = await BookingModel.findById(bookingId);
        if (!booking) {
            throw new NotExists({
                data: { type: 'bookingId', bookingId },
            });
        }

        const project = await ProjectModel.findById(booking.project);
        if (!project) {
            throw new NotExists({ data: { type: 'project' } });
        }

        // Verify that we have a payment
        if (isNil(booking.payment)) {
            throw new NotExists({ data: { type: 'payment' } });
        }

        const incompleteOrders = some(
            booking.orders,
            order => order.status !== 'CONFIRMED',
        );
        if (!incompleteOrders) {
            throw new NotExists({ data: { type: 'orders' } });
        }

        // Verify that payment amount is not less then flight price
        if (booking.payment.amount < booking.totalPrice) {
            throw new NotExists();
        }

        const orders = await FlightModel.booking(booking.toObject(), project);
        if (orders.error) {
            logger.error(
                `Unable to complete flight because of error: ${orders.error}`,
            );
            booking.error = orders.error;
            await booking.save();

            throw new ActionFailed({ message: orders.error });
        } else {
            logger.info(orders, 'Flight order successfully received');
            // Assign returned details to each order
            each(orders.data, data => {
                const order = booking.orders.id(data.reference);
                if (order) {
                    Object.assign(order, omit(data, ['reference']));
                }
            });

            booking.states.addToSet('CONFIRMATION');
            booking.error = null;
        }

        await booking.save();

        return { booking: booking.toObject() };
    },

    /**
     * Send check-in request to orders of specified booking
     */
    async checkin(root, args, context) {
        const { BookingModel, FlightModel } = context;
        const booking = await BookingModel.findById(args.input.bookingId);

        const checkin = await FlightModel.checkin(booking.toObject());

        booking.states.addToSet('CHECK_IN');
        await booking.save();

        return { booking: booking.toObject() };
    },

    /**
     * Make confirmation of provided booking
     */
    async confirmBooking(root, args, context) {
        const { BookingModel } = context;
        const input = args.input;

        const booking = await BookingModel.findById(input.bookingId);
        if (!booking) {
            throw new NotExists({
                data: { type: 'bookingId', bookingId: input.bookingId },
            });
        }

        booking.states.addToSet('CONFIRMATION');
        await booking.save();

        // Send booking confirmation
        mailer.send('bookingConfirmed', {
            booking: booking.id,
        });

        return { booking };
    },

    /**
     * Add a new credit card and attach it to current user
     */
    async addCreditCard(root, args, context) {
        const { agency, CreditCardModel } = context;
        const input = args.input;

        // Validate credit card number that should be unique
        const creditCardExists = await context.CreditCardModel
            .find({
                agency: agency._id,
                number: input.number,
            })
            .count();

        if (creditCardExists) {
            throw new AlreadyExists({
                data: { type: 'number', number: input.number },
            });
        }

        const creditCard = new CreditCardModel({
            agency: agency.id,
            ...input,
        });
        await creditCard.save();

        return { creditCard };
    },

    /**
     * Update existing credit card identified by ID with a new data
     */
    async updateCreditCard(root, args, context) {
        const { CreditCardModel, agency } = context;
        const { creditCardId, ...data } = args.input;

        // Get card identified by ID
        const creditCard = await CreditCardModel.findById(creditCardId);
        if (!creditCard) {
            throw new NotExists({
                data: { type: 'creditCardId', creditCardId },
            });
        }

        // Validate credit card number that should be unique
        const creditCardByNumber = await CreditCardModel.find({
            _id: { $ne: creditCard.id },
            agency: agency.id,
            number: data.number,
        }).count();

        if (creditCardByNumber) {
            throw new AlreadyExists({
                data: { type: 'number', number: data.number },
            });
        }

        Object.assign(creditCard, data);
        await creditCard.save();

        return { creditCard };
    },

    /**
     * Remove existing credit card identified by ID
     */
    async deleteCreditCard(root, args, context) {
        const { creditCardId } = args.input;

        // Verify that credit card exists
        const creditCard = context.CreditCardModel.findById(creditCardId);
        if (!creditCard) {
            throw new NotExists({
                data: { type: 'creditCardId', creditCardId },
            });
        }

        // Don't allow to remove default card
        if (creditCard.default) {
            throw new NotAllowed({
                data: { type: 'default' },
            });
        }

        await creditCard.remove();

        return { creditCardId };
    },

    /**
     * Update paysera pyament method settings
     */
    async updatePayseraMethodSettings(root, args, context) {
        const { projectId, methodId, ...data } = args.input;

        // Get project by ID
        const project = await context.ProjectModel.findById(projectId);
        if (!project) {
            throw new NotExists({
                data: { type: 'projectId', projectId },
            });
        }

        // Get existing payment method identified by ID or create a new one
        let paymentMethod = find(project.payment.paysera.methods, {
            id: methodId,
        });
        if (!paymentMethod) {
            paymentMethod = project.payment.paysera.methods.create({
                id: methodId,
            });
            project.payment.paysera.methods.push(paymentMethod);
        }

        Object.assign(paymentMethod, data);
        await project.save();

        return { method: paymentMethod };
    },
};
