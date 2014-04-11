var
	assert = require("assert"),
	partials = require("../partials");


describe('Estrad Template', function(){
	var
		page = new Buffer("<div>foo</div>{{=part.test}}{{=part.test}}"),
		nestedPage = new Buffer("<div>foo</div>{{=part.sndlvl}}"),
		variantPage = new Buffer("<div>foo</div>{{=part.test.sndlvl}}"),
		obj  = {
			folder: 'test/modules'
		};

	describe('Basic', function() {
		it('should interpolate test.html', function(done){
			partials(page, obj, function(err, content){
				if(err) throw err;
				assert.equal(content, "<div>foo</div><div>bar</div><div>bar</div>");
				done();
			});
		});
	});

	describe('Nesting', function() {
		it('should interpolate test.html inside sndlvl/sndlvl.html', function(done){
			partials(nestedPage, obj, function(err, content){
				if(err) throw err;
				assert.equal(content, "<div>foo</div><div><div>bar</div></div>");
				done();
			});
		});
	});

	describe('Variants', function() {
		it('should interpolate test.html inside test/sndlvl.html', function(done){
			partials(variantPage, obj, function(err, content){
				if(err) throw err;
				assert.equal(content, "<div>foo</div><div><div>bar</div></div>");
				done();
			});
		});
	});
});