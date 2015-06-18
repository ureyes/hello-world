if(Meteor.isClient) {

	var dash = {};
	dash.currentPanelId = "";
	var newSeasonValidator = new Object();
	var joinSeasonValidator = new Object();

	Template.dashboardMain.created = function() {
		Meteor.subscribe("seasonDashboard");

		// Reset Variables
		dash.currentPanelId = "";
	};

	Template.dashboardMain.rendered = function() {
		newSeasonValidator = new formvalidate.Manager();
		newSeasonValidator.addRules("seasonName", {"required":true,"minlength":3,"nospace":false});
		joinSeasonValidator = new formvalidate.Manager();
		joinSeasonValidator.addRules("seasonCode", {"required":true,"minlength":6,"nospace":true});
	};

	Template.dashboardMain.helpers({
		hasSeason: function() {
			var testSeason = Season.find({$or:[{owners:Meteor.userId()},{_id_users:Meteor.userId()}], status:{$ne:-1} }, {limit: 1});
			if(testSeason.count()>0) { return true; } ;
			return false;
		},

		seasons: function() {
			var seasonList = Season.find({$or:[{owners:Meteor.userId()},{_id_users:Meteor.userId()}], status:{$ne:-1} }, 
				{sort: {seasonName: 1}, transform: function(season){
					if(season.status==1) {
      					season.statusText = "Enabled";
      				}
      				else if(season.status==0) {
      					season.statusText = "Disabled";
      				}
      				else if(season.status==2) {
      					season.statusText = "Hidden";
      				}

      				season.numPlayers = 0
      				if(typeof season._id_users != "undefined") {
      					season.numPlayers = season._id_users.length;
      				}

      				season.isOwner = (season.owners.indexOf(Meteor.userId())>=0?true: false);

      				// Subscribe to games to retrieve number of games
          			Meteor.subscribe('gameCountDashboard', season._id);

      				return season; }
				}
			);

			return seasonList;
		}
	});

	Template.dashboardMain.events({
		'submit #formNewSeason': function(evt,frm) {
			evt.preventDefault();

			//Let's the validate function handle the submission
			var seasonName = frm.find("#seasonName").value;
			var seasonCode = RandString.generate(6);

			if(!newSeasonValidator.doValidate()) {
				return false;
			}

			// In seasonManager.js. randomString() in generalFunctions.js
			Meteor.call("addSeason", {name:seasonName, code:seasonCode}, function(err, seasonId) { 
				if(err) {
					alert(err);
				}
				else {
					Router.go('/seasonEdit/'+seasonId);
				}
			});
		},

		'click .panel': function(evt) {
			if(dash.currentPanelId!="") {
				$("#"+dash.currentPanelId).addClass("panel-default").removeClass("panel-primary");
				$("#"+dash.currentPanelId+"_span").css("color","");
			}
			if(!$("#"+evt.currentTarget.id).find(".panel-collapse").hasClass("in")) {
				$("#"+evt.currentTarget.id).addClass("panel-primary").removeClass("panel-default").removeClass("button-text-blue");
				$("#"+evt.currentTarget.id+"_span").css("color","#FFFFFF");
			}
			dash.currentPanelId = evt.currentTarget.id;
		},

		'submit #form-join-season': function(evt, frm) {
			var seasonCode = frm.find('#seasonCode').value;

			if(!joinSeasonValidator.doValidate()) {
				return false;
			}

			Meteor.call("joinSeasonRequest",seasonCode, 
				function(err, res) { 
					$('#alertSeason_notexist').removeClass('in').addClass('hide');
					$('#alertSeason_existinguser').removeClass('in').addClass('hide');
					if(res=="notexist" || res=="existinguser") {
						$('#alertSeason_'+res).removeClass('hide').addClass('in');
					}
					else {
						Router.go('/seasonGames/'+res);
					}
					return;
				}
			);
			evt.preventDefault();
		}

	});

	Template.dashboardHeader.rendered = function() {
		$(document).ready(function(){
		   $('[data-toggle="popover-dashboard"]').tooltip();
		});
	};

	Template.dashboardHeader.events({
		'click #accountMenuLogout': function() { 
			Meteor.logout( function(err) { 
				if(err) { 
					alert(err);
				} 
				else{ 
					Router.go('/');
				} 
			}); 
		},

		'click #accountMenuHome': function(evt) {
			evt.preventDefault();
			Router.go('/dashboard');
		}
	});

	Template.season.rendered = function() {
		$(document).ready(function(){
			$('[data-toggle="popover-view"]').tooltip();
			$('[data-toggle="popover-edit"]').tooltip();
		});
	};

	Template.season.helpers({
		gamesCount: function() {
			return Game.find({id_season:this._id}).count();
		}
	});

	Template.season.events({
		'click #viewSeason': function(evt) {
			Router.go('/seasonGames/'+this._id);
		},
		'click #editSeason': function(evt) {
			Router.go('/seasonEdit/'+this._id);
		}
	});
}

Meteor.methods({
	joinSeasonRequest: function(seasonCode) {
		var season = Season.find({code:seasonCode, status:1});
		var seasonId = "";
		var idUsers = new Array();
		if(season.count()>0) {
			season.forEach(function(thisSeason) { 
				seasonId = thisSeason._id; 
				idUsers = thisSeason._id_users;
			});
			if(seasonId!="") {
				var existingUser = false;
				if(idUsers.indexOf(Meteor.userId())>-1) {
					return "existinguser";
				} 
				else { 
					Season.update({_id:seasonId},{$addToSet:{_id_users:Meteor.userId()}});
					return seasonId;
				}
			}
		}
		return "notexist";
	}
});

if (Meteor.isServer) {
	Meteor.publish("seasonDashboard", function () {
		return Season.find({status:{$ne:-1}});
	});
	Meteor.publish("gameCountDashboard", function (idSeason) {
		//Meteor._debug(currentSeasonId +" : " + this.seasonId);
		return Game.find({id_season:idSeason});
	});
}