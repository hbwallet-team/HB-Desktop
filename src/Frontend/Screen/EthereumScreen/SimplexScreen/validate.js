import Joi from "joi";
import { reduce } from "ramda";

const validate = schema => values => {
    return Joi.validate(values, schema, { abortEarly: false }, err => {
        if (!err) {
            return {};
        }
        const generateErr = (accumulator, { message, path: [name] }) => {
            return {
                ...accumulator,
                [name]: message
            };
        };
        const error = reduce(generateErr, {}, err.details);
        return error;
    });
};

export default validate;
