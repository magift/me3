setTimeout(function(){
	...
	setTimeout(arguments.callee, 10)
}, 10)

setInterval(function(){
	...
}, 10ww