define({
	// TODO Simplify
	// TODO Make sure the regex validates
	isJSON: function(data) {
		data = this.trim(data);
		if(!data || data.length === 0) {
			return false;
		}
		return (/^[\],:{}\s]*$/
			.test(data.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
				.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
				.replace(/(?:^|:|,)(?:\s*\[)+/g, '')));
	},

	isArray: function(arr) {
		return Object.prototype.toString.call(arr) == "[object Array]";
	},

	trim: function(data) {
		return (data) ? data.replace(/^\s+|\s+$/g, '') : data;
	}
});