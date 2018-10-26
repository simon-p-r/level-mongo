'use strict';


const internals = {};

module.exports = (original, modifier) => {

    const keys = Object.keys(modifier);
    for (let i = 0; i < keys.length; ++i) {

        const key = keys[i];
        if (internals[key]) {
            original = internals[key](original, modifier[key]);
        }

    }

    return original;
};

internals.$set = (original, modifier) => {

    const keys = Object.keys(modifier);
    for (let i = 0; i < keys.length; ++i) {

        const key = keys[i];
        if (modifier[key] !== undefined) {
            original[key] = modifier[key];
        }

    }

    return original;

};


internals.$unset = (original, modifier) => {

    const keys = Object.keys(modifier);
    for (let i = 0; i < keys.length; ++i) {

        const key = keys[i];
        if (modifier[key] === 1) {
            delete original[key];
        }

    }

    return original;

};
