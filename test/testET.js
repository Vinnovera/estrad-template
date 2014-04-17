var
	assert = require("assert"),
	partials = require("../partials");


describe('Estrad Template', function(){
	var
		page = new Buffer("<div>foo</div>{{=part.test}}{{=part.test}}"),
		nestedPage = new Buffer("<div>foo</div>{{=part.sndlvl}}"),
		variantPage = new Buffer("<div>foo</div>{{=part.test.sndlvl}}"),
		undefPage = new Buffer("<div>foo</div>{{=part.test.sndlvl}}{{=part.test.undef}}")
		obj  = {
			folder: 'test/modules'
		};

	describe('Basic', function() {
		it('should interpolate test.json', function(done){
			partials(page, obj, function(err, content){
				if(err) throw err;
				assert.equal(content, "<div>foo</div><div>bar</div><div>bar</div>");
				done();
			});
		});
	});

	describe('Nesting', function() {
		it('should interpolate test.json inside sndlvl/template.html', function(done){
			partials(nestedPage, obj, function(err, content){
				if(err) throw err;
				assert.equal(content, "<div>foo</div><div><div>bar</div></div>");
				done();
			});
		});
	});

	describe('Variants', function() {
		it('should interpolate test.json inside test/sndlvl.json', function(done){
			partials(variantPage, obj, function(err, content){
				if(err) throw err;
				assert.equal(content, "<div>foo</div><div>babar</div>");
				done();
			});
		});
	});

	describe('Undefined', function() {
		it('should interpolate test.json inside test/sndlvl.json and leave {{=part.test.undef}} intact', function(done){
			partials(undefPage, obj, function(err, content){
				if(err) throw err;
				assert.equal(content, "<div>foo</div><div>babar</div>{{=part.test.undef}}");
				done();
			});
		});
	});
});