define(['tetra/model/MemoryModel', 'tetra/_base/Component'], function(MemoryModel, Component){

	describe('Memory Model', function() {

		beforeEach(function() {
			this.model = new MemoryModel({
				schema: {
					"foo": {
						"type": "string",
						"default": "bar"
					},
					"arr": {
						"type": "array",
						"default": []
					}
				},

				init: function() {
					console.log("Calling init");
				}
			});
		});

		afterEach(function() {
			console.log("Destroying");
			this.model.destroy();
			this.model = null;
		});

		it('should set/get an attribute that is present on the schema', function() {
			expect(this.model.getAll()).toEqual({});

			this.model.attr('foo', 'bar');
			this.model.attr('arr', [1, 2]);

			expect(this.model.getAll()).toEqual({foo: 'bar', arr: [1, 2]});
			expect(this.model.attr('foo')).toEqual('bar');
			expect(this.model.attr('arr')).toEqual([1, 2]);
		});

		it('should allow multiple attributes to be set at once', function() {
			expect(this.model.getAll()).toEqual({});

			this.model.attr({
				foo: 'bar',
				arr: [1, 2]
			});

			expect(this.model.getAll()).toEqual({foo: 'bar', arr: [1, 2]});
			expect(this.model.attr('arr')).toEqual([1, 2]);
		});

		it('should ignore get/set operations on an attribute that is *not* present on the schema', function() {
			expect(this.model.getAll()).toEqual({});

			this.model.attr('baz', 'bar');

			expect(this.model.getAll()).toEqual({});

			this.model.attr({
				baz: 'bar',
				bar: [1, 2]
			});

			expect(this.model.getAll()).toEqual({});
		});

		it('should allow attributes to be set on more than one model, without interference', function() {
			var secondModel = new MemoryModel({
				schema: {
					"foo": {
						"type": "string",
						"default": "bar"
					},
					"arr": {
						"type": "array",
						"default": []
					}
				},

				init: function() {
					console.log("Calling init");
				}
			});

			expect(this.model.getAll()).toEqual({});
			expect(secondModel.getAll()).toEqual({});

			this.model.attr('foo', 'bar');

			expect(this.model.getAll()).toEqual({foo: 'bar'});
			expect(secondModel.getAll()).toEqual({});
		});

		it('should rollback a single attribute change', function() {

			this.model.attr('foo', 'bar');  // Set the value
			this.model.attr('foo', 'baz');  // Change the value

			expect(this.model.getAll()).toEqual({foo: 'baz'});

			this.model.rollback();

			expect(this.model.getAll()).toEqual({foo: 'bar'});
		});

		it('should rollback a collection of attributes changes', function() {
			// Set some values
			this.model.attr({
				foo: 'bar',
				arr: [1, 2]
			});

			// Change the values
			this.model.attr({
				foo: 'baz',
				arr: [1, 2, 3]
			});

			expect(this.model.getAll()).toEqual({foo: 'baz', arr: [1, 2, 3]});

			this.model.rollback();

			expect(this.model.getAll()).toEqual({foo: 'bar', arr: [1, 2]});
		});

		it('should rollback a model after multiple changes', function() {
			// Set some values
			this.model.attr({
				foo: 'bar',
				arr: [1, 2]
			});

			// Change the values
			this.model.attr({
				foo: 'baz',
				arr: [1, 2, 3]
			});

			// Change the values again
			this.model.attr({
				foo: 'boo',
				arr: [1, 2, 3, 4]
			});

			this.model.rollback();

			expect(this.model.getAll()).toEqual({foo: 'baz', arr: [1, 2, 3]});
		});

		it('should validate the model data on save according to the schema', function() {
			this.model.attr({
				id: "1",
				foo: 'bar',
				arr: [1, 2]
			});

			var spy = sinon.spy();
			var promise = this.model.save();

			promise.then(function() {
				spy();
			});
			promise.otherwise(function(){
				spy();
			});

			waitsFor(function() {
				return spy.callCount;
			})

			runs(function() {
				expect(spy.callCount).toBe(1);
			});
		});
	});

});