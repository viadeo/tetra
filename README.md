tetra ![travis](https://secure.travis-ci.org/ohory/tetra.png)  
=====

## A clean MVC javascript framework

Tetra aims to help developer to build faster and easier a more maintainable code.

The idea is to use a completely MVC (for Model, View, Controller) framework which normalize all implementation with a simple syntax splitting code in 3 different layers. Tetra.js framework is also object-oriented: opposite to the procedural programmation which develop the whole logic in a single piece of code, objects allow you to use structured data with preimplemented logic. In our case, objects totally hide the Ajax call for programmation and assure the consistency of data between front-end and back-end.

## Tetra core tree

   * lib
      * **conf**
         Configuration files of core.js for each plateform.
      * **deps**
         External dependencies of client-side framework.
      * **mod**
	     Additonal modules of the core framework. Allows to extend native implementation with advanced features. Already implemented modules are:
		 * *libAbstracted*
		    Abstracted library to use Tetra.js with other librairies than jQuery. Prototype and Node.js connectors are already implemented.
		 * *require*
		    Configuration of RequireJS for Tetra.js use in client-side and server-side (Node.js)
		 * *tmpl*
		    Templating system integrated to the controller and view layer in client and server environnement.
      * _tetra-controller.js_:
	     Controller layer
	  * _tetra-model.js_:
	     Model layer
	  * _tetra-view.js_:
	     View layer
	  * _tetra.js_:
	     Core of Tetra.js framework. Only give interfaces of MVC layers, extend and debug features.

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

If the default settings are correct, your can only call following code (in /conf/default.js):

```js
tetra.start();
```

## Applications tree

   * **coremvc**
      * **apps**
		 * _application name_
		    * **controller**:
		       Controller classes of the application
			   * _***.ctrl.js_
		    * **model**:
		       Model classes of the application
			   * _***.class.js_
		    * **view**:
		       View classes of the application
			   * _***.ui.js_
      * **model**:
		 Global model classes

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