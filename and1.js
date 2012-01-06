var when = require("when");

var lastPromise;

module.exports = {
	queue: function( andOne, runNow ) {
		var useAnd = typeof andOne === "function"
			, andDefer = when.defer()
			, kick = when.defer()
			, pass = when.defer()
			, allPromises = [ lastPromise, kick ]
		;
		
		andDefer.then(function( val ) {
			setTimeout(function() {
				kick.resolve(val);
			}, 0);
		});
		
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
		
		function resolvePass( vals ) {
			 pass.resolve(vals[1]);
		}

		lastPromise = when.all(allPromises, resolvePass);
		
		return pass;
	}
};
