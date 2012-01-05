var when = require("when");

var lastPromise;

module.exports = {
	queue: function( andOne, runNow ) {
		var useAnd = typeof andOne === "function"
			, andDefer = when.defer()
			, allPromises = [ lastPromise, andDefer ]
		;
		
		if (useAnd && runNow) {
			andOne(andDefer);
		} else {
			when(lastPromise).then(function() {
				if (useAnd) {
					andOne(andDefer);
				} else {
					andDefer.resolve(andOne);
				}
			});
		}
		
		lastPromise = when.all(allPromises);
		
		return andDefer;
	}
};
