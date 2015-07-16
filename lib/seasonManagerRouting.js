// Edit Season settings and add/edit games
Router.route('/seasonEdit/:_id', function() {
  	this.layout('seasonEditMain', {data:{'seasonId':this.params._id}});
  	this.render('seasonEditForm', {data:{'seasonId':this.params._id}});
});

// Season Games List
Router.route('/seasonGames/:_id', function() {
	this.layout('seasonGamesMain', {data:{'seasonId':this.params._id}});
	this.render('seasonGamesList', {data:{'seasonId':this.params._id}});
});

// Season Games Pick List
Router.route('/seasonGamesReport/:_id', /*function() {
	this.wait(Meteor.subscribe("seasonGamesGames",this.params._id), Meteor.subscribe("seasonGamesGames",this.params._id));

	if(this.ready()) {
		this.layout('seasonGamesMain', {data:{'seasonId':this.params._id}});
		this.render('seasonGamesReport', {data:{'seasonId':this.params._id}});
	}
	else {
		this.render('loading');
	}
	*/

	// this template will be rendered until the subscriptions are ready
  	/*{ 
  	loadingTemplate: 'loading',
	waitOn: function () {
		// return one handle, a function, or an array
		return Meteor.subscribe("seasonGamesGames",this.params._id);
	},
	action: function () {
		if(this.ready()) {
		this.layout('seasonGamesMain', {data:{'seasonId':this.params._id}});
	    this.render('seasonGamesReport', {data:{'seasonId':this.params._id}});
	   	}
	}*/

	{
	subscriptions: function() {
		// returning a subscription handle or an array of subscription handles
		// adds them to the wait list.
		return [Meteor.subscribe("seasonGamesGames",this.params._id), Meteor.subscribe("seasonGamesSeason",this.params._id)];
	},

	action: function () {
		if (this.ready()) {
		 	this.layout('seasonGamesMain', {data:{'seasonId':this.params._id}});
		 	this.render('backLinkTemplate',{to:'backLink'});
	    	this.render('seasonGamesReport', {data:{'seasonId':this.params._id}});
		} else {
		  	this.render('reportLoading');
		}
	}
});