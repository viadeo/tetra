// Application init
var express = require('express');
var app = module.exports = express();


// Run mode (development, preprod, production)
var RUN_MODE = app.settings.env;


var fs              = require('fs');				// CONTRIB
var cluster         = require('cluster');			// CONTRIB
var lingua          = require('viadeo-lingua');		// CONTRIB + VIADEO
var gzippo          = require('gzippo');			// CONTRIB
//var zlib            = require('zlib');			// NODE
var log4js          = require('log4js');			// CONTRIB
var config          = require(__dirname + '/conf/app_' + RUN_MODE);	// VIADEO
var uglify          = require('express-uglify');	// CONTRIB
var Memcached       = require('memcached');			// CONTRIB
var memcached       = null;
var MemcachedStore  = require('connect-memcached')(express);	// CONTRIB

// Settings
var _conf = {
    cluster     : true,
    cache       : {
        enabled : ( RUN_MODE === 'production') ? true : false,
        timeout : 10000
    },
    uglify      : ( RUN_MODE === 'production') ? true : false,
    template    : {
        engine  : 'ejs',
		options : {}
    },
    log         : {
        conf    : __dirname + '/conf/log4js_'+RUN_MODE+'.json',
        dir     : __dirname + '/log'
    },
    i18n        : {
        locale  : 'en',
        dir     : __dirname + '/resources/translations',
        parser  : 'viadeoNode',
        enabled : false
    },
    api         : {
        auth_type: 'api'
    }
}


    //-- workers
    if(typeof config.server.core.enable_cluster !== 'undefined') _conf.cluster = config.server.core.enable_cluster;

    
    //-- cache & uglification
    if(typeof config.server.core.enable_cache !== 'undefined') _conf.cache.enabled = config.server.core.enable_cache;
    if(typeof config.server.cache.timeout !== 'undefined') _conf.cache.timeout = config.server.cache.timeout;
    if(typeof config.server.core.enable_uglify !== 'undefined') _conf.uglify = config.server.core.enable_uglify;


    //-- template
    if(typeof config.common.template.engine !== 'undefined') _conf.template.engine = config.common.template.engine;
	if(typeof config.common.template.options !== 'undefined') _conf.template.options = config.common.template.options;
    

    //-- log
    if(typeof config.server.core.logconf !== 'undefined') _conf.log.conf = config.server.core.logconf;
    if(typeof config.server.core.logdir !== 'undefined') _conf.log.dir = config.server.core.logdir;


    //-- i18n
    if(typeof config.common.i18n.dir !== 'undefined') {
        _conf.i18n.dir = config.common.i18n.dir;
        if ( ! /^\//.test(_conf.i18n.dir) ) { _conf.i18n.dir = __dirname + '/' + _conf.i18n.dir; }
    }

    if(typeof config.common.i18n.default_locale !== 'undefined') _conf.i18n.locale = config.common.i18n.default_locale;

    if(typeof config.common.i18n.parser !== 'undefined') _conf.i18n.parser = config.common.i18n.parser;
        var i18n = require('viadeo-i18n/' + _conf.i18n.parser);
        _conf.i18n.linguaResourceParser = i18n.linguaResourceParser;
        _conf.i18n.linguaSentenceParser = i18n.linguaSentenceParser;
        _conf.i18n.linguaDynamicRetriever = i18n.linguaDynamicRetriever;
    

    //-- api
    if(typeof config.common.api.client_id_L5 !== 'undefined') _conf.api.client_id_L5 = config.common.api.client_id_L5;
    if(typeof config.server.api.client_secret_L5 !== 'undefined') _conf.api.client_secret_L5 = config.server.api.client_secret_L5;
    if(typeof config.common.api.client_id !== 'undefined') _conf.api.client_id = config.common.api.client_id;
    if(typeof config.common.api.client_secret !== 'undefined') _conf.api.client_secret = config.common.api.client_secret;
    if(typeof config.server.api.webId_accessToken !== 'undefined') _conf.api.access_token_L5 = config.server.api.webId_accessToken;
    if(typeof config.common.api.cookieName !== 'undefined') _conf.api.sdk_cookieName = config.common.api.cookieName;
    else _conf.api.sdk_cookieName = 'vds_' + _conf.api.client_id;
    
    if(typeof config.common.api.auth_type !== 'undefined') _conf.api.auth_type = config.common.api.auth_type;


// log4js -----------------------------
log4js.configure(_conf.log.conf, {});
log4js.loadAppender('file');

var
    logger       = log4js.getLogger('server'),
    accessLogger = log4js.getLogger('server/access')
;

logger.info("LOG CONFIGURATION : " + fs.realpathSync(_conf.log.conf));
logger.info("LOG DIRECTORY : " + fs.realpathSync(_conf.log.dir));


if ( RUN_MODE !== 'test' ) { // too verbose for expresso testing needs
log4js.addAppender(log4js.appenders.file(_conf.log.dir + '/access.log', log4js.layouts.messagePassThroughLayout), 'server/access');
}


// i18N -------------------------------
try {
    fs.statSync(_conf.i18n.dir);
    logger.info("I18N DIRECTORY : " + fs.realpathSync(_conf.i18n.dir));
} catch ( e ) {
    _conf.i18n.dir = undefined;
}

if (!_conf.i18n.dir && !_conf.i18n.linguaDynamicRetriever) {
    _conf.i18n.enabled = false;
    logger.info("I18N DEACTIVATED (no specific handlers, no i18n directory)");
} else {
    _conf.i18n.enabled = true;
}


// Configuration ----------------------
app.configure(function(){
  app.set('views', __dirname + '/view');
  app.set('controllers', __dirname + '/controller');
  app.set('models', __dirname + '/model');
  app.set('view engine', _conf.template.engine);
  //app.set('view options', _conf.template.options);
  if(_conf.template.engine == 'ejs') {
	var ejs = require('ejs');
	ejs.open = _conf.template.options.open;
	ejs.close = _conf.template.options.close;
  }
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  //app.use(express.static(__dirname + '/resources'));
  
    // Access log ---------------------
    app.use( log4js.connectLogger( accessLogger ) );    

    // Memcached ----------------------
    var servers = [];
    for (var i in config.server.cache.hosts) {
        var mc_host = config.server.cache.hosts[i];
        servers.push( mc_host.host + ':' + mc_host.port);
    }
    memcached = new Memcached(servers, {});

    // Session ------------------------
    if (config.server.session && config.server.session.enabled) {
        logger.info("SESSION support activated through memcache");
        app.use( express.session( {
                                    secret: config.server.session.secret || 'viadeoonfire',
                                    store: new MemcachedStore( { hosts: servers } )
                                  }
                                )
               );
    }

    // Uglify / Gzip ------------------
    if ( _conf.uglify ) {
        logger.info('Static javascript auto-uglify activated');
        app.use( uglify.middleware({ src: __dirname + '/resources' })); // UGLIFY
    }

    app.use( gzippo.staticGzip( __dirname + '/resources' ) ); // HTTP GZIP

    // Lingua -------------------------
    if ( _conf.i18n.enabled ) {
        /*fs.stat( _conf.i18n.dir, function(err, stat) {
          if (err && (!_conf.i18n.linguaDynamicRetriever) ) {
              logger.error("I18N support deactivated", err ? err : '');
          } else {*/
              app.use(lingua(app, {
                  defaultLocale:    _conf.i18n.locale,
                  path:             _conf.i18n.dir,
                  resourceParser:   _conf.i18n.linguaResourceParser,
                  sentenceParser:   _conf.i18n.linguaSentenceParser,
                  dynamicRetriever: _conf.i18n.linguaDynamicRetriever
              }));
              logger.info("I18N support activated through Viadeo-Lingua for Express.js");
          /*}
        });*/
    }

    // Router (must be last) ----------
    app.use(app.router);

});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Tetra implementation ----------------
if(typeof tetra === 'undefined') {
    var api = require('viadeo-jsapi')(config.common.api.oauth_uri, config.common.api.api_uri, memcached);
    var tetra = require('tetra')(api);
	tetra.extend({
		conf: {
			env: 'Node',
			APPS_PATH: __dirname,
			GLOBAL_PATH: __dirname + '/../../',
			cacheTimeout: _conf.cache.timeout,
			mysql: {
				db: '',
				user: '',
				password: ''
			}
		},
        cache: function(_conf, _mod, _) {
            return memcached;
        }
	}).start();
	if ( RUN_MODE != 'development' ) tetra.debug.enable();
}

// Routing ----------------------------
var coreRouting = function(req, res, next) {
  if(typeof req.params.rep === 'undefined') req.params.rep = 'home';
  if(typeof req.params.page === 'undefined') req.params.page = 'index';
  if((req.params.rep === 'js')
    || (req.params.rep === 'css')
    || (req.params.rep === 'images')
    || (req.params.rep === 'translations')) {
    return next();
  }
 
  //linguaUse(req, res, function(){});

  if((req.params.rep !== 'login') && (typeof req.session === 'undefined' || typeof req.session.api_access_token === 'undefined')) {
    if(_conf.api.auth_type === 'api') res.redirect('/api-login');
    else {
        api.checkCookies(req, _conf.api.sdk_cookieName, _conf.api.access_token_L5, function(error, graphID, access_token, L5_access_token) {
            if(graphID === -1) res.redirect('/login');
            else {
                if(typeof access_token !== 'undefined' && typeof L5_access_token !== 'undefined') {
                    req.session.api_access_token = access_token;
                    req.session.api_access_token_L5 = L5_access_token;
                    res.redirect('/');
                }
                else {
                api.getTokens(req, _conf.api.client_id_L5, _conf.api.client_secret_L5, _conf.api.client_id, undefined, undefined, graphID, 'http://' + req.header('host') + '/login', function(error, access_token, L5_access_token) {
                    if(typeof error === 'undefined' && access_token !== -1) {
                        req.session.api_access_token = access_token;
                        req.session.api_access_token_L5 = L5_access_token;
                        res.redirect('/');
                    } else {
                        res.redirect('/login');
                    }
                });
                }
            }
        });
    }
  } else {
    if(typeof req.session.api_access_token !== 'undefined') {
		_conf.api.access_token = req.session.api_access_token;
		tetra.extend('conf', {api: _conf.api});
    }
    tetra.controller.exec(req.params.page, req.params.rep, req, res, 'node');
  }
};

app.get('/api-login', function(req, res) {
    res.redirect(api.getAuthorizeUrl({
        response_type: 'code',
        client_id: _conf.api.client_id,
        redirect_uri: 'http://' + req.header('host') + '/oauth'
    }));
});

app.post('/oauth', function (req, res) {
    var 
        email = req.param('user_email'),
        pwd = req.param('user_pwd')
    ;
     
    api.getTokens(req, _conf.api.client_id_L5, _conf.api.client_secret_L5, _conf.api.client_id, email, pwd, undefined, 'http://' + req.header('host') + '/login', function(error, access_token, L5_access_token) {
		req.session.api_access_token = access_token;
		req.session.api_access_token_L5 = L5_access_token;
		res.redirect('/');
    });
}); 

app.get('/oauth', function (req, res) {
    api.getAccessToken(_conf.api.client_id, _conf.api.client_secret, req.param('code'), 'http://' + req.header('host') + '/oauth', function(error, access_token, refresh_token) {
        req.session.api_access_token = access_token;
        res.redirect('/');
    }); 
});

var routes = {
    '/': coreRouting,
    '/:rep': coreRouting,
    '/:rep/:page': coreRouting
};

for(var route in routes) {
    app.get(route, routes[route]);
    app.post(route, routes[route]);
    app.put(route, routes[route]);
    app.del(route, routes[route]);
}

// Default exceptions ---------------------------------------------------------
process.on('uncaughtException', function (err) {
    logger.fatal('Express uncaught exception: ', err);
});

// Launch server --------------------------------------------------------------
if ( RUN_MODE != 'test' ) { // Expresso will launch server on testing

    // LISTENING PORT determination -------------------------------------------
    var port = config.server.core.port || 3000;

    if ( _conf.cluster ) { // CLUSTER MODE =================================

        var http = require('http');
        var numCPUs = require('os').cpus().length;
      
        if (cluster.isMaster) {
          // Fork workers.
          for (var i = 0; i < numCPUs; i++) {
            cluster.fork();
          }

          cluster.on('death', function(worker) {
            console.log('worker ' + worker.pid + ' died');
            cluster.fork();
          });
        } else {
            app.listen(port);
        }
        
    } else { // NO CLUSTER ====================================================
        app.listen(port);
    }

    // -------------------------------------------------------------------------
    var appname = config.common.application.name || 'Unknown';
    logger.info( "Express server listening on port %d in %s mode", port, app.settings.env);
    logger.info( "Tetra.js framework initialized for application '" + appname + "'" );
}
