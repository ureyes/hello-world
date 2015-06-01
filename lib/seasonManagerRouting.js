// Edit Season settings and add/edit games
Router.route('/seasonEdit/:_id', function() {
  	this.layout('seasonEditMain', {data:{'seasonId':this.params._id}});
  	this.render('seasonEditForm', {data:{'seasonId':this.params._id}});
});

// Season Games List
Router.route('/seasonGames/:_id', function() {
	this.layout('seasonGamesMain', {data:{'seasonId':this.params._id}});
	this.render('seasonGamesList', {data:{'seasonId':this.params._id}});
})