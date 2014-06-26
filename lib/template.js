(function(){
	"use strict";

	var doT = require("dot");

	module.exports = Template;

	function Template() {
		function solveDependencies(obj, callback) {
			var key, i, len, tobj, last, tmp;
			// Inefficiency galore

			doT.templateSettings.varname = 'part, it';

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

							// part
							obj.content[obj.dependees[key][i]] = template(obj.content[obj.dependees[key][i]], tobj);

							// Remove solved obj.dependencies
							obj.dependencies[obj.dependees[key][i]].splice(obj.dependencies[obj.dependees[key][i]].indexOf(obj.dependees[key]),1);

							// If the object have no unsolved dependencies run the "it" template
							if(!obj.dependencies[obj.dependees[key][i]].length) {
								obj.content[obj.dependees[key][i]] = template(obj.content[obj.dependees[key][i]], {}, obj.data[obj.dependees[key][i]]);
							}
						}

						// Remove solved obj.dependees
						delete obj.dependees[key];
					}
				}
			}
			
			callback(null, obj.content["%root%"]);
		}

		function template(content, part, it) {
			var
				tmpl,
				key;

			if(typeof content === 'undefined') return;

			part = part || {};
			it = it || {};

			for(key in part) {
				part = extend(part, dataObject(key, part[key]));
			}

			tmpl = doT.template(content);
			return tmpl(part, it);
		}

		function dataObject(name, data) {
			var 
				parts = name.split('.'),
				obj = {},
				curr = obj,
				len = parts.length;

			parts.forEach(function(value, key) { 
				curr[value] = {};

				if(key !== len - 1) {
					curr = curr[value];
				} else {
					curr[value] = data;
				}
			});

			return obj;
		}

		function extend(obj, wth) {
			var i;
			
			obj = obj || {};

			for(i in wth) {
				if(wth.hasOwnProperty(i)) {
					if(typeof wth[i] === "object") {
						obj[i] = extend(obj[i], wth[i]);
					} else {
						obj[i] = wth[i];
					}
				}
			}

			return obj;
		}

		return {
			'solveDependencies': solveDependencies
		};
	}
})();
