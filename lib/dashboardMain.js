if(Meteor.isClient) {

	var dash = {};
	dash.currentPanelId = "";

	Template.dashboardMain.created = function() {
		Meteor.subscribe("seasonDashboard");

		// Reset Variables
		dash.currentPanelId = "";
	};

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
		}

	});

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

if (Meteor.isServer) {
	Meteor.publish("seasonDashboard", function () {
		return Season.find({$or:[{owners:this.userId},{_id_users:this.userId}], status:{$ne:-1}});
	});
	Meteor.publish("gameCountDashboard", function (idSeason) {
		//Meteor._debug(currentSeasonId +" : " + this.seasonId);
		return Game.find({id_season:idSeason});
	});
}