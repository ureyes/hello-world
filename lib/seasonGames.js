if(Meteor.isClient) {

	Template.seasonGamesMain.created = function() {
		Meteor.subscribe("seasons");
		Meteor.subscribe("games");
		
		/*
		$(document).ready(function() {
			$('#btn-group-game-2BjFnCrutqJgaKq2Z').on('click', function() {alert('test'); });
		    //When checkboxes/radios checked/unchecked, toggle background color    
		    $('.form-group').on('click','input[type=radio]',function() { 
		    	alert('test');
		        $(this).closest('.form-group').find('.radio-inline, .radio').removeClass('checked');
		     	$(this).closest('.radio-inline, .radio').addClass('checked');     
		    });      
	        //Show additional info text box when relevant radio checked     
	        $('input[type=radio]').click(function() {         
	        	$(this).closest('.form-group').find('.additional-info-wrap .additional-info').addClass('hide').find('input,select').val('').attr('disabled','disabled');
	            if($(this).closest('.additional-info-wrap').length > 0) { 
	                $(this).closest('.additional-info-wrap').find('.additional-info').removeClass('hide').find('input,select').removeAttr('disabled');         }             }); }); 
	  	*/  
	};

	Template.seasonGamesList.helpers({
		gamesView: function() {
			return Game.find({id_season:this.seasonId, status:{$ne:-1}}, 
				{ 	transform:function(game) {
						game.dateDisplay = DateFunc.formatDateToDisplay(game.date);
						return game;
					}
				}
			);
		}
	});

	Template.gameView.events({
		'change .btn-group': function(e) {
			//var selectedGame = document.querySelector('[name="gameviewteam_'+this._id+'"]:checked').value;
			var teamBtns = document.querySelectorAll('[name="gameviewteam_'+this._id+'"]');
			for(var i=0; i<teamBtns.length; i++) {
				if(teamBtns[i].checked) {
					// save pick 
					Meteor.call("setPick",{_id:this._id,team:teamBtns[i].value});

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
	setPick: function(settings) {

	}
});