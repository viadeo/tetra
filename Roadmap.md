# Roadmap

## Tetra.next 

Feel free to complete.

### Short-term roadmap

NB : This is just a draft of the initial steps of a higher-level roadmap.

* Make contributions easier (and modularization)
    * improve comprehension by writing a better doc
    * add more sample codes and common patterns
    * simplify documentation
    * explain deep concepts of current objects
    * modularization of main implementation functions
    * make model usage better understood
* Facilitate usage
    * Views able to listen to global events (but unable to emit)
    * XHR easier to write and param
    * async XHR (removing queuing)
* Avoid technical debt
    * helpers lib for common use cases
    * extensible modules (views, controllers, models)
* Remove node specific code
* Simplify syntax

### Big pictures draft : 

* Use AMD (tetra implementation AND usage)
* More doc, more examples
* Core modules (view, model, controller) 
    * to be constructors 
    * allowing extensible objects to be created<sup>*</sup>
* Replace implementation functions by heavy used dependencies
* Keep API safe or ease migration

<sup>*</sup>: Controllers define behaviors that could be easily reused across different views and data panels.


