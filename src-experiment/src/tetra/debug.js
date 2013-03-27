define([], function(){

	var defaultConfig = {
		scope: 'all'
	};

	// TODO Make debug methods in MVC public if this module is loaded

	return {

		enable: function(scope) {

		},

		man: function() {

		},

		log: function(msg, scope, type, data) {
			if(has('console')) {
				try {
					console[type || 'log'](msg, data || '');
				} catch(e){
					// Ignore failures
				}
			}
		}
	};
});