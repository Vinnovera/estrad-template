(function(){
	"use strict";

	var doT = require("dot");

	module.exports = Template;

	function Template() {
		function solveDependencies(page, obj, callback) {
			var key, i, len, tobj, last, tmp, tmpl;
			// Inefficiency galore

			doT.templateSettings.varname = 'part, it';

			// Solve "it" of any dependency-less partial
			for(key in obj.dependencies) {
				if(!obj.dependencies[key].length) {
					tmpl = doT.template(obj.content[key]);
					obj.content[key] = tmpl({}, obj.data[key]);
				}
			}

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
							tmpl = doT.template(obj.content[obj.dependees[key][i]]);
							obj.content[obj.dependees[key][i]] = tmpl(tobj);
							// it
							tmpl = doT.template(obj.content[obj.dependees[key][i]]);
							obj.content[obj.dependees[key][i]] = tmpl({}, obj.data[key]);

							// Remove solved obj.dependencies
							obj.dependencies[obj.dependees[key][i]].splice(obj.dependencies[obj.dependees[key][i]].indexOf(obj.dependees[key]),1);
						}

						// Remove solved obj.dependees
						delete obj.dependees[key];
					}
				}
			}

			for(key in obj.content) {
				obj.content = extend(obj.content, dataObject(key, obj.content[key]));
			}

			doT.templateSettings.varname = 'part';
			tmpl = doT.template(page);
			page = tmpl(obj.content);
			
			callback(null, page);
		}

		function dataObject(name, obj) {
			var 
				parts = name.split('.'),
				module = parts[0],
				version = parts[1],
				newObj = {};

			if(typeof version === "undefined") {
				newObj[name] = obj
				return newObj;
			} else {
				newObj[module] = {};
				newObj[module][version] = obj;
				return newObj;
			}
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