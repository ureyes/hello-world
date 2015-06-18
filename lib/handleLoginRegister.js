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
		loginValidator.addRules("accountEmail", {"required":true,"minlength":2,"email":true,"nospace":true});
		loginValidator.addRules("accountPassword", {"required":true,"minlength":6,"nospace":true});
	};
	Template.registerUser.rendered = function(){
		registerValidator = new formvalidate.Manager();
		registerValidator.addRules("registerEmail", {"required":true,"minlength":2,"email":true,"nospace":true});
		registerValidator.addRules("registerUsername", {"required":true,"minlength":3,"nospace":false});
		registerValidator.addRules("registerPassword", {"required":true,"minlength":6,"alphanumeric":true,"nospace":true});
		registerValidator.addRules("registerPasswordRepeat", {"required":true,"matchfield":"registerPassword","nospace":true}, {"alertMsg":{"matchfield":"The passwords you entered do not match."}});
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

			// FORM VALIDATOR
			if(!loginValidator.doValidate()) {
				return false;
			}

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
			// FORM VALIDATOR
			if(!registerValidator.doValidate()) {
				return false;
			}
return;
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