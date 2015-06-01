if(Meteor.isClient) {

	Template.seasonGamesMain.created = function() {
		Meteor.subscribe("seasonGamesSeason",this.data.seasonId);
		Meteor.subscribe("seasonGamesGames",this.data.seasonId);
	};

	Template.seasonGamesMain.helpers({
		seasonName: function() {
			var season = Season.findOne({_id:this.seasonId});
			if(season) { return season.seasonName; }
		}
	});

	Template.seasonGamesList.helpers({
		gamesView: function() {
			var groupFilter = {$ne:""};
			groupFilter = (Session.get("groupFilter") && Session.get("groupFilter")!=""?Session.get("groupFilter"):groupFilter);
			return Game.find({id_season:this.seasonId, status:{$in:["1","0"]}, group:groupFilter}, 
				{sort: {date: 1}, transform:function(game) {
						game.dateDisplay = DateFunc.formatDateToDisplay(game.date);
						$.each(game._id_users, function() {
							//alert(this.id + " : " + Meteor.userId() + " : "  + this.pick);
  							if(this.id===Meteor.userId()) {
  								game.pickTeam1 = (this.pick=="team1"?true:false);
								game.pickTeam2 = (this.pick=="team2"?true:false);
  							}
						});
						game.disablePick = (game.status==0?true:false);
						return game;
					}
				}
			);
		},

		groupFilter: function() {
			//var test = Game.aggregate([{$match: {id_season:"Gbvgr4u4JWktpsfZ9"}}, {$group:{_id:"$group"}}]);
			var test = _.uniq(Game.find({id_season:this.seasonId}, { sort: {group: 1}, fields: {group: true}}).fetch().map(function(x) { return x.group; }), true);
			//alert(typeof test);
			return test;
		},

		isFilterSelected: function() {
			if(this===Session.get("groupFilter")) { return "SELECTED"; }
		}
	});

	Template.seasonGamesList.events({
		'change #groupFilter': function(evt) {
			//alert($('#groupFilter').val());
			Session.set("groupFilter",$('#groupFilter').val());
			return true;
		},

		'click #cbAll': function(evt) {
			var checkAll = evt.currentTarget.checked;
			if(checkAll) { 
				$('input:checkbox[name="cbGame"]').prop("checked",true);
			}
			else {
				$('input:checkbox[name="cbGame"]').prop("checked",false);
			}
		}
	});

	Template.gameView.rendered = function() {
		$(document).ready(function(){
			$('[data-toggle="popover-locked"]').tooltip();
		});
	};

	Template.gameView.events({
		'change .btn-group': function(e) {
			//var selectedGame = document.querySelector('[name="gameviewteam_'+this._id+'"]:checked').value;
			var teamBtns = document.querySelectorAll('[name="gameviewteam_'+this._id+'"]');
			for(var i=0; i<teamBtns.length; i++) {
				if(teamBtns[i].checked) {
					// save pick 
					Meteor.call("setPick", this._id, {team:teamBtns[i].value});

					// Modify style
					$(teamBtns[i]).parent().removeClass("btn-default").addClass("btn-success");
				}
				else {
					$(teamBtns[i]).parent().removeClass("btn-success").addClass("btn-default");
				}
			}
		}
	});
}

Meteor.methods({
	setPick: function(idGame, settings) {
		//Game.update({_id:"iT7pqrWP5SFRSPcY3", "_id_users.id":"Me6jBuipCBiucCaLx"},{$set:{"_id_users.$.pick":"team1"}});
		Game.update({_id:idGame},{$pull:{_id_users:{id:Meteor.userId()}}});
		Game.update({_id:idGame},{$push:{_id_users:{id:Meteor.userId(),pick:settings.team}}});
	}
});

if(Meteor.isServer) {
	Meteor.publish("seasonGamesSeason", function(idSeason) {
		return Season.find({_id: idSeason});
	});
	Meteor.publish("seasonGamesGames", function(idSeason) {
		return Game.find({id_season:idSeason});
	});
}