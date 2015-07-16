if(Meteor.isClient) {

	var currentSeasonId = "0";
	var gamesCount = 0;
	var seasonSettingsValidator = new Object();
	var seasonSettingsValidatorInited = false;
	function initSeasonSettingsValidator() {
		if(seasonSettingsValidatorInited) {
			return;
		}
		seasonSettingsValidator = new formvalidate.Manager();
		seasonSettingsValidator.addRules("seasonName", {"required":true,"minlength":3,"nospace":false}, {"errorSelector":"#seasonNameDiv"});
		seasonSettingsValidator.addRules("seasonCode", {"required":true,"minlength":6,"nospace":true}, {"errorSelector":"#seasonCodeDiv"});
		seasonSettingsValidatorInited = true;
	}

	Template.seasonEditMain.created = function() {
		Meteor.subscribe("seasons");
		Meteor.subscribe("games");
		seasonSettingsValidatorInited=false;
	};

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
				{sort: {date: 1}, transform: function(game){
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

      				if(game.winner=="team1") {
      					game.team1Winner = true;
      				}
      				else if(game.winner=="team2") {
      					game.team2Winner = true;
      				}
      				else {
      					game.noWinner = true;
      				}

      				if(game.use_points==1) {
      					game.pointsOn = true;
      				} 
      				else {
      					game.pointsOff = true;
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
			return {'name':this.seasonName, code:this.code, enabled:(this.status==1?true:false), disabled:(this.status==0?true:false), hidden:(this.status==2?true:false), pay:(this.pay==1?true:false)};
		}
	});

	Template.seasonSettingsForm.events({

		'change #seasonName' : function(e) {
			var optValue = $('#seasonName').val();

			initSeasonSettingsValidator();
			if(!seasonSettingsValidator.doValidate()) {
				return false;
			}
			return false;
			Meteor.call("modifySeasonSettings",{"_id":currentSeasonId,"field":"seasonName","optValue":optValue});
		},

		'change #seasonCode' : function(e) {
			var optValue = $('#seasonCode').val();

			initSeasonSettingsValidator();
			if(!seasonSettingsValidator.doValidate()) {
				return false;
			}
			Meteor.call("modifySeasonSettings",{"_id":currentSeasonId,"field":"code","optValue":optValue});
		},

		'change .btn-grp-status' : function(e) {
			/*var clickedButton = e.currentTarget;
			alert( clickedButton + " : " + $(clickedButton).prop('id') );*/
			var optValue = parseInt(document.querySelector('[name="seasonStatusOpts"]:checked').value,10);
			Meteor.call("modifySeasonSettings",{"_id":currentSeasonId,"field":"status","optValue":optValue});
		},

		'change .btn-grp-pay' : function(e) {
			/*var clickedButton = e.currentTarget;
			alert( clickedButton + " : " + $(clickedButton).prop('id') );*/
			var optValue = parseInt(document.querySelector('[name="seasonPayOpts"]:checked').value,10);
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
			var gameStatus = parseInt(clickedButton.value, 10);
			var idGame = this._id;
			Meteor.call("editGame", idGame, {"status":gameStatus});
		},

		'change .btn-grp-quick-win' : function(e) {
			var clickedButton = e.currentTarget;
			var win = clickedButton.value;
			var idGame = this._id;
			Meteor.call("editGame", idGame, {"winner":win});
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
			var idGame = this._id;

			var gameEditValidator = new formvalidate.Manager();
			gameEditValidator.addRules("gameLabel_"+idGame, {"required":true,"minlength":3,"nospace":false}, {"errorSelector":"#gameLabelContainer_"+idGame,"alertMsg":{"required":"Label is required.","minlength":"Label must be at least 3 characters."}});
			gameEditValidator.addRules("gameGroup_"+idGame, {"required":true,"minlength":3,"nospace":false}, {"errorSelector":"#gameGroupContainer_"+idGame,"alertMsg":{"required":"Group is required.","minlength":"Group must be at least 3 characters."}});
			gameEditValidator.addRules("gameDate_"+idGame, {"required":true,"minlength":10,"date":true}, {"alertMsg":{"required":"Date is required.","minlength":"Please enter the date in format mm/dd/yyyy.","date":"Please enter the date in format mm/dd/yyyy."}});
			gameEditValidator.addRules("team1_"+idGame, {"required":true}, {"alertMsg":{"required":"Home team is required."}});
			gameEditValidator.addRules("team2_"+idGame, {"required":true}, {"alertMsg":{"required":"Away team is required."}});
			if(!gameEditValidator.doValidate()) {
				return false;
			}

			var gameName = frm.find("#gameLabel_"+idGame).value;
			var gameGroup = frm.find("#gameGroup_"+idGame).value;
			var gameDate = frm.find("#gameDate_"+idGame).value;	
			var team1 = frm.find("#team1_"+idGame).value;
			var team2 = frm.find("#team2_"+idGame).value;
			var gameStatus = parseInt(document.querySelector('[name="gameStatusOpts_'+idGame+'"]:checked').value,10);
			var pointsOption = parseInt(document.querySelector('[name="pointsOpts_'+idGame+'"]:checked').value,10);
			
			var gameDateDb = DateFunc.formatDateToDb(gameDate);
	
			// Need to do some form validation

			Meteor.call("editGame", idGame, {"name":gameName, "group":gameGroup, "date":gameDateDb, "team1":team1, "team2":team2, "status":gameStatus, "use_points": pointsOption}, function(err) { if(err) { alert(err); } else { GameMgr.closeGameEdit(idGame); } });
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
		gameSettings['use_points'] = 0; // 0-false, 1-true
		gameSettings['_id_users'] = new Array({id:Meteor.userId(),pick:""});
		return Game.insert(gameSettings);
		// Add this game to Season in its list of games?
	},

	editGame: function(idGame, gameSettings) {
		if (! Meteor.userId()) {
	      throw new Meteor.Error("not-authorized");
	    }
	    return Game.update({_id:idGame},{$set:gameSettings});
	    //return idGame;
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