// Testing the MVC underscore (`_`) functionality
// ======================================

// For documentation, see
// 
// * Jasmine - http://pivotal.github.com/jasmine/
// * Sinon - http://sinonjs.org/
// * Markdown - http://daringfireball.net/projects/markdown/

describe("functions exposed on the underscore object", function() {

	"use strict";
	
	var d = document;
	
	beforeEach(function(){
		// Load the test fixture
		loadFixtures("underscore.html");
	});
	
	afterEach(function(){
		this.node = null;
		core.view.destroy("myView", "myScope");
	});
	
	// Test `_` DOM functionality
	// -------------------------------------
	describe("simple DOM functions", function() {
		
		it("should retrieve an element using `_()`", function() {
			var 
				that = this,
				_node
			;
			
			this.node = d.getElementById("classTestNode");
			
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								_node = _("#classTestNode");
							}
						}
					};
				}
			});

			expect(_node[0]).toEqual(this.node);
		});
		
		it("should confirm the presence of an element class using `hasClass`", function() {
			var 
				that = this,
				hasClass = false
			;
			
			this.node = d.getElementById("classTestNode");
			
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								hasClass = _(that.node).hasClass("foo");
							}
						}
					};
				}
			});
			
			expect(hasClass).toBeTruthy();
		});
		
		it("should add a class to an element using `addClass`", function() {
			var 
				that = this
			;
		
			this.node = d.getElementById("classTestNode");
			
			expect(this.node.className.indexOf("bar")).toBe(-1);
			
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								_(that.node).addClass("bar");
							}
						}
					};
				}
			});
			
			expect(this.node.className.indexOf("bar")).not.toBe(-1);
		});
		
		it("should remove a class from an element using `removeClass`", function() {
			var 
				that = this
			;
	
			this.node = d.getElementById("classTestNode");
			
			expect(this.node.className.indexOf("foo")).not.toBe(-1);
			
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								_(that.node).removeClass("foo");
							}
						}
					};
				}
			});
		
			expect(this.node.className.indexOf("foo")).toBe(-1);
		});
		
		it("should check a set of elements against a selector using `is`", function() {
			var 
				that = this,
				trueResults = [],
				falseResults = []
			;

			this.node = d.getElementById("classTestNode");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								var divs = _("body").find("div");
								trueResults.push(_(divs).is("div"));
								trueResults.push(_(that.node).is("#classTestNode"));

								falseResults.push(_(divs).is("span"));
								falseResults.push(_(that.node).is("#xxx"));
							}
						}
					};
				}
			});
	
			for(var i = 0, len = trueResults.length; i < len; i++) {
				expect(trueResults[i]).toBeTruthy();
			}
			len = falseResults.length;
			for(i = 0; i < len; i++) {
				expect(falseResults[i]).toBeFalsy();
			}
		});
		
		it("should return the value of a field using `val`", function() {
			var 
				that = this,
				value
			;

			this.node = d.getElementById("testField");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								value = _(that.node).val();
							}
						}
					};
				}
			});
		
			expect(value).toBe("lorem");
		});
		
		it("should return the html content of an element using `html`", function() {
			var 
				that = this,
				html
			;

			this.node = d.getElementById("testPara");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								html = _(that.node).html().toLowerCase();
							}
						}
					};
				}
			});
		
			expect(html).toBe("<b>lorem</b>");
		});
		
		it("should return the query string of a form element using `serialize`", function() {
			var 
				that = this,
				html
			;

			this.node = d.getElementById("testForm");
			
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								html = _(that.node).serialize().toLowerCase();
							}
						}
					};
				}
			});
		
			expect(html).toBe("username=bob&age=5&hobbies=swimming&hobbies=hiking");
		});
		
		it("should return the query object of a form element using `serialize` with parameter true if _ is the abstracted lib", function() {
			if(_.toggleLib) {
				var 
					that = this,
					html
				;
	
				this.node = d.getElementById("testForm");
				
				core.view.register("myView", {
					scope: "myScope",
					constr: function(me, app, _) {
						return {
							events: {},
							methods: {
								init: function(){
									html = _(that.node).serialize(true);
								}
							}
						};
					}
				});
			
				expect(html).toEqual({username:"bob", age:"5", hobbies:["swimming", "hiking"]});
			}
		});
		
		it("should add content to a set of elements using `append` or `prepend`", function() {
			var 
				that = this,
				appendDiv = d.createElement("div"),
				prependDiv = d.createElement("div"),
				targets
			;
			appendDiv.className = "appendedDiv";
			prependDiv.className = "prependedDiv";
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								targets = _(".appendTarget");
								targets.append(appendDiv);
								targets.prepend(prependDiv);
							}
						}
					};
				}
			});
		
			for(var i = 0, len = targets.length; i < len; i++) {
				var content = targets[i].innerHTML.toLowerCase();
				// <div class=\"prependeddiv\"></div><div class=\"appendeddiv\"></div>
				expect(content.indexOf("prependeddiv")).not.toEqual(-1); 
				expect(content.indexOf("appendeddiv")).not.toEqual(-1);
				expect(content.indexOf("prependeddiv")).toBeLessThan(content.indexOf("appendeddiv"));
			}
		});
		
		
		it("should insert content around a set of elements using `before` or `after`", function() {
			var 
				that = this,
				beforeDiv = d.createElement("div"),
				afterDiv = d.createElement("div"),
				html
			;
			beforeDiv.className = "beforeDiv";
			afterDiv.className = "afterDiv";
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								_(".aroundTarget").before(beforeDiv);
								_(".aroundTarget").after(afterDiv);
								html = _.trim(_('#aroundParent')[0].innerHTML);
							}
						}
					};
				}
			});
		
			html = html.toLowerCase();
			expect(html.indexOf("beforediv")).not.toEqual(-1);
			expect(html.indexOf("afterdiv")).not.toEqual(-1);
			expect(html.indexOf("beforediv")).toBeLessThan(html.indexOf("afterdiv"));
		});
		
		
		it("should replace a set of elements using `replaceWith`", function() {
			var 
				that = this
			;
			
			expect(d.getElementById("toReplace")).not.toBeNull();
			expect(d.getElementById("replaced")).toBeNull();
			
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								_("#toReplace").replaceWith("<div id='replaced'>foo</div>");
							}
						}
					};
				}
			});
		
			expect(d.getElementById("toReplace")).toBeNull();
			expect(d.getElementById("replaced")).not.toBeNull();
		});
		
		it("should remove a set of elements using `remove`", function() {
			var 
				that = this
			;
		
			expect(d.getElementById("toRemove")).not.toBeNull();
			
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								_("#toRemove").remove();
							}
						}
					};
				}
			});
		
			expect(d.getElementById("toRemove")).toBeNull();
		});
		
		it("should modify the css of a set of elements using `css`", function() {
			var 
				that = this,
				changeCss = d.getElementById("changeCss"),
				before,
				beforeCamelised,
				after,
				afterCamelised
			;
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								before = _("#changeCss").css("font-size");
								beforeCamelised = _("#changeCss").css("fontSize");
								_("#changeCss").css("font-size", "22px");
								after = _("#changeCss").css("font-size");
								afterCamelised = _("#changeCss").css("fontSize");
							}
						}
					};
				}
			});
		
			expect(before).toBe("16px");
			expect(beforeCamelised).toBe("16px");
			expect(after).toBe("22px");
			expect(afterCamelised).toBe("22px");
			
			changeCss = null;
		});
		
		it("should retrieve the dimensions of an element using `width` and `height`", function() {
			var 
				that = this,
				dim = d.getElementById("dim"),
				height,
				width
			;
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								height = _("#dim").height();
								width = _("#dim").width();
							}
						}
					};
				}
			});

			expect(height).toBe(20);
			expect(width).toBe(30);
			
			dim = null;
		});

		// ## Error states ##
		it("should return 'false' if the element doesn't exist, for all boolean operations", function() {
			var 
				that = this,
				falseResults = []
			;
	
			this.node = d.getElementById("doesNotExist");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								falseResults.push(_(that.node).is("span"));
								falseResults.push(_(that.node).is("#xxx"));
								falseResults.push(_("#dontExist").hasClass("test"));
							}
						}
					};
				}
			});

			for(var i = 0, len = falseResults.length; i < len; i++) {
				expect(falseResults[i]).toBeFalsy();
			}
		});
		
		it("should return an empty array if the element doesn't exist, for 'update' operations", function() {
			var 
				that = this,
				emptyResults = []
			;
	
			this.node = d.getElementById("doesNotExistEither");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								emptyResults.push(_(that.node).addClass("classy"));
								emptyResults.push(_(that.node).removeClass("classy"));
								emptyResults.push(_("#notThere").append("<b>append</b>"));
								emptyResults.push(_("#notThere").prepend("<b>prepend</b>"));
								emptyResults.push(_("#notThereEither").replaceWith("<b>replacey</b>"));
								emptyResults.push(_(that.node).remove());
							}
						}
					};
				}
			});
	
			for(var i = 0, len = emptyResults.length; i < len; i++) {
				expect(emptyResults[i]).toEqual(jasmine.any(Object), "for element " + i);
				expect(emptyResults[i].length).toBe(0);
			}
		});
		
		it("should return a null or undefined if the element doesn't exist, for 'read' operations", function() {
			var 
				that = this,
				nullResults = []
			;
	
			this.node = d.getElementById("blahblah");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								nullResults.push(_("#nonexistentField").val());
								nullResults.push(_(that.node).attr("style"));
							}
						}
					};
				}
			});
	
			for(var i = 0, len = nullResults.length; i < len; i++) {
				expect(nullResults[i]).toBeFalsy();
			}
		});
		
		it("should return the argument if the element doesn't exist, for the given miscellaneous functions", function() {
			var 
				that = this,
				argResults = []
			;
	
			this.node = d.getElementById("blahblah");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								argResults.push(_("#notThereEither").before("<b>before</b>"));
								argResults.push(_(that.node).after("<b>after</b>"));
							}
						}
					};
				}
			});
	
			expect(argResults[0][0].innerHTML).toBe("before");
			expect(argResults[1][0].innerHTML).toBe("after");
		});
	});

	// Test `_` DOM functionality that returns an array of elements
	// -------------------------------------------------------------------
	describe("DOM functions that return an array of elements", function() {
		
		it("should find an element using a selector and the function `find`", function() {
			var 
				that = this,
				found
			;
	
			this.node = d.getElementById("thirdChild");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								found = _("body").find(".elementToFind");
							}
						}
					};
				}
			});
		
			// As it should include the html, body and immediate parent, anything else is
			// part of the Jasmine test runner
			expect(found[0]).toEqual(d.getElementById("findMe"));
		});
		
		it("should retrieve the ancestors of a set of elements using `parents`", function() {
			var 
				that = this,
				parents
			;
	
			this.node = d.getElementById("thirdChild");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								parents = _(that.node).parents();
							}
						}
					};
				}
			});
		
			// As it should include the html, body and immediate parent, anything else is
			// part of the Jasmine test runner
			expect(parents.length).toBeGreaterThan(2);
			expect(parents[0]).toEqual(d.getElementById("parent"));
		});

		it("should retrieve the siblings of a set of elements using `siblings`", function() {
			var 
				that = this,
				siblings
			;
	
			this.node = d.getElementById("firstChild");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								siblings = _(that.node).siblings();
							}
						}
					};
				}
			});
		
			expect(siblings.length).toBe(2);
			expect(siblings[0]).toEqual(d.getElementById("secondChild"));
			expect(siblings[1]).toEqual(d.getElementById("thirdChild"));
		});
		
		it("should retrieve the immediately preceding sibling of a set of elements using `prev`", function() {
			var 
				that = this,
				prev
			;
	
			this.node = d.getElementById("secondChild");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								prev = _(that.node).prev();
							}
						}
					};
				}
			});
		
			expect(prev[0]).toEqual(d.getElementById("firstChild"));
		});
		
		it("should retrieve the immediately following sibling of a set of elements using `next`", function() {
			var 
				that = this,
				next
			;
	
			this.node = d.getElementById("secondChild");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								next = _(that.node).next();
							}
						}
					};
				}
			});
		
			expect(next[0]).toEqual(d.getElementById("thirdChild"));
		});
		
		// ## Error States ##
		
		it("should return an empty array if the element doesn't exist, for all DOM functions", function() {
			var 
				that = this,
				emptyResults = []
			;
	
			this.node = d.getElementById("doesNotExistEither");
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								emptyResults.push(_("body").find("#notThere"));
								emptyResults.push(_("#notThere").find("*"));
								emptyResults.push(_(that.node).parents());
								emptyResults.push(_("#notThere").siblings());
								emptyResults.push(_("#notThere").prev());
								emptyResults.push(_("#notThereEither").next());
							}
						}
					};
				}
			});
	
			for(var i = 0, len = emptyResults.length; i < len; i++) {
				expect(emptyResults[i]).toEqual(jasmine.any(Object))
				expect(emptyResults[i].length).toBe(0);
			}
		});
		
	});

	// Test `_` helper functions
	// -------------------------
	describe("helper functions", function() {
		
		it("should extend an object using `extend`", function() {
			var 
				that = this,
				obj = {
					foo: "bar"
				}
			;

			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								_.extend(obj, {
									bam: "whoo"
								});
							}
						}
					};
				}
			});
	
			expect(obj.foo).toBe("bar");
			expect(obj.bam).toBe("whoo");
		});
		
		it("should convert a JSON string to an object using `parseJSON`", function() {
			var 
				that = this,
				json = "{ \"foo\": \"bar\"}",
				obj
			;
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								obj = _.parseJSON(json);
							}
						}
					};
				}
			});
	
			expect(obj.foo).toBe("bar");
		});
		
		it("should return the item index if it exists in an array, with `inArray`", function() {
			var 
				that = this,
				array = [1, 2, "3"],
				trueResults = [],
				falseResults = []
			;
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								trueResults.push(_.inArray(1, array));
								trueResults.push(_.inArray(2, array));
								trueResults.push(_.inArray("3", array));
								falseResults.push(_.inArray("1", array));
								falseResults.push(_.inArray(4, array));
								falseResults.push(_.inArray("5", array));
							}
						}
					};
				}
			});
	
			for(var i = 0, len = trueResults.length; i < len; i++) {
				expect(trueResults[i]).not.toBe(-1);
			}
			len = falseResults.length;
			for(i = 0; i < len; i++) {
				expect(falseResults[i]).toBe(-1);
			}
		});
		
		it("should trim a string using `trim`", function() {
			var 
				that = this,
				str = "                   bam                        \n\r"
			;
	
			expect(str).not.toEqual("bam");
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								str = _.trim(str);
							}
						}
					};
				}
			});
	
			expect(str).toEqual("bam");
		});
		
		// ## Error States ##
		
		it("should return the second argument if the object to be extended is null or undefined", function() {
			var 
				that = this,
				obj,
				newObj
			;

			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								newObj = _.extend(obj, {
									bam: "whoo"
								});
							}
						}
					};
				}
			});
	
			expect(newObj.foo).toBeUndefined();
			expect(newObj.bam).toBe("whoo");
		});
		
		it("should throw an exception if parseJSON is passed an invalid string", function() {
			var 
				that = this,
				json = "{ foo\": \"bar\"}",
				spy = sinon.spy()
			;
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								try{
									_.parseJSON(json);
								} catch(e) {
									spy();
								}
							}
						}
					};
				}
			});
	
			expect(spy.calledOnce).toBeTruthy();
		});
		
		it("should return -1 from `inArray` if the array is null or undefined", function() {
			var 
				that = this,
				array,
				results = []
			;
	
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								results.push(_.inArray(1, array));
								results.push(_.inArray(2, null));
							}
						}
					};
				}
			});
	
			for(var i = 0, len = results.length; i < len; i++) {
				expect(results[i]).toBe(-1);
			}
		});
		
		it("should return an empty string if `trim` is passed null or undefined", function() {
			var 
				that = this,
				str,
				results = []
			;
	
			expect(str).not.toEqual("bam");
			core.view.register("myView", {
				scope: "myScope",
				constr: function(me, app, _) {
					return {
						events: {},
						methods: {
							init: function(){
								results.push(_.trim(str));
								results.push(_.trim(null));
							}
						}
					};
				}
			});
	
			for(var i = 0, len = results.length; i < len; i++) {
				expect(results[i]).toBe("");
			}
		});
	});
});