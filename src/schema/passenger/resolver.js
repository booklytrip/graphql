import { property, every, isNil, isEmpty, merge, map } from 'lodash';

export const Passenger = {
    id: property('_id'),

    /**
     * Passenger checkin status depends on currently provided
     * details.
     */
    checkin: async (root, args, context) => {
        const { CarrierModel } = context;

        // Get list of all carriers of current flight
        const carriers = map(
            [...root.flight.forwardSegments, ...root.flight.comebackSegments],
            property('carrier'),
        );

        // Verify if any of carriers require online check-in
        const checkinRequired =
            (await CarrierModel.find({
                code: { $in: carriers },
                onlineCheckin: true,
            }).count()) > 0;

        if (!checkinRequired) {
            return 'NOT_REQUIRED';
        }

        // The list of fields required to be provided
        const fields = [
            'type',
            'title',
            'firstName',
            'lastName',
            'nationality',
            'birthDate',
            'documentType',
            'documentNumber',
            'documentIssueCountry',
            'documentIssueDate',
            'documentExpirationDate',
        ];

        const confirmed = every(fields, field => {
            return !isNil(root[field]);
        });

        return confirmed ? 'CONFIRMED' : 'PENDING';
    },
};
