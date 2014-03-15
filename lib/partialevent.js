(function(){
	"use strict";

	var
		fsh = require('./filehelper'),
		events = require('events'),
		doT = require("dot");

	/* Extend EventEmitter */
	PartialEvent.super_ = events.EventEmitter;
	PartialEvent.prototype = Object.create(events.EventEmitter.prototype, {
		constructor: {
			value: PartialEvent,
			enumerable: false
		}
	});

	module.exports = PartialEvent;

	function PartialEvent() {
		var
			self = this;

		events.EventEmitter.call(self);

		function loadPartial(name, callback){
			var
				parts = name.split("."),
				module = parts[0],
				version = parts[1] || module,
				path = "/modules/" + module + "/",
				file = path + version;

			fsh.fileExists(file + ".json", function(exists){
				if(!exists) {
					// Legacy support
					fsh.fileContents(file + ".html", {"encoding": "utf8"}, function(err, content){
						if(err) return callback(err);

						callback(err, content);
					});
				} else {
					templateJson(file + ".json", path + "template.html", function(err, content){
						if(err) return callback(err);

						callback(err, content);
					});
				}
			});
		}

		/**
		 * It's a bit awkward to keep this method in this class.
		 * But we are dependent on it's completion before we can emit the event
		 */
		function templateJson(path, template, callback){
			var
				ready = 0,
				content,
				obj;

			// Load files in parallel rather than sequentally
			// Both calls have access to both products, when both calls are complete continue to resolveTemplate()
			fsh.loadJson(path, function(err, data){
				if(err) return callback(err);

				obj = data;
				ready++;
				if(ready === 2) return resolveTemplate(content, data, callback);
			});

			fsh.fileContents(template, {"encoding": "utf8"}, function(err, data){
				if(err) return callback(err);

				content = data;
				ready++;
				if(ready === 2) return resolveTemplate(content, obj, callback);
			});
		}

		function resolveTemplate(content, obj, callback) {
			var 
				t = doT.template(content);

			callback(null, t(obj));
		}

		self.loadPartial = function(name) {
			loadPartial(name, function(err, content){
				self.emit('partialLoaded', err, name, content);
			});
		};
	}
})();