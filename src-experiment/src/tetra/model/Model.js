define(['tetra/_base/kernel', './MemoryModel', 'tetra/store/JSONStore'], function(kernel, MemoryModel, JSONStore) {

	'use strict';

	// A model backed by a JSONStore
	// =============================

	var Model = kernel.extend(MemoryModel, {

		constructor: function(config) {
			this.store = new JSONStore();
		}

	});

	return Model;
});
