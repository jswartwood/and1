var and1 = require("../and1.js")
	, when = require("when")
;

// Global definitions
var Defer = when.defer().constructor
	, Promise = when.defer().promise.constructor
;

// Tests regarding the `queue` method on And1
describe("Queue", function() {

	describe("method", function() {

		it("should be a function of 'and1'", function() {
			and1.should.have.property("queue").be.a("function");
		});

		it("returns a promise", function() {
			and1.queue().should.be.an.instanceof(Promise);
			and1.queue().should.have.property("then").be.a("function");
		});

		it("should accept a resolving function", function( done ) {
			and1.queue(function( defer ) {
				try {
					defer.should.be.an.instanceof(Defer);
					defer.should.have.property("then").be.a("function");
					defer.should.have.property("resolve").be.a("function");
					defer.resolve();
					done();
				} catch (err) {
					done(err);
				}
			}).should.be.ok;
		});

		it("should accept a flag to allow immediate execution", function( done ) {
			and1.queue(function( defer ) {
				try {
					defer.resolve();
					done();
				} catch (err) {
					done(err);
				}
			}, true).should.be.ok;
		});

		it("`then` callback should get the resolution value", function( done ) {
			var str = "This is a test value!";
			and1.queue(function( defer ) {
				defer.resolve(str);
			}).then(function( val ) {
				try {
					val.should.equal(str);
					done();
				} catch (err) {
					done(err);
				}
			});
		});

	});

	describe("waiting", function() {

		it ("should delay any call until prior calls have finished", function( done ) {
			var count = 0;
			and1.queue(function( defer ) {
				setTimeout(function() {
					count.should.equal(0);
					defer.resolve();
				}, 20);
			}).then(function() {
				count.should.equal(0);
				count++;
			});
			and1.queue(function( defer ) {
				count.should.equal(1);
				defer.resolve();
			}).then(function() {
				count.should.equal(1);
				done();
			});
		});

		it("should allow calls run in parallel", function( done ) {
			var count = 0;
			and1.queue(function( defer ) {
				setTimeout(function() {
					count.should.equal(0);
					defer.resolve();
				}, 20);
			}, true).then(function() {
				count.should.equal(0);
				count++;
			});
			and1.queue(function( defer ) {
				count.should.equal(0);
				defer.resolve();
			}, true).then(function() {
				count.should.equal(1);
				done();
			});
		});

	});

	describe("order", function() {

		it("of `then` callback execution should be first to last", function( done ) {
			var count = 0
				, max = 9
			;
			for (var i = 0; i <= max; i++) {
				(function( i ) {
					and1.queue().then(function() {
						try {
							count.should.equal(i);
							count++
							if (i == max) done();
						} catch (err) {
							done(err);
						}
					});
				})(i);
			}
		});

		it("of queued callback execution should be first to last", function( done ) {
			var count = 0
				, max = 9
			;
			for (var i = 0; i <= max; i++) {
				(function( i ) {
					and1.queue(function( defer ) {
						try {
							count.should.equal(i);
							count++;
							defer.resolve();
							if (i == max) done();
						} catch (err) {
							done(err);
						}
					});
				})(i);
			}
		});

		it("should alternate queued cb with `then` cb execution", function( done ) {
			var count = 0
				, max = 9
			;
			for (var i = 0; i <= max; i++) {
				(function( i ) {
					and1.queue(function( defer ) {
						try {
							count.should.equal(i * 2);
							count++;
							defer.resolve();
						} catch (err) {
							done(err);
						}
					}).then(function() {
						try {
							count.should.equal(i * 2 + 1);
							count++;
							if (i == max) done();
						} catch (err) {
							done(err);
						}
					});
				})(i);
			}
		});

	});

});
