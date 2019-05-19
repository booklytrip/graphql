export const User = {
    agency: (root, args, context) => {
        const agency = context.AgencyModel.findOne({ administrator: root.id });
        return agency;
    },
};
