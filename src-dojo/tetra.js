require({


	// A list of packages to register. Strictly speaking, you do not need to register any packages,
	// but you can't require "app" and get app/main.js if you do not register the "app" package (the loader will look
	// for a module at <baseUrl>/app.js instead). Unregistered packages also cannot use the `map` feature, which
	// might be important to you if you need to relocate dependencies. TL;DR, register all your packages all the time:
	// it will make your life easier.
	packages: [
		// If you are registering a package that has an identical name and location, you can just pass a string
		// instead, and it will configure it using that string for both the "name" and "location" properties. Handy!
		'dojo',
		'tetra'
	]
	// Require `app`. This loads the main application module, `app/main`, since we registered the `app` package above.
}, [ '.' ]);