var config = {
    common: {
        template: {
            engine: 'ejs',
			options: {
				open: '{%',
				close: '%}'
			},
            nolib: true
        },
        application: {
            name: 'Viadeo Mobile Webapp',
        },
        api: {
            auth_type : 'L5', // api or L5
            client_id : '***',
            client_secret : '***',
            client_id_L5: '***',
            oauth_uri: 'https://secure.viadeo.com',
            api_uri: 'https://api.viadeo.com',
            cookieName: '***'
        },
        i18n: {
            parser: 'viadeoNode'
        },
        user: {
            // Place here COMMUN user-defined configuration
        }
    },
    server: {
        api: {
            client_secret_L5: '***',
            webId_accessToken: '***'
        },
        core: {
            port: 3000,
            enable_cache: true,
            enable_uglify: true,
            enable_cluster: true,
            mime_types: {
                'text/html': [ 'tmpl' ] 
            }
        },
        cache: {
            hosts: [ 
                { host: '127.0.0.1', port: 11211 }
            ],
            timeout: 10000
        },
        session: {
            enabled: true,
            secret: 'blabla'
        },
        connections: {
            'viadeoGeoLoc': {
                type: 'mysql',
                host: '127.0.0.1',
                username: '***',
                password: '***',
                dbname: '***'
            }
        },
        user: {}
    },
    client: {
        user: {}
    }
};
module.exports = config;
