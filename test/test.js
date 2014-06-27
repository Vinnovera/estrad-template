	assert = require("assert"),
	partials = require("../partials");


describe('Estrad Template', function() {
	var
		settings = {
			"folder": "test/modules"
		},
		main = new Buffer("<div>{=part.main.module}</div>"),
		nested = new Buffer("<div>{=part.main.module.atom}</div>");

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

});