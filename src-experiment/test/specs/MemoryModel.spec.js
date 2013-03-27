define(['tetra/mvc/MemoryModel'], function(MemoryModel){

	describe('Memory Model', function() {

		beforeEach(function() {
			this.model = new MemoryModel({
				schema: {
					"foo": {
						"type": "string",
						"default": "bar"
					}
				},

				init: function() {
					console.log("Calling init");
				}
			});
		});

		afterEach(function() {

		});

		it('should set/get an valid attribute', function() {

			var response  = this.model.attr('foo', 'baz');

			console.log("response", response);

			console.log("data", this.model.getAll());
			console.log("data", this.model.attr('foo'));
		});

		it('should only allow attributes on the schema to be modified', function() {

		});

		it('should block updates that do not conform with the schema', function() {

		});

		it('should revert a model to its previous state', function() {

		});

		it('should ')


	});

});