(function(){
	"use strict";

	var
		fsh = require('./filehelper'),
		chalk = require('chalk'),
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
				moduleVersion = parts[parts.length -1],
				queue = 2,
				json = {},
				html = '';

			getDir(parts, function(err, dir) {
				var
					jsonFile, htmlFile, parts, moduleName;

				if(err) return callback(err);

				// The standard module version name is the same as moduleName
				parts = dir.split('/');
				moduleName = parts[parts.length - 1];

				jsonFile = dir + '/' + moduleVersion + '.json';
				htmlFile = dir + '/' + moduleName + '.html';

				fsh.fileContents(htmlFile, {"encoding": "utf8"}, function(err, content) {
					if(err) return callback('Error: Html file missing for: ' + chalk.cyan(name));

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