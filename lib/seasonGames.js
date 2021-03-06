/*

Notes: 
Read about ReactiveDict more. 
Investigate Iron Router's issue with calling action and subscribe twice.

*/


if(Meteor.isClient) {

	var SEASON_SETTINGS = {status:false};
	var GAME_SETTINGS = {displayCount: new ReactiveDict,totalCount: new ReactiveDict};
	var PLAYER_WIN_COUNT = {};

	function addWinCount(id_player, withReset) {
		if (!PLAYER_WIN_COUNT[id_player]) {
			PLAYER_WIN_COUNT[id_player] = new ReactiveDict;
		}
		if(withReset) {
			PLAYER_WIN_COUNT[id_player].set("count",0);
		}
		PLAYER_WIN_COUNT[id_player].set("count",PLAYER_WIN_COUNT[id_player].get("count")+1);
	}

	function resetWinCount() {
		return;
		for(id_player in PLAYER_WIN_COUNT) {
			PLAYER_WIN_COUNT[id_player].set("count",0);
		}
	}
	
	Template.seasonGamesMain.created = function() {
		// Init some stuff
	};
	
	Template.seasonGamesMain.helpers({
		seasonName: function() {
			var season = Season.findOne({_id:this.seasonId});			
			if(season) { 
				SEASON_SETTINGS.status = season.status;
				return season.seasonName; 
			}
		}
	});

	Template.seasonGamesList.created = function() {
		Session.set("groupFilter","");
		Session.set("reportGamesList","");
		// alert(Router.current().route.getName());
		// Init some stuff
		var allGames = Game.find({id_season:this.data.seasonId, status:{$in:[1,0]}}).count();
		GAME_SETTINGS.totalCount.set("count",allGames);
	};

	Template.seasonGamesList.helpers({
		gamesView: function() {
			var groupFilter = {$ne:""};
			groupFilter = (Session.get("groupFilter") && Session.get("groupFilter")!=""?Session.get("groupFilter"):groupFilter);
			var games = Game.find({id_season:this.seasonId, status:{$in:[1,0]}, group:groupFilter}, 
				{sort: {date: 1}, transform:function(game) {
						game.dateDisplay = DateFunc.formatDateToDisplay(game.date);
						$.each(game._id_users, function() {
  							if(this.id===Meteor.userId()) {
  								game.pickTeam1 = (this.pick=="team1"?true:false);
								game.pickTeam2 = (this.pick=="team2"?true:false);
								game.points = (game.use_points==1?this.points:"");
  							}
						});
						game.disablePick = (game.status==0 || SEASON_SETTINGS.status==0?true:false);
						game.pointsOn = (game.use_points==1?true:false);
						return game;
					}
				}
			);
			GAME_SETTINGS.displayCount.set("count",games.count());
			return games;
		},

		groupFilter: function() {
			//var test = Game.aggregate([{$match: {id_season:"Gbvgr4u4JWktpsfZ9"}}, {$group:{_id:"$group"}}]);
			var test = _.uniq(Game.find({id_season:this.seasonId}, { sort: {group: 1}, fields: {group: true}}).fetch().map(function(x) { return x.group; }), true);
			return test;
		},

		isFilterSelected: function() {
			if(this==Session.get("groupFilter")) { return "SELECTED"; }
		},

		numDisplayedGames: function() {
			return GAME_SETTINGS.displayCount.get("count");
			//return GAME_SETTINGS.displayCount;
		},

		numTotalGames: function() {
			return GAME_SETTINGS.totalCount.get("count");
			//return GAME_SETTINGS.totalCount;
		}
	});

	Template.seasonGamesList.events({
		'change #groupFilter': function(evt) {
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
		},

		'click #gameReport': function(evt) {
			evt.preventDefault();
			//window.open('/seasonGamesReport/'+this.seasonId, '_blank');
			var idGamesSelected = [];
			var cbListLength = $('input:checkbox[name="cbGame"]').length;
			for(var i=0; i<cbListLength; i++) {
				if($('input:checkbox[name="cbGame"]')[i].checked) {
					idGamesSelected.push($('input:checkbox[name="cbGame"]')[i].value);
				}
			}
			if(idGamesSelected.length>0) {
				Session.set("reportGamesList",idGamesSelected.join(","));
			} else {
				alert("Please select at least one game.");
				return;
			}
			Router.go('/seasonGamesReport/'+this.seasonId);
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
		},

		'change .totalpoints': function(e) {
			var pts = $('#totalPoints_'+this._id).val();
			if(pts=="") { pts = 0; }

			if(!pts.match(/^[0-9]+$/)) {
				alert('Please enter valid numbers only.');
				$('#totalPoints_'+this._id).val("");
			}
			pts = pts*1; // convert to number
			Meteor.call("setPoints", this._id, pts);
		}
	});

	Template.reportLoading.rendered = function() {
		//$('#myModal').modal();
	};

	var PLAYERS_LIST_ORDER = new Array();
	var PLAYERS_LIST = new Object();
	Template.seasonGamesReport.rendered = function() {
		
	};

	Template.seasonGamesReport.destroyed = function() {
		
	}

	Template.seasonGamesReport.helpers({
		playersList: function() {
			var players = Season.find({_id:this.seasonId},{_id_users:1, transform: function(season) {
				var playerIdLength = season._id_users.length;
				for(var i=0; i<playerIdLength; i++) {
					Meteor.subscribe("seasonPlayers",season._id_users[i]);	
				}
				return season;
			}}).fetch();
			PLAYERS_LIST_ORDER = players[0]._id_users;
			return players[0]._id_users;
		},

		gamesList: function() {
			// Reset win count
			resetWinCount();
			var calcPlayerPoints = {};

			var idGamesList = Session.get("reportGamesList").split(",");
			var idFind = {$in:idGamesList};
			return Game.find({id_season:this.seasonId,_id:idFind,status:{$in:[1,0]}},{sort: {date: 1}, transform:function(game) {
				//game.gameVs = game.team1 + " vs. " + game.team2;
				game.team1Winner = (game.winner=="team1"?true:false);
				game.team2Winner = (game.winner=="team2"?true:false);
				game.dateDisplay = DateFunc.formatDateToDisplay(game.date);

				// Record Pick
				game.playerStats = {};
				var lengthUsers = game._id_users.length;
				for(var i=0; i<lengthUsers; i++) {
					if(!PLAYERS_LIST[game._id_users[i].id]) {
						PLAYERS_LIST[game._id_users[i].id] = {};
					}
					var isWinner = false;
					if(game._id_users[i].pick==game.winner) {
						isWinner = true;
						if(game.status!=1) { 
							addWinCount(game._id_users[i].id, !calcPlayerPoints[game._id_users[i].id]);
							calcPlayerPoints[game._id_users[i].id]=true; 
						}
					}

					var pick = "";
					if (typeof game[game._id_users[i].pick] != "undefined" && game[game._id_users[i].pick]!="") { 
						pick=game[game._id_users[i].pick]; 
						if (game.status==1) { 
							pick="@hide@"; // hide pick if this game's pick status is still active 
						}
					}

					var usePoints = (game.use_points==1?true: false);
					var points = 0;
					if (usePoints && typeof game._id_users[i].points != "undefined") { 
						points=game._id_users[i].points; 
					}
					//PLAYERS_LIST[game._id_users[i].id][game._id] = [pick,isWinner];
					game.playerStats[game._id_users[i].id] = {'pick':pick, 'isWinner': isWinner, 'points': points, 'usePoints': usePoints};
				}

				return game;
			}});
		}
	});

	Template.playerHead.helpers({
		playerInfo: function() {
			var id = this.toString();
			var player = Meteor.users.find({_id:id},{_id:1, "profile.name":1}).fetch();
			if(player[0]) {
				var winCount = 0;
				if(PLAYER_WIN_COUNT[id]) { winCount = PLAYER_WIN_COUNT[id].get("count"); }
				return {name:player[0].profile.name, totalWin:winCount};
			}
		}
	});

	Template.gameRow.helpers({
		gameRowPlayers: function() {
			var gameRowData = new Array();
			for(var i=0; i<PLAYERS_LIST_ORDER.length; i++) {
				var rowInfo = {idPlayer:PLAYERS_LIST_ORDER[i],idGame:this._id};

				if(this.playerStats[PLAYERS_LIST_ORDER[i]]) { 
					var thisPick = this.playerStats[PLAYERS_LIST_ORDER[i]].pick;
					rowInfo.pick = thisPick;

					if(thisPick=="@hide@") { 
						rowInfo.hidePick = true;
					}
					else if(thisPick=="") {
						rowInfo.noPick = true;
					}
					else if(thisPick!="") {
						rowInfo.showPick = true;
						if(this.playerStats[PLAYERS_LIST_ORDER[i]].isWinner) {
							rowInfo.isWinner = true;
						}
					}
					
					if(this.playerStats[PLAYERS_LIST_ORDER[i]].usePoints) {
						rowInfo.usePoints = true;
						rowInfo.points = this.playerStats[PLAYERS_LIST_ORDER[i]].points;
					}
				}

				gameRowData.push(rowInfo);
			}
			return gameRowData;
		}
	});

	Template.gameRowPlayer.helpers({
		playerPick: function() {
			var hidePick = false;
			var pick = "";
			var isWinner = false;
			if(PLAYERS_LIST[this.idPlayer] && PLAYERS_LIST[this.idPlayer][this.idGame] &&  PLAYERS_LIST[this.idPlayer][this.idGame][0]) {
				//alert("drawPick:"+this.idGame+":"+PLAYERS_LIST[this.idPlayer][this.idGame][0]);
				if(PLAYERS_LIST[this.idPlayer][this.idGame][0]=="@hide@") {
					hidePick=true;
				}
				pick = PLAYERS_LIST[this.idPlayer][this.idGame][0];
				isWinner = PLAYERS_LIST[this.idPlayer][this.idGame][1];
			}
			//alert("pick:" + pick+":");
			return {'status':hidePick, 'pick':pick, 'isWinner': isWinner, 'nopick':(pick==""?true:false)};
		}
	});
}

Meteor.methods({
	setPick: function(idGame, settings) {
		var userPick = Game.find({_id: idGame, _id_users: {$elemMatch:{id:Meteor.userId()}}});
		if(userPick.count()>0) {
			Game.update({_id: idGame, _id_users: {$elemMatch:{id:Meteor.userId()}}}, {$set:{'_id_users.$.pick':settings.team}});
		}
		else {
			Game.update({_id:idGame},{$push:{_id_users:{id:Meteor.userId(),pick:settings.team}}});
		}
		//Game.update({_id:idGame},{$pull:{_id_users:{id:Meteor.userId()}}});
		//Game.update({_id:idGame},{$push:{_id_users:{id:Meteor.userId(),pick:settings.team}}});
	},

	setPoints: function(idGame, points) {
		var userPick = Game.find({_id: idGame, _id_users: {$elemMatch:{id:Meteor.userId()}}});
		if(userPick.count()>0) {
			Game.update({_id: idGame, _id_users: {$elemMatch:{id:Meteor.userId()}}}, {$set:{'_id_users.$.points':points}});
		}
		else {
			Game.update({_id:idGame},{$push:{_id_users:{'id':Meteor.userId(),'points':points}}});
		}
	}
});

if(Meteor.isServer) {
	Meteor.publish("seasonGamesSeason", function(idSeason) {
		return Season.find({_id: idSeason});
	});
	Meteor.publish("seasonPlayers", function(id) {
		return Meteor.users.find({_id:id});
	});
	Meteor.publish("seasonGamesGames", function(idSeason) {
		return Game.find({id_season:idSeason,status:{$in:[1,0]}});
	});
}