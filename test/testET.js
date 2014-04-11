var
	assert = require("assert"),
	partials = require("../partials");


describe('Estrad Template', function(){
	var
		page = new Buffer("<div>foo</div>{{=part.test}}"),
		obj  = {
			folder: 'test/modules'
		};

	describe('partials()',function(){
		it('should interpolate test.html', function(done){
			partials(page, obj, function(err, content){
				if(err) throw err;
				assert.equal("<div>foo</div><div>bar</div>", content);
				done();
			});
		});
	});
});