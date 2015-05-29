/*
Server Collections Library
*/

if(Meteor.isServer) {
	/* serves dashboard.js */
	Meteor.publish("seasonDashboard", function () {
		return Season.find({$or:[{owners:this.userId},{_id_users:this.userId}], status:{$ne:-1}});
	});
	Meteor.publish("gameCountDashboard", function (idSeason) {
		//Meteor._debug(currentSeasonId +" : " + this.seasonId);
		return Game.find({id_season:idSeason});
	});

	/* generic publish */
	Meteor.publish("seasons", function () {
		return Season.find({owners: this.userId});
	});
	Meteor.publish("games", function () {
		//Meteor._debug(currentSeasonId +" : " + this.seasonId);
		return Game.find({owners: this.userId});
	});
}