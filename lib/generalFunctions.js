/* 
generalFunctions.js
*/

this.DateFunc = this.DateFunc||{};
(function(){

	// Format date for db save (mongo uses js date object)
	DateFunc.formatDateToDb = function(inDate) {
		if(typeof inDate == "string") {
			var delimiter = "-";
			if(inDate.match(/.*\/.*/)) {
				delimiter = "/";
			}
			var inDateSplit = inDate.split(delimiter);
			var mm = inDateSplit[0];
			var dd = inDateSplit[1];
			var yyyy = inDateSplit[2];
		}

		return new Date(yyyy, parseInt(mm)-1, dd);
	};

	// Format date to String
	DateFunc.formatDateToDisplay = function(inDateObj, outFormat) {
		if(!inDateObj) { return "-"}; 
		var yr = inDateObj.getFullYear();
    	var month = (inDateObj.getMonth()+1) < 10 ? '0' + (inDateObj.getMonth()+1) : (inDateObj.getMonth()+1);
    	var day = +inDateObj.getDate() < 10 ? '0' + inDateObj.getDate() : inDateObj.getDate();
    	return month+"/"+day+"/"+yr;
	};

})();

// Defintions of statuses 
this.SeasonStatus = this.SeasonStatus||{};
this.GameStatus = this.GameStatus||{};
(function() {
	SeasonStatus.getText = function(status) {

	};

	/*
	1 - Open Picks
	0 - Close Picks
	2 - Hidden
	-1 - Deleted (Soft)
	*/
	GameStatus.getText = function(status) {
		return (status==1?"Open Picks":(status==0?"Close Picks":(status==2?"Hidden":"Deleted")));
	};
})();

this.RandString = this.RandString||{};
(function() {
	var _defaultChars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	RandString.generate = function(length,chars) {
		var useChars = _defaultChars;
		if(typeof chars != "undefined" && chars!="") {
			useChars = chars;
		}
	    var result = '';
	    for (var i = length; i > 0; --i) result += useChars[Math.round(Math.random() * (useChars.length - 1))];
	    return result;
	}
})();

function randomString(length, chars) {
	var useChars = defaultChars;
	if(typeof chars != "undefined" && chars!="") {
		useChars = chars;
	}
    var result = '';
    for (var i = length; i > 0; --i) result += useChars[Math.round(Math.random() * (useChars.length - 1))];
    return result;
}
