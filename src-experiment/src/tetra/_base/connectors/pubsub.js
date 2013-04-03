define(['pubsub'], function(PubSub) {

	'use strict';

	return {
		publish: function(message, data){
			return PubSub.publish(message, data);
		},

		subscribe: function(message, callback) {
			return PubSub.subscribe(message, callback);
		}
	};
});