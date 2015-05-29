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
	formvalidate.Manager.prototype.addRules = function(fieldId,fieldRules) {
		this.__fieldList.push(new formvalidate.__fieldObject(fieldId,fieldRules));
	};
	formvalidate.Manager.prototype.doValidate = function(){

	};

	formvalidate.__fieldObject = function(fieldId,fieldRules) {
		this.__id = fieldId;
		this.__rules = fieldRules;
		this.__elementType = $('#'+fieldId).prop('tagName');
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
	

if(Meteor.isClient) {
	
	Template.homeLayout.helpers({
		/*autoredirect: function() {
			Router.go('/dashboard');
		}*/
	});

	// Form validation rules
	var registerValidator = new Object();
	var loginValidator = new Object();
	Template.loginUser.rendered = function(){
		loginValidator = new formvalidate.Manager();
		loginValidator.addRules("accountEmail", {"required":true,"minlength":2,"email":true});
		loginValidator.addRules("accountPassword", {"required":true,"minlength":5});
	};
	Template.registerUser.rendered = function(){
		registerValidator = new formvalidate.Manager();
		registerValidator.addRules("registerEmail", {"required":true,"minlength":2,"email":true});
		registerValidator.addRules("registerUsername", {"required":true,"minlength":5});
		registerValidator.addRules("registerPassword", {"required":true,"minlength":5});
	};

	Template.loginUser.events({
		// If we want to start with disabled buttons 
		//'keyup #account-email': function() { formEnable.loginForm(); },
		//'keyup #account-password': function() { formEnable.loginForm(); },
		'click #newRegisterBtn':function() {  Router.go("/register"); },

		// Handle login submit
		'submit #form-login': function(evt,frm) {
			evt.preventDefault();

			//Let's the validate function handle the submission
			var email = frm.find("#accountEmail").value;
			var password = frm.find("#accountPassword").value;
			//*** Use Meteor.loginWithPassword() to log user in with userId.
			Meteor.loginWithPassword(email, password, function(err){
		        if (err) {
		        	alert(err);
		        }
		        else {
		        	Router.go('/dashboard');
		        }
		    });
		}
	});
	
	Template.registerUser.events({
		'click #loginReturnBtn':function() { Router.go("/");},

		// Handle Register 
		'submit #form-register': function(evt, frm) {
			evt.preventDefault();
			var username = frm.find("#registerUsername").value;
			var email = frm.find("#registerEmail").value;
			var password = frm.find("#registerPassword").value;
			var repeatPassword = frm.find("#registerPasswordRepeat").value;
			// HERE WE NEED TO DO SOME FORM VALIDATIONS BEFORE CREATING USER
			
			Meteor.call("addAccount", email, password, username, function(err, userId) { 
					//alert(err + " : "+ userId + " : " + Meteor.userId());
					if(err) {
						alert(err);
					} else {			
						//*** Use Meteor.loginWithPassword() to log user in with userId.
						Meteor.loginWithPassword(email, password, function(err){
					        if (err) {
					        	alert(err);
					        }
					        else {
					        	Router.go('/dashboard');
					        }
					    });
					}
				}
			);
		}
	});

}

Meteor.methods({
	addAccount: function(accountEmail, accountPassword, accountUsername) {
		return Accounts.createUser({email: accountEmail, password : accountPassword, profile: {name: accountUsername}});
	},
	setProfileName:function(userId, profileName) {
		Meteor.users.update({_id:userId},{$set:{"profile.name":profileName}});
	}
});