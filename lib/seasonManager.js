if(Meteor.isClient) {

	Template.seasonEditMain.created = function() {
		Meteor.subscribe("seasons");
		Meteor.subscribe("games");
	};

	var currentSeasonId = "0";
	var gamesCount = 0;
	Template.seasonEditForm.rendered = function() {
		currentSeasonId = this.data.seasonId;
		Session.set("currentEditGame", "");
		Session.set("lastInsertId", "0");

		$(document).ready(function(){
		   $('[data-toggle="popover-seasoncode"]').popover();
		});
	};

	Template.seasonEditForm.helpers({
		games: function() {
			var seasonGames = Game.find({id_season:this.seasonId, status:{$ne:-1}}, 
				{transform: function(game){
      				if(game.status==1) {
      					game.statusText = "Open Picks";
      					game.statusOpen = true;
      				}
      				else if(game.status==0) {
      					game.statusText = "Close Picks";
      					game.statusClose = true;
      				}
      				else if(game.status==2) {
      					game.statusText = "Hidden";
      					game.statusHidden = true;
      				}
      				game.dateDisplay = DateFunc.formatDateToDisplay(game.date);
    				return game;
    			}
    		});
			/*seasonGames.forEach(function (game) {
  				alert("game.status: " + game.status);
  				game['statusText'] = "test";
			});
			seasonGames.rewind();*/

			return seasonGames;
		},

		numGames: function() {
			return Game.find({id_season:this.seasonId, status:{$ne:-1}}).count();
		},

		editGameControlDisabled: function() {
			return (Session.get("currentEditGame")==""?"":"disabled");
		}
	});

	Template.seasonEditForm.events({
		'click #addGameBtn' : function() {
			var idx = 1;
			while(Game.findOne({id_season:this.seasonId,name:"Untitled #"+idx})) {
				idx++;
			}
			Meteor.call("addGame",{'id_season':this.seasonId,'name':'Untitled #'+idx}, function(err, lastInsertId) {
				if(err) { alert(err); } 
				else { 
					$('button[name=editGameBtn]').each(function (index) {
				        if(lastInsertId==$(this).val()) {
				        	$(this).trigger("click");
				        }
					});
					return false;
				}
			});
		},

		'click #deleteSeasonLink' : function() {
			if(confirm("Are you sure you want to delete this season?")) {
				Meteor.call('deleteSeason', this.seasonId, function() {
					alert('The season has been deleted.');
					Router.go('/dashboard');
				});
			}
		}
	});

	Template.seasonSettingsForm.helpers({
		loadSeasonSettings: function() {
			return Season.findOne({_id:this.seasonId});
		},
		seasonInfo: function() {
			return {'name':this.seasonName, seasonCode:this.seasonCode, enabled:(this.status==1?true:false), disabled:(this.status==0?true:false), hidden:(this.status==2?true:false), pay:(this.pay==1?true:false)};
		}
	});

	Template.seasonSettingsForm.events({

		'change #seasonName' : function(e) {
			var optValue = $('#seasonName').val();
			Meteor.call("modifySeasonSettings",{"_id":currentSeasonId,"field":"seasonName","optValue":optValue});
		},

		'change #seasonCode' : function(e) {
			var optValue = $('#seasonCode').val();
			Meteor.call("modifySeasonSettings",{"_id":currentSeasonId,"field":"seasonCode","optValue":optValue});
		},

		'change .btn-grp-status' : function(e) {
			/*var clickedButton = e.currentTarget;
			alert( clickedButton + " : " + $(clickedButton).prop('id') );*/
			var optValue = document.querySelector('[name="seasonStatusOpts"]:checked').value;
			Meteor.call("modifySeasonSettings",{"_id":currentSeasonId,"field":"status","optValue":optValue});
		},

		'change .btn-grp-pay' : function(e) {
			/*var clickedButton = e.currentTarget;
			alert( clickedButton + " : " + $(clickedButton).prop('id') );*/
			var optValue = document.querySelector('[name="seasonPayOpts"]:checked').value;
			Meteor.call("modifySeasonSettings",{"_id":currentSeasonId,"field":"pay","optValue":optValue});
		},		

		'submit #formSeasonEdit': function(evt,frm) { 
			evt.preventDefault();
		}
	});

	this.GameMgr = this.GameMgr||{};
	(function() {
		GameMgr.closeGameEdit = function(idGame) {
			$('#rowStatic_'+idGame).css("display","block");
			$('#rowEdit_'+idGame).css("display","none");
			Session.set("currentEditGame", "");
		};

		GameMgr.statusText = function(status) {
			return GameStatus.getText(status);
		};
	})();

	Template.game.rendered = function() {
		// For some reason this only works here, but won't work in Template.seasonSettingsForm.rendered
 		$(document).ready(function(){
		   $('[data-toggle="popover-seasoncode"]').popover();
		});
	};

	Template.game.helpers({
		/*
		loadEditMode: function() {
			if(this._id==lastInsert._id) {
				return "block";
			}
			return "none";
		},
		loadStaticMode: function() {
			return (this._id!=Session.get("lastInsertId")?"block":"none");
		},*/
		editGameControlDisabled: function() {
			return (Session.get("currentEditGame")==""?"":"disabled");
		}

	});
	
	Template.game.events({
		// Show Edit Mode 
		'click #editGameBtn' : function(evt) {
			var idGame = evt.currentTarget.value;
			$('#rowStatic_'+idGame).css("display","none");
			$('#rowEdit_'+idGame).css("display","block");
			$('#gameDate_'+idGame).datepicker();

			Session.set("currentEditGame", idGame);

			evt.preventDefault();
		},

		'click #deleteGameBtn' : function(evt) {
			if(confirm("Are you sure you want to delete this game?")) {
				var idGame = evt.currentTarget.value;
				Meteor.call("deleteGame",idGame);
			}
		},

		'click #cancelGameBtn' :  function(evt) {
			var idGame = evt.currentTarget.value;
			GameMgr.closeGameEdit(idGame);

			evt.preventDefault();
		},

		'change .btn-grp-quick-status' : function(e) {
			var clickedButton = e.currentTarget;
			var gameStatus = clickedButton.value;
			var idGame = this._id;
			Meteor.call("editGame", idGame, {"status":gameStatus});
		},

		/*
		'click #saveGameBtn' : function(evt) {
			var idGame = evt.currentTarget.value;
			var gameName = $("gameLabel").val();
			var gameGroup = $("gameGroup").val();
			var gameDate = $("gameDate_"+idGame).val();
			var team1 = $("team1").val();
			var team2 = $("team2").val();
		},*/

		'submit #form-game': function(evt,frm) {
			evt.preventDefault();

			//Let's the validate function handle the submission
			//var email = frm.find("#accountEmail").value;
			//var password = frm.find("#accountPassword").value;
			var idGame = this._id;
			var gameName = frm.find("#gameLabel_"+idGame).value;
			var gameGroup = frm.find("#gameGroup_"+idGame).value;
			var gameDate = frm.find("#gameDate_"+idGame).value;	
			var team1 = frm.find("#team1_"+idGame).value;
			var team2 = frm.find("#team2_"+idGame).value;
			var gameStatus = document.querySelector('[name="gameStatusOpts_'+idGame+'"]:checked').value;

			var gameDateDb = DateFunc.formatDateToDb(gameDate);
	
			// Need to do some form validation

			Meteor.call("editGame", idGame, {"name":gameName, "group":gameGroup, "date":gameDateDb, "team1":team1, "team2":team2, "status":gameStatus}, function(err) { if(err) { alert(err); } else { GameMgr.closeGameEdit(idGame); } });
		}

	});

	//Handlebars.registerHelper("isEqual", function(lvalue,rvalue) { alert(lvalue+":"+rvalue); if(lvalue==rvalue) {return true;} else { return false; } });
	//Handlebars.registerHelper("nequal", function(lvalue,rvalue) { if(lvalue==rvalue) {return false;} else { return true; } });
}


Meteor.methods({
	addGame: function(gameSettings) {
		// Make sure the user is logged in before inserting a game
	    if (! Meteor.userId()) {
	      throw new Meteor.Error("not-authorized");
	    }

		gameSettings['owners'] = new Array(Meteor.userId());
		gameSettings['creation_date'] = new Date();
		gameSettings['status'] = 2; // 1-Open Picks, 0-Close Picks, 2-hidden, -1-deleted
		return Game.insert(gameSettings);
		// Add this game to Season in its list of games?
	},

	editGame: function(idGame, gameSettings) {
		if (! Meteor.userId()) {
	      throw new Meteor.Error("not-authorized");
	    }
	    Game.update({_id:idGame},{$set:gameSettings});
	    return idGame;
	},

	deleteGame: function(idGame) {
		if (! Meteor.userId()) {
	      throw new Meteor.Error("not-authorized");
	    }

	    return Game.remove({_id:idGame});
	},

	addSeason: function(settings) {
		// Make sure the user is logged in before inserting a season
	    if (! Meteor.userId()) {
	      throw new Meteor.Error("not-authorized");
	    }

	    return Season.insert({
			seasonName: settings.name,
			code: settings.code,
			status: 0, // 1-Enabled, 0-Disabled, 2-hidden, -1-deleted
			pay: 1, // 1-Enabled, 0-Disabled
			games: new Array(),
			createdAt: new Date(),
			_id_users: new Array(Meteor.userId()), 
			owners: new Array(Meteor.userId()),
	    });
	},

	modifySeasonSettings: function(settings) {
		var setDocument = {};
		setDocument[settings.field] = settings.optValue;
		Season.update({_id:settings._id},{$set:setDocument});
		return;

		if(settings.field=="status") {
			Season.update({_id:settings._id},{$set:{"status":settings.optValue}});
		}
		if(settings.field=="pay") {
			Season.update({_id:settings._id},{$set:{"pay":settings.optValue}});
		}
		if(settings.field=="seasonName") {
			Season.update({_id:settings._id},{$set:{"seasonName":settings.optValue}});
		}
	},

	deleteSeason: function(idSeason) {
		return Season.update({_id:idSeason},{$set:{"status":-1}});
	}

}); 

// At the bottom of simple-todos.js
if (Meteor.isServer) {
	
}