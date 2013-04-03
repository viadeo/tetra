define(['xhr'], function(xhr){

	var stack = [];
	var requesting;
	var currentRequest;

	return {

		_proceed: function() {
			// TODO This enforces asynchronicity, I think ???
			if(!requesting && stack.length > 0) {
				var params = stack.shift();
				this.request(params.src, params.url, params.options);
			}
		},

		queue: function(src, url, options) {
			stack.push({src: src, url: url, options: options});
			this._proceed();
		},

		request: function(src, url, options) {
			requesting = true;

			var self = this;
			currentRequest = function() {
				self.queue(src, url, options);
			};



		}

	};


});