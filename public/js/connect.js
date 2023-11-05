var initialize = require('../middleware/initialize')
    , authenticate = require('../middleware/authenticate');

//@return {Object}
//@api protected

exports = module.exports = function() {
    return {
        initialize: initialize,
        authenticate: authenticate
    };
};