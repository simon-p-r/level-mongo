'use strict';


exports.isArray = (value) => {

    return (!!value) && (value.constructor === Array);
};

exports.isObj = (value) => {

    return (!!value) && (value.constructor === Object);
};

exports.isString = (value) => {

    return (!!value) && (value.constructor === String);
};


exports.isFunction = (value) => {

    return (!!value) && (value.constructor === Function);
};

