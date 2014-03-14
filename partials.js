(function () {
	"use strict";

	var
		Autoload = require("./lib/autoload"),
		Template = require("./lib/template");

	module.exports = Partials;

	function Partials(page, callback) {
		var
			autoload = new Autoload(),
			template = new Template(),
			func;

		if(typeof page === 'string') {
			// page is an url
			func = autoload.loadFile;
		} else if (typeof page === 'object') {
			// page is a Buffer object
			page = page.toString();
			func = autoload.getPartials;
		} else {
			return callback(new Error());
		}

		func(page, function(err, content, obj, dependencies, dependees) {

			if(err) return callback(err);
			// Solve dependencies
			template.solveDependencies(obj, dependees, dependencies, function(err, obj){
				var page;
				if(err) return callback(err);

				page = template.interpolate(content, obj);

				callback(null, page);
			});
		});
	}
})();