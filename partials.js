(function () {
	"use strict";

	var
		extend = require("extend"),
		Autoload = require("./lib/autoload"),
		Template = require("./lib/template");

	module.exports = function (page, obj, callback) {
		var
			options  = {
				folder: 'modules',
				templateSettings: {}
			},
			template,
			autoload,
			autoloadFunc;

		// If obj is function use obj as callback
		if(typeof obj === 'function') {
			callback = obj;
		} else {

			// Else extend options with obj
			options = extend(options, obj);
		}

		template = new Template(options);
		autoload = new Autoload(options);

		if(typeof page === 'string') {

			// page is an url
			autoloadFunc = autoload.loadFile;
		} else if(typeof page === 'object') {

			// page is a Buffer object
			page = page.toString();
			autoloadFunc = autoload.getPartials;
		} else {

			// Page is not something we can use
			return callback(new Error());
		}

		autoloadFunc(page, function(err, result) {

			if(err) return callback(err);

			// Solve dependencies
			template.solveDependencies(result, function(err, page) {
				if(err) return callback(err);

				callback(null, page);
			});
		});
	};
})();