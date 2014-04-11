(function(){
	"use strict";

	var doT = require("dot");

	module.exports = Template;

	function Template() {
		function solveDependencies(obj, dependees, dependencies, callback){
			var key, i, len, tobj, last, tmp, tmpl;
			// Inefficiency galore

			while(Object.keys(dependees).length) {
				// Detect infinite dependency loops
				if(last) {
					tmp = JSON.stringify(dependees);
					if(tmp === last) {
						break;
					} else {
						last = tmp;
					}
				} else {
					last = JSON.stringify(dependees);
				}

				for(key in dependencies) {
					if(dependencies.hasOwnProperty(key) &&
					!dependencies[key].length && 
					dependees[key]) {
						i = 0;
						len = dependees[key].length;
						tobj = {};
						tobj[key] = obj[key];

						for(; i < len; i++) {

							tmpl = doT.template(obj[dependees[key][i]], tobj);
							obj[dependees[key][i]] = tmpl();//interpolate(obj[dependees[key][i]], tobj);

							// Remove solved dependencies
							dependencies[dependees[key][i]].splice(dependencies[dependees[key][i]].indexOf(dependees[key]),1);
						}

						// Remove solved dependees
						delete dependees[key];
					}
				}
			}

			callback(null, obj);
		}

		return {
			'solveDependencies': solveDependencies
		};
	}
})();