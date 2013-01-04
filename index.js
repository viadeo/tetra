module.exports = function(api) {
    fs = require('fs');
    var base = require('./src/tetra.js');
    module.exports = tns = base.tns;
    module.exports = tetra = base.tetra;
    require('./src/view/connector/node-connector.js')(api);
    require('./src/view/connector/builder.js');
    require('./src/conf/requirejs/node.js');
    require('./src/view/node.js');
    require('./src/controller/tetra-controller.js');
    require('./src/model/tetra-model.js');
    return tetra;
}
