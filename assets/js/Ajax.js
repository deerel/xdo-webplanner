function Ajax()
{
	var self = this;

	this.response;
	this.xhttp;
	this.event;
	this.request;
	this.dataString;

	this.updateActivityInvitedUsers = function(activity_id, users)
	{
		self.dataString  = 'activity_id=' + activity_id;
		self.dataString += '&friends_id=' + users;
		self.request = 'updateActivityInvitedUsers';
		send();
	};


	this.fetchFriendsByName = function(name)
	{
		self.dataString = 'searchstring=' + name;
		self.request = 'fetchFriendsByName';
		send();
	};

	this.fetchInvitedUsersByActivityId = function(id)
	{
		self.dataString = 'activity_id=' + id;
		self.request = 'fetchInvitedUsersByActivityId';
		send();
	};

	this.declineActivityInvite = function(activity_id, eventName)
	{
        var eventName = (typeof eventName !== 'undefined') ?  eventName : 'AjaxComplete';
		self.dataString = 'activity_id=' + activity_id;
		self.request = 'declineActivityInvite';
		send(eventName);
	};

	this.acceptActivityInvite = function(activity_id)
	{
		self.dataString = 'activity_id=' + activity_id;
		self.request = 'acceptActivityInvite';
		send();
	};

	this.declineFriendRequest = function(user_id, friend_id)
	{
		self.dataString += 'friend_id=' + friend_id;
		self.request = 'declineFriendRequest';
		send();
	};

	this.acceptFriendRequest = function(user_id, friend_id)
	{
		self.dataString += 'friend_id=' + friend_id;
		self.request = 'acceptFriendRequest';
		send();
	};

	this.sendFriendRequest = function(user_id, friend_id)
	{
		self.dataString += 'friend_id=' + friend_id;
		self.request = 'sendFriendRequest';
		send();
	};

	this.deleteActivity = function(activity_id, eventName)
	{
        var eventName = (typeof eventName !== 'undefined') ?  eventName : 'AjaxComplete';
		self.dataString = 'activity_id=' + activity_id;
		self.request = 'deleteActivity';
		send(eventName);
	};

	this.updateActivity = function(obj, eventName)
	{
        var eventName = (typeof eventName !== 'undefined') ?  eventName : 'AjaxComplete';
		self.dataString  = "activity_id=" + obj.id;
		self.dataString += "&activity_title=" + obj.title;
		self.dataString += "&activity_description=" + obj.description;
		self.dataString += "&activity_start=" + obj.activity_start;
		self.dataString += "&activity_end=" + obj.activity_end;
        self.dataString += "&invited_str=" + obj.invited_str;
		self.dataString += "&isOwner=" + obj.isOwner;
		self.request = 'updateActivity';
		send(eventName);	
	};

	this.createActivity = function(obj, eventName)
	{
        var eventName = (typeof eventName !== 'undefined') ?  eventName : 'AjaxComplete';
		self.dataString  = "&title=" + obj.title;
		self.dataString += "&description=" + obj.description;
		self.dataString += "&activity_start=" + obj.activity_start;
		self.dataString += "&activity_end=" + obj.activity_end;
		self.dataString += "&date=" + obj.date;
        self.dataString += "&invited_str=" + obj.invited_str;
		self.request = 'createActivity';
		send(eventName);	
	};	

	this.fetchActivitiesByDate = function(start, end, eventName)
	{
        var eventName = (typeof eventName !== 'undefined') ?  eventName : 'AjaxComplete';
		self.dataString  = 'activity_start=' + start;
		self.dataString += '&activity_end=' + end;
		self.request = 'fetchActivitiesByDate';
		send(eventName);
	};
    
    this.fetchCountNotifications = function(eventName)
	{
        var eventName = (typeof eventName !== 'undefined') ?  eventName : 'AjaxComplete';
		self.request = 'fetchCountNotifications';
		send(eventName);
	};
    
    this.fetchNotifications = function(eventName)
	{
        var eventName = (typeof eventName !== 'undefined') ?  eventName : 'AjaxComplete';
		self.request = 'fetchNotifications';
		send(eventName);

	};
    
    this.answerNotification = function(obj, action, eventName)
	{
        var eventName = (typeof eventName !== 'undefined') ?  eventName : 'AjaxComplete';
        self.dataString += '&notification_id=' + obj.getNotificationId();
        self.dataString += '&action=' + action;
		self.request = 'answerNotifications';
		send(eventName);
	};
    
    this.setNotificationsToRead = function(eventName)
	{
        var eventName = (typeof eventName !== 'undefined') ?  eventName : 'AjaxComplete';
		self.request = 'setNotificationsToRead';
		send(eventName);

	};

	this.fetch = function()
	{
		var response = self.response;
		self.response = [];
        if(response.length > 0) {
            return JSON.parse(response);
        } else {
            return "";
        }
	};


	var send = function(eventName)
	{
        var eventName = (typeof eventName !== 'undefined') ?  eventName : 'AjaxComplete';
		self.event = new Event(eventName);
		self.xhttp = new XMLHttpRequest();
	
		self.xhttp.onreadystatechange = function() 
		{
			if (this.readyState == 4 && this.status == 200)
			{
				self.response = this.responseText;
				window.dispatchEvent(self.event);
			}
		};

		self.xhttp.open('POST', APP.DOMAIN + "/ajax-endpoint?request=" + self.request, true);
		self.xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
		self.xhttp.send(self.dataString);
	}
};