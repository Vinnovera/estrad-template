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
				module = parts[parts.length -1],
				queue = 2,
				json = {},
				html = '';

			getDir(parts, function(err, dir) {
				var jsonFile, htmlFile;
				if(err) return callback(err);

				jsonFile = dir + '/' + module + '.json';
				htmlFile = dir + '/template.html';

				fsh.fileContents(htmlFile, {"encoding": "utf8"}, function(err, content) {
					if(err) return callback(err);

					html = content;

					done(null);
				});

				fsh.loadJson(jsonFile, function(err, data) {
					if(!err) {
						json = data;
					}

					done(err);
				});
			});

			function done(err) {
				if(--queue === 0) {
					callback(err, html, json);
				}
			}
		}

		function getDir(parts, callback) {
			fsh.fileExists(o.folder + '/' + parts.join('/'), function(exists) {
				
				if(!exists) {
					parts.pop();
				}

				callback(null, o.folder + '/' + parts.join('/'));
			});
		}

		self.loadPartial = function(name) {
			loadPartial(name, function(err, content, data){
				self.emit('partialLoaded', err, name, content, data);
			});
		};
	}
})();