(function(){
	"use strict";

	var 
		doT = require("dot"),
		extend = require("extend");

	module.exports = Template;

	function Template(opts) {
		doT.templateSettings = extend(doT.templateSettings, opts.templateSettings);

		function solveDependencies(obj, callback) {
			var key, i, len, tobj, last, tmp;
			// Inefficiency galore

			// Solve dependencies
			while(Object.keys(obj.dependees).length) {
				// Detect infinite dependency loops
				if(last) {
					tmp = JSON.stringify(obj.dependees);
					if(tmp === last) {
						break;
					} else {
						last = tmp;
					}
				} else {
					last = JSON.stringify(obj.dependees);
				}

				for(key in obj.dependencies) {
					if(obj.dependencies.hasOwnProperty(key) &&
					!obj.dependencies[key].length && 
					obj.dependees[key]) {
						i = 0;
						len = obj.dependees[key].length;
						tobj = {};
						tobj[key] = obj.content[key];

						for(; i < len; i++) {

							if(typeof obj.content[obj.dependees[key][i]] === 'undefined') continue;

							// part
							obj.content[obj.dependees[key][i]] = interpolate(obj.content[obj.dependees[key][i]], tobj);

							// Remove solved obj.dependencies
							obj.dependencies[obj.dependees[key][i]].splice(obj.dependencies[obj.dependees[key][i]].indexOf(obj.dependees[key]),1);

							// If the object have no unsolved dependencies run the "it" template
							if(!obj.dependencies[obj.dependees[key][i]].length) {
								obj.content[obj.dependees[key][i]] = template(obj.content[obj.dependees[key][i]], obj.data[obj.dependees[key][i]]);
							}
						}

						// Remove solved obj.dependees
						delete obj.dependees[key];
					}
				}
			}
			
			callback(null, obj.content["%root%"]);
		}

		function template(content, it) {
			var
				tmpl = doT.template(content);

			return tmpl(it);
		}

		function interpolate(source, obj) {
			var
				keys = Object.keys(obj),
				i = 0,
				len = keys.length,
				rex;

			for(; i < len; i++) {
				// This line is the reason why this app has
				// its own interpolate and don't use another
				// templating engine
				if(typeof obj[keys[i]] === 'undefined') continue;
				rex = '\\{=part.' + keys[i] + '\\}';
				source = source.replace(new RegExp(rex, 'g'), obj[keys[i]]);
			}

			return source;
		}

		return {
			'solveDependencies': solveDependencies
		};
	}
})();
