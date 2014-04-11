(function(){
	"use strict";

	var doT = require("dot");

	module.exports = Template;

	function Template() {
		function solveDependencies(obj, callback){
			var key, i, len, tobj, last, tmp, tmpl;
			// Inefficiency galore

			doT.templateSettings.varname = 'part';

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
						tobj[key] = obj.data[key];

						for(; i < len; i++) {

							tmpl = doT.template(obj.data[obj.dependees[key][i]]);
							obj.data[obj.dependees[key][i]] = tmpl(tobj);
							//obj.data[obj.dependees[key][i]] = interpolate(obj.data[obj.dependees[key][i]], tobj);

							// Remove solved obj.dependencies
							obj.dependencies[obj.dependees[key][i]].splice(obj.dependencies[obj.dependees[key][i]].indexOf(obj.dependees[key]),1);
						}

						// Remove solved obj.dependees
						delete obj.dependees[key];
					}
				}
			}

			callback(null, obj.data);
		}

		return {
			'solveDependencies': solveDependencies
		};
	}
})();