// Edit Season settings and add/edit games
Router.route('/seasonEdit/:_id', function() {
  	this.layout('seasonEditMain');
  	this.render('seasonEditForm', {data:{'seasonId':this.params._id}});
});

// Season Games List
Router.route('/seasonGames/:_id', function() {
	this.layout('seasonGamesMain');
	this.render('seasonGamesList', {data:{'seasonId':this.params._id}});
})