require('./lib/deps/jquery/dist/jquery.min.js');
require('./lib/deps/json2.js');
require('./lib/deps/require.js');

fs = require('fs');
var base = require('./lib/tetra.js');
module.exports = tns = base.tns;
module.exports = tetra = base.tetra;
require('./lib/mod/require/client.js');
require('./lib/mod/tmpl/client-micro-tmpl.js');
require('./lib/tetra-view.js');
require('./lib/tetra-controller.js');
require('./lib/tetra-model.js');

require('./spec/javascripts/specs/core/conf/viadeo-webapp.js');
require('./spec/javascripts/lib/Sinon.JS/sinon-1.4.2.js');
require('./spec/javascripts/lib/Sinon.JS/sinon-ie-1.4.2.js');
require('./spec/javascripts/lib/jasmine/lib/jasmine-jquery.js');
require('./spec/javascripts/lib/jasmine/conf/init_local_fixtures.js');
require('./spec/javascripts/lib/utils.js');

require('./spec/javascripts/specs/core/core.spec.js');
require('./spec/javascripts/specs/core/model/*.spec.js');
require('./spec/javascripts/specs/core/controller/*.spec.js');
require('./spec/javascripts/specs/core/view/core.templating.spec.js');
require('./spec/javascripts/specs/core/view/core.view.spec.js');
require('./spec/javascripts/specs/core/view/underscore.ui.spec.js');