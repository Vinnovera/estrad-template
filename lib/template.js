(function(){
	"use strict";

	var
		doT = require("dot"),
		nunjucks = require("nunjucks"),
		extend = require("extend");

	module.exports = function (opts) {
		if (opts.engine === 'dot') {
			doT.templateSettings = extend(doT.templateSettings, opts.templateSettings);
		}

		this.solveDependencies = function(obj, callback) {
			var key;

			// Inefficiency galore

			this.last = null;
			this.dependees = obj.dependees;
			this.dependencies = obj.dependencies;
			this.content = obj.content;
			this.data = obj.data;

			// Clean up dependencies
			this.removeUndefinedContent();

			// Solve dependencies
			while(Object.keys(this.dependees).length) {
				// Detect infinite dependency loops
				if(this.caughtInLoop()) break;

				for(key in this.dependencies) {
					this.evaluateDependency(key);
				}
			}

			callback(null, this.content["%root%"]);
		};

		this.evaluateDependency = function(key) {
			var
				content = {},
				i, len;

			if(this.dependencies.hasOwnProperty(key) &&
				!this.dependencies[key].length &&
				this.dependees[key]) {

				content[key] = this.content[key];

				for(i = 0, len = this.dependees[key].length; i < len; i++) {
					if(typeof this.content[this.dependees[key][i]] === 'undefined') continue;

					this.resolveDependency(content, this.dependees[key][i]);
				}

				// Remove solved this.dependees
				delete this.dependees[key];
			}
		};

		this.resolveDependency = function(content, dependee) {
			// part
			this.content[dependee] = interpolate(this.content[dependee], content);

			// Remove solved dependencies
			this.dependencies[dependee].splice(this.dependencies[dependee].indexOf(dependee), 1);

			// If the object have no unsolved dependencies run the "it" template
			if(!this.dependencies[dependee].length) {

				this.content[dependee] = template(this.content[dependee], this.data[dependee]);
			}
		};

		this.caughtInLoop = function() {
			var tmp = JSON.stringify(this.dependees);

			if(this.last && tmp === this.last) {
				return true;
			}

			this.last = tmp;
			return false;
		};

		this.removeUndefinedContent = function() {
			var
				keys = Object.keys(this.content),
				len = keys.length;

			while(len--) {
				if(typeof this.content[keys[len]] === "undefined") {

					this.cleanupDependencies(keys[len]);
				}
			}
		};

		this.cleanupDependencies = function(key) {
			var
				len = this.dependees[key].length;

			while(len--) {
				this.dependencies[this.dependees[key][len]].splice(this.dependencies[this.dependees[key][len]].indexOf(this.dependees[key][len]), 1);
			}

			delete this.content[key];
			delete this.data[key];
			delete this.dependees[key];
		};

		function template(content, it) {
			console.log(content);
			console.log(it);
			console.log(opts);
			var tmpl = doT.template(content);

			return tmpl(it);
		}

		function interpolate(source, obj) {
			var
				keys = Object.keys(obj),
				i, len, rex;

			for(i = 0, len = keys.length; i < len; i++) {
				// This line is the reason why this app has
				// its own interpolate and don't use another
				// templating engine
				if(typeof obj[keys[i]] === 'undefined') continue;

				rex = ['\\{=part.', keys[i], '\\}'].join('');
				source = source.replace(new RegExp(rex, 'g'), obj[keys[i]]);
			}

			return source;
		}
	};
})();
