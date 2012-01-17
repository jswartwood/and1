var when = require("when");

var lastPromise;

module.exports = {
	queue: function( andOne, runNow ) {
		var useAnd = typeof andOne === "function"
			, andDefer = when.defer()
			, pass = when.defer()
			, allPromises = [ lastPromise, andDefer ]
		;
		
		if (useAnd && runNow) {
			andOne(andDefer);
		} else {
			when(lastPromise, function() {
				if (useAnd) {
					andOne(andDefer);
				} else {
					andDefer.resolve(andOne);
				}
			});
		}

		when.all(allPromises, function( vals ) {
			process.nextTick(function() {
				pass.resolve(vals[1]);
			});
		});

		return lastPromise = pass.promise;
	}
};

