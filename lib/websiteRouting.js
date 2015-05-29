
Router.route('/', function() {
	this.layout('homeLayout');
	this.render('loginUser');
},{name:'loginuser'});
Router.route('/register', function() {
	this.layout('homeLayout');
	this.render('registerUser');
},{name:'registeruser'});
Router.route('/hello', function() {
	this.layout('homeLayout');
  	this.render('hello');
});
Router.route('/dashboard', function() {
	this.render('dashboardMain');
});

var requireLogin = function() { 
	if (!Meteor.user()) {
		if (Meteor.loggingIn()) {
			this.render(this.loadingTemplate);
		} else {
			this.layout('homeLayout');
			this.render('loginUser');
		}
	} else {
		this.next();
	}
}
// Before any routing run the requireLogin function. 
// Except in the case of "homeLayout". 
// Note that you can add more pages in the exceptions if you want. (e.g. About, Faq, contact...) 
Router.onBeforeAction(requireLogin, {except: ['registeruser']});
