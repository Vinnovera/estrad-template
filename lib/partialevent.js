(function(){
	"use strict";

	var
		fsh = require('./filehelper'),
		events = require('events');

	/* Extend EventEmitter */
	PartialEvent.super_ = events.EventEmitter;
	PartialEvent.prototype = Object.create(events.EventEmitter.prototype, {
		constructor: {
			value: PartialEvent,
			enumerable: false
		}
	});

	module.exports = PartialEvent;

	function PartialEvent(o) {
		var
			self = this;

		events.EventEmitter.call(self);

		function loadPartial(name, callback){
			var
				parts = name.split('.'),
				module = parts[0],
				version = parts[1] || module,
				jsonPath = o.folder + "/" + module + "/" + version + ".json",
				htmlPath = o.folder + "/" + module + "/template.html",
				counter = 0,
				json = {},
				html;

			counter++;
			fsh.fileContents(htmlPath, {"encoding": "utf8"}, function(err, content) {
				if(err) return callback(err);

				html = content;

				if(--counter === 0) {
					callback(err, html, json);
				}
			});

			counter++;
			fsh.loadJson(jsonPath, function(err, data){
				if(!err) {
					json = data;
				}

				if(--counter === 0) {
					callback(err, html, json);
				}
			});
		}

		self.loadPartial = function(name) {
			loadPartial(name, function(err, content, data){
				self.emit('partialLoaded', err, name, content, data);
			});
		};
	}
})();