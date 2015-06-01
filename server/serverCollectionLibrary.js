/*
Server Collections Library
*/

if(Meteor.isServer) {
	/* generic publish */
	Meteor.publish("seasons", function () {
		return Season.find({owners: this.userId});
	});
	Meteor.publish("games", function () {
		//Meteor._debug(currentSeasonId +" : " + this.seasonId);
		return Game.find({owners: this.userId});
	});
}