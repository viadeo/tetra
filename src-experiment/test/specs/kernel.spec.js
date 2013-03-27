define(['tetra/_base/kernel', 'tetra/_base/Component'], function(kernel, Component){

	describe('tetra kernel', function(){

		xit("should create an object from a prototype", function() {
			var myProto = {
				name: 'test',
				id: 5,
				entities: {
					x: 1,
					y: 2
				}
			};

			var myObj = kernel.create(myProto);
			var mySecondObject = kernel.create(myProto);
			myObj.entities.x = 5;
			myObj.foo = 'bar';

			var mySubObj = kernel.create(myObj);

			console.log(myObj);
			console.log(mySecondObject);
			console.log(mySubObj);
		});

		xit("should allow one Component object to extend another", function() {

			var Module = kernel.extend(Component, {
				sayName : function() {
					console.log('i say my name!');
				}
			});

			var BetterModule = kernel.extend(Module, {
				sayNameBetter : function() {
					this.sayName(); // Inherits 'sayName' from 'Module'
				},

				sayName : function() {
					BetterModule.parent.sayName.apply(this, arguments);
				}
			});

			var module = new BetterModule();

			module.sayNameBetter();

			kernel.mixin(module, {
				test: 1
			});
			console.log(module);

		});

		it("should allow one object to be mixed into another", function() {

		});
	});
});