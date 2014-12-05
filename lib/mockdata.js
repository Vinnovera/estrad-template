(function () {
	"use strict";

	var
		extend = require("extend");

	module.exports = function(conf) {
		var
			defaults = {
				begin: "\\{\\{",
				end: "\\}\\}",
				namespace: "it"
			},
			settings = extend(defaults, conf || {}),
			interpolate = new RegExp(settings.begin + "!([\\s\\S]+?)" + settings.end, "g");

		function template(tmpl, data) {
			var
				flatData = flattenJson(settings.namespace, data);

			if (!Object.keys(flatData).length) {
				return tmpl;
			}

			return tmpl.replace(interpolate, function(match, tag) {
				if(tag in flatData) {
					return flatData[tag];
				} else {
					return match;
				}
			});
		}

		function flattenJson(parent, obj) {
			var 
				result = {},
				prop, value, key;

			for (prop in obj) {
				value = obj[prop];
				key = [parent, prop].join('.');

				if (typeof value === 'object') {
					result = extend(result, flattenJson(key, value));
				} else {
					result[key] = value;
				}
			}

			return result;
		}

		return {
			template: template
		};
	};
})();