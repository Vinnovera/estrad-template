(function () {
	"use strict";

	var
		Autoload = require("./lib/autoload"),
		Template = require("./lib/template"),
		doT = require("dot");

	module.exports = Partials;

	function Partials(page, obj, callback) {
		var
			options  = {
				folder: 'modules'
			},
			template = new Template(),
			autoload,
			func;

		// If obj is function use obj as callback
		if(typeof obj === 'function') {
			callback = obj;

		// Else extend options with obj
		} else {
			options = extend(options, obj);
		}

		autoload = new Autoload(options);

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

		func(page, function(err, content, result) {

			if(err) return callback(err);
			// Solve dependencies
			template.solveDependencies(content, result, function(err, obj){
				var page, tmpl;
				if(err) return callback(err);

				doT.templateSettings.varname = 'part';
				tmpl = doT.template(content);
				page = tmpl(obj);
				//page = template.interpolate(content, obj);

				callback(null, page);
			});
		});
	}

	function extend(obj, wth) {
		var i;
		
		for(i in wth) {
			if(wth.hasOwnProperty(i)) {
				obj[i] = wth[i];
			}
		}

		return obj;
	}
})();