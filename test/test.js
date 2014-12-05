	assert = require("assert"),
	partials = require("../partials");


describe('Estrad Template', function() {
	var
		settings = {
			"folder": "test/modules"
		},
		main = new Buffer("<div>{=part.main.module}</div>"),
		nested = new Buffer("<div>{=part.main.module.atom}</div>"),
		alternative = new Buffer("<div>{=part.main.module.alternative}</div>"),
		unresolved = new Buffer("<div>{=part.unresolved}</div>"),
		mixed = new Buffer("<div>{=part.main.mixed}</div>"),
		infinite = new Buffer("<div>{=part.main.infinite}</div>");

	describe("Basic", function() {
		it("should interpolate module.json", function(done) {
			partials(main, settings, function(err, content) {
				assert.equal(content, "<div>bar</div>");
				done();
			});
		});

		it("should interpolate template.html", function(done) {
			partials(nested, settings, function(err, content) {
				assert.equal(content, "<div>babar</div>");
				done();
			});
		});
	});


	describe("Error handling", function() {
		it("should keep unresolved partial", function(done) {
			partials(unresolved, settings, function(err, content) {
				assert.equal(content, "<div>{=part.unresolved}</div>");
				done();
			});
		});
		
		it("should break out of infinite loop", function(done) {
			partials(infinite, settings, function(err, content) {
				assert.equal(content, "<div>{=part.main.infinite}</div>");
				done();
			});
		});
	});
	
	describe("Mockdata", function() {
		it("should interpolate alternative.json", function(done) {
			partials(alternative, settings, function(err, content) {
				assert.equal(content, "<div>foo</div>");
				done();
			});
		});

		it("should solve doT and partials", function(done) {
			partials(mixed, settings, function(err, content) {
				assert.equal(content, "<div>barstool</div>");
				done();
			});
		});

		it("should solve both versions of module", function(done) {
			var page = new Buffer("<div>{=part.main.module.alternative}{=part.main.module}</div>");

			partials(page, settings, function(err, content) {
				assert.equal(content, "<div>foobar</div>");
				done();
			});
		});

		it("should not remove undefined mock data", function(done) {
			var page = new Buffer("{{!it.undefined}}{=part.main.module}");

			partials(page, settings, function(err, content) {
				assert.equal(content, "{{!it.undefined}}bar");
				done();
			});
		});
	});
});