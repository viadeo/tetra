tetra ![travis](https://secure.travis-ci.org/ohory/tetra.png)  
=====

## A clean MVC javascript framework

Tetra aims to help developers to build faster and easier a more maintainable code.

The idea is to use a completely MVC (for Model, View, Controller) framework which normalize all implementations with a simple structure splitting code in 3 different layers :
   * View: DOM access and UX behaviors 
   * Controller: Programmatic logic
   * Model: Structured data and Ajax requesting
   
Interactions between layers are realized using an evenemential system managing asynchronous implementation. Each classes have an access to a communication pipe linked to potential listener.

Tetra.js framework is also object-oriented to encourage you to deal with structured data with their associated logic. An ORM (Object-Relational Mapping) totally hide the Ajax transactions and assure the consistency of data between front-end and back-end.

Additionnally, the "bootstrap" feature manage dynamic loading of javascript scripts from data attributes on DOM elements and through a dependency management system.

## Tetra core tree

   * **lib**
      * **conf**: Configuration files of core.js for each plateform.
      * **deps**: External dependencies of client-side framework.
      * **mod**: Additonal modules of the core framework. Allows to extend native implementation with advanced features. Already implemented modules are:
		 * **libAbstracted**: Abstracted library to use Tetra.js with other librairies than jQuery. Prototype and Node.js connectors are already implemented.
		 * **require**: Configuration of RequireJS for Tetra.js use in client-side and server-side (Node.js)
		 * **tmpl**: Templating system integrated to the controller and view layer in client and server environnement.
      * _tetra-controller.js_: Controller layer
	  * _tetra-model.js_: Model layer
	  * _tetra-view.js_: View layer
	  * _tetra.js_: Core of Tetra.js framework. Only give interfaces of MVC layers, extend and debug features.

Configuration files are used to construct the core object needed to build mvc apps. It must have the following structure :

```js
tetra.extend({
	conf: {
		env: 'jQuery',
		jsVersion: 347,
		enableBootstrap: true
	}
}).start();
```

If the default settings are sufficient, you can only call the start function (as in /conf/default.js):

```js
tetra.start();
```

## Applications tree
By default, the Tetra.js framework recommands to use a directory tree to implement applications. This structure allows you to use the bootstrap feature to load dynamically your javascript resources.

   * **coremvc**
      * **apps**
		 * _application name_
		    * **controller**: Controller classes of the application
			   * _***.ctrl.js_
		    * **model**: Model classes of the application
			   * _***.class.js_
		    * **view**: View classes of the application
			   * _***.ui.js_
      * **model**: Global model classes

## TOC
   * [View layer](docs/view.md)
   * [Controller layer](docs/controller.md)
   * [Model layer](docs/model.md)
   * [ORM (Object-Relational Mapping)](docs/orm.md)
   * [Templating system](docs/templating.md)
   * [Bootstrap](docs/bootstrap.md)
   * [Debugger](docs/debugger.md)
	  
## Licence
(The MIT License)

Copyright (c) Viadeo/APVO Corp., Olivier Hory and other Tetra contributors.

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the
following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.