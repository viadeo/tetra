module.exports = function(api) {
    fs = require('fs');
    var base = require('./lib/tetra.js');
    module.exports = tns = base.tns;
    module.exports = tetra = base.tetra;
    require('./lib/mod/libAbstracted/node-connector.js')(api);
    require('./lib/mod/libAbstracted/builder.js');
    require('./lib/mod/require/node.js');
    require('./lib/mod/tmpl/node.js');
    require('./lib/tetra-controller.js');
    require('./lib/tetra-model.js');
    return tetra;
}
