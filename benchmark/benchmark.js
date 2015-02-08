var 
	Benchmark = require('benchmark'),
	suite = new Benchmark.Suite,
	partials = require("../partials"),
	nodot = require("./nodot/partials"),
	page = new Buffer("<div>foo</div>{=part.test}");

suite
.add('doT', {
	'defer': true,
	'fn': function (deferred) {
		partials(page, function(err, content){
			deferred.resolve();
		});
	}
})
.add('no doT', {
	'defer': true,
	'fn': function (deferred) {
		nodot(page, function(err, content){
			deferred.resolve();
		});
	}
})
.on('cycle', function(e){
	console.log(String(e.target));
})
.on('complete', function(){
	console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run({'async': true});