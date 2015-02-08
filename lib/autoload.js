(function(){
	"use strict";
	var
		fsh = require('./filehelper'),
		PartialEvent = require('./partialevent'),
		chalk = require("chalk");

	module.exports = Autoload;
		
	function Autoload (o) {
		var
			partialEvent = new PartialEvent(o),
			data,
			parts,
			dependees,
			dependencies,
			partialsLeft;

		function loadFile(file, callback) {
			fsh.fileContents(file, {"encoding": "utf8"}, function(err, content){

				if(err) return callback(err);

				getPartials(content, callback);
			});
		}

		function getPartials(content, callback) {
			// %%% acts as an anchor for the deepest level
			// to ensure that each partial is processed
			// %root% is an anchor at the root
			// in an attempt at DRYness
			// % is a character that is otherwise illegal
			data = {
				"%%%": {},
				"%root%": {}
			};
			parts = {
				"%%%": '',
				"%root%": content
			};
			dependees = {
				"%%%": [],
				"%root%": []
			};
			dependencies = {
				"%%%": [],
				"%root%": []
			};
			partialsLeft = 0;

			parseContent(content, function(err){
				var obj;
				if(err) return callback(err);

				obj = {
					data: data,
					content: parts,
					dependencies: dependencies,
					dependees: dependees
				};
				
				callback(null, obj);
			});
		}

		function parseContent(content, callback) {
			var 
				root = parseNextChunk(content, callback),
				i = 0,
				len = root.length;

			// If page has no partials
			if(!len) {
				return callback(null, root);
			} else {
				dependencies["%root%"] = root;

				for(;i < len; i++) {
					dependees[root[i]] = ["%root%"];
				}
			}

			partialEvent.on('partialLoaded', partialEventCallback);

			// I would like to not define this function here, but it needs to both have a reference to parseContnet()'s callback argument and be the callback argument for partialEvents.on()
			function partialEventCallback(err, name, content, obj){
				var 
					i = 0,
					len,
					uses;

				if(err) console.log("[" + chalk.red("estrad-server") + "] " + err);

				uses = parseNextChunk(content, callback);
				uses.push("%%%");

				len = uses.length;
				for(; i < len; i++) {
					if(!dependees.hasOwnProperty(uses[i])) {
						dependees[uses[i]] = [];
					}

					dependees[uses[i]].push(name);
				}
				
				dependencies[name] = uses;

				if(!data.hasOwnProperty(name)) {
					data[name] = obj;
				}

				// This check is redundant right now
				if(!parts.hasOwnProperty(name)) {
					parts[name] = content;
				}

				partialsLeft--;

				if(partialsLeft === 0) {
					// No further partials have been found
					partialEvent.removeListener('partialLoaded', partialEventCallback);
					callback(null, parts);
				}
			}
		}

		function parseNextChunk(content, callback){
			var result;
			findPartials(content, function(err, matches){
				var
					i = 0,
					len = matches.length;

				if(err) return callback(err);
				result = matches;

				for(; i < len; i++) {

					if(!parts.hasOwnProperty(matches[i])) {
						partialsLeft++;
						partialEvent.loadPartial(matches[i]);
					}
				}
			});

			return result;
		}

		/**
		 * Find all the templating parts in use
		 * Keep everything as if async
		 */
		function findPartials(str, callback){
			var
				rex = /\{\{=part.([\s\S]+?)\}\}/g,
				matches = [],
				match;

			while((match = rex.exec(str)) !== null) {
				if(matches.indexOf(match[1]) === -1) {
					matches.push(match[1]);
				}
			}

			callback(null, matches);
		}

		return {
			"loadFile": loadFile,
			'getPartials': getPartials
		};
	}
})();