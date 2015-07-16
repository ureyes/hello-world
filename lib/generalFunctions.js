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

function isEmpty(val) {
	if(typeof val == "undefined" || val=="") {
		return true;
	}
	return false;
}

var formEnable = {
	loginForm: function() {
		if($('#accountEmail').val()!="" && $('#accountPassword').val()!="") {
			$('#loginAccountBtn').removeClass("disabled");
		}else if(!$('#loginAccountBtn').hasClass("disabled")) {
			$('#loginAccountBtn').addClass("disabled");
		}
	}
};

this.formvalidate = {};
(function(){
	formvalidate.Manager = function(formId) {
		this.__formId = formId;
		this.__fieldList = new Array();
	};

	formvalidate.Manager.prototype.addRules = function(fieldId,fieldRules,alertFlags) {
		this.__fieldList.push(new formvalidate.fieldObject(fieldId,fieldRules,alertFlags));
	};

	formvalidate.Manager.prototype.doValidate = function(){
		var lengthFieldList = this.__fieldList.length;
		for(var i=0; i<lengthFieldList; i++) {
			var result = this.__validateRules(this.__fieldList[i]);
			var errorSelector = ".form-group";
			if(this.__fieldList[i].__alertFlags && !isEmpty(this.__fieldList[i].__alertFlags.errorSelector)) {
				errorSelector = this.__fieldList[i].__alertFlags.errorSelector;
			}
			if(!result.status) {
				this.__fieldList[i].__fieldElement.parents(errorSelector).addClass("has-error");
				result.errorAction();
				return false;
			}
			this.__fieldList[i].__fieldElement.parents(errorSelector).removeClass("has-error");
		}
		return true;
	};

	formvalidate.Manager.prototype.__validateRules = function(field) {
		var textTypeList = ["TEXT","EMAIL","PASSWORD"];

/*
		var alertMsg = ((field.__alertFlags && field.__alertFlags.alertMsg && field.__alertFlags.alertMsg.required)?field.__alertFlags.alertMsg.required:"");
		var alertMsg = ((field.__alertFlags && field.__alertFlags.alertMsg && field.__alertFlags.alertMsg.minlength)?field.__alertFlags.alertMsg.minlength:"");
		var alertMsg = ((field.__alertFlags && field.__alertFlags.alertMsg && field.__alertFlags.alertMsg.alphanumeric)?field.__alertFlags.alertMsg.alphanumeric:"");
		var alertMsg = ((field.__alertFlags && field.__alertFlags.alertMsg && field.__alertFlags.alertMsg.matchfield)?field.__alertFlags.alertMsg.matchfield:"");

		var alertMsg = field.;
		alertMsg = 
*/
		if (textTypeList.indexOf(this.__elementType)) {
			var val = field.__fieldElement.val();
			//alert(field.__id+":"+val + ":"+ field.__fieldElement);
			val = this.__cleanValue(val,{nospace:(field.__rules.nospace?true:false)});
			field.__fieldElement.val(val);

			// Empty value
			if (field.__rules.required && val=="") {
				return {status:false,errorAction:this.__errorActionFunc({type:"required", alertmsg:field.getErrorMsg("required")})};
			}
			// Email format
			if (field.__rules.email && val!="" && !val.match(/.+@.+\..+/)) {
				return {status:false,errorAction:this.__errorActionFunc({type:"email",alertmsg:field.getErrorMsg("email")})};
			}
			// Date format 
			if (field.__rules.date && val!="") {
				// TO DO: Confirm date exists
				if(!val.match(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/)) {
					return {status:false,errorAction:this.__errorActionFunc({type:"date",alertmsg:field.getErrorMsg("date")})};
				}
			}
			// Minimum characters
			if (field.__rules.minlength && val!="" && field.__rules.minlength>val.length) {
				return {status:false,errorAction:this.__errorActionFunc({type:"minlength", minlength:field.__rules.minlength, alertmsg:field.getErrorMsg("minlength")})};
			}
			// Alpha numeric only. No special chars.
			if (field.__rules.alphanumeric && val!="" && !val.match(/[0-9a-zA-Z]+/)) {
				return {status:false,errorAction:this.__errorActionFunc({type:"alphanumeric", alertmsg:field.getErrorMsg("alphanumeric")})};
			}
			// Must match field (ie. password confirmation)
			if (field.__rules.matchfield && val!="") {
				var valOrig = $('#'+field.__rules.matchfield).val();
				if(valOrig!=val) {
					return {status:false,errorAction:this.__errorActionFunc({type:"matchfield", alertmsg:field.getErrorMsg("matchfield")})};
				}
			}
			return {status:true};
		}
	};



	formvalidate.Manager.prototype.__cleanValue = function(val,opt) {
		val = val.replace(/^\s*/,"");
		val = val.replace(/\s*$/,"");
		if (opt && opt.nospace) {
			val = val.replace(/\s*/g,"");
		}
		return val;
	};

	formvalidate.Manager.prototype.__errorActionFunc = function(errorObject) {
		if (errorObject.alertmsg && errorObject.alertmsg!="") {
			return function() { alert(errorObject.alertmsg); }
		}
		if (errorObject.type=="required") {
			return function() { alert("Please enter the required information."); };
		}
		if (errorObject.type=="email") {
			return function() { alert("Please enter a valid email format."); };
		}
		if (errorObject.type=="minlength") {
			return function() { alert("Please enter a minimum of " + errorObject.minlength + " characters."); };
		}
		if (errorObject.type=="alphanumeric") {
			return function() { alert("Please enter only alpha numeric characters."); };
		}
		if (errorObject.type=="matchfield") {
			return function() { alert("Please make sure the fields match."); };
		}
	};

	formvalidate.fieldObject = function(fieldId,fieldRules,alertFlags) {
		this.__id = fieldId;
		this.__rules = fieldRules;
		this.__alertFlags = alertFlags;
		this.__fieldElement = $('#'+this.__id);
		this.__elementType = $('#'+this.__id).prop('tagName');
		if(this.__elementType=="INPUT") {
			this.__elementType = this.__fieldElement.attr("type");
		}
	};

	/* Get error message based on the rule
	@params rule [string]
	@return string
	*/
	formvalidate.fieldObject.prototype.getErrorMsg = function(rule) {
		if(this.__alertFlags && this.__alertFlags.alertMsg && this.__alertFlags.alertMsg[rule]) {
			return this.__alertFlags.alertMsg[rule];
		}
		return "";
	};

})();


//formValidate.addRules("accountEmail", {"required":true,"minlength":2});
/*
$(document).ready(function () {
$('#form-login').validate({
    rules: {
        "account-email": {
            required: true,
            email: true
        },
        "account-password": {
            minlength: 2,
            required: true
        }
    },
    highlight: function (element) {
        $(element).closest('.control-group').removeClass('success').addClass('error');
    },
    success: function (element) {
        element.text('OK!').addClass('valid')
            .closest('.control-group').removeClass('error').addClass('success');
    },
    ,
        errorElement: 'span',
        errorClass: 'help-block',
        errorPlacement: function(error, element) {
            if(element.parent('.input-group').length) {
                error.insertAfter(element.parent());
            } else {
                error.insertAfter(element);
            }
        }
});

});

$("#form-login").validate({
	rules: {
		accountEmail: {
			required: true,
			minlength: 2,
			format: 'email'
		},
		accountPassword: {
			required: true,
			minlength: 2
		}
	},
	messages: {
		accountEmail: {required: "Required Field"},
	},
	sendForm: false,
	onkeyup: false,
	submitHandler: function() { alert("is good!"); },
	
	valid: function(frm) {
		// Here is the code you want to run when the form is valid
		alert("valid !: " + frm);
	},
	invalid: function(frm) {
		// Here is the code you want to run when the form is valid
		alert("invalid !" + frm);
	},
	highlight: function (element) {
		alert('highlight');
        $(element).closest('.control-group').removeClass('success').addClass('error');
    },
    success: function (element) {
    	alert('success');
        element.text('OK!').addClass('valid')
            .closest('.control-group').removeClass('error').addClass('success');
    }

}); 

*/
