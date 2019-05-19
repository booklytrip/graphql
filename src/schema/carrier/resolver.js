export const Carrier = {
    id: carrier => carrier.id || carrier._id,
    code: carrier => carrier.code,
    name: carrier => carrier.name,
    minAge: carrier => carrier.minAge,
};
