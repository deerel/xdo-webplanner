var Planner = function(prevElem,currentElem, nextElem, addElem)
{
	"use strict";
	var that = this;
	var date;
	var week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
	this.week;
	this.month;
	this.ajax = new Ajax();
	var m_isWeek = true;
	var m_prevElem;
	var m_currentElem;
	var m_nextElem;
	var m_addElem;
    var m_isReady = false;

	var m_setupBtnElems = function ()
	{
		if(typeof prevElem !== "undefined")
		{
			m_prevElem = document.querySelector(prevElem);

			if(m_prevElem !== null)
			{
				if(m_isWeek)
				{
					m_prevElem.addEventListener('click', previousWeek);
				}
				else
				{
					m_prevElem.addEventListener('click', m_previousMonth);
				}
			}
		}
		if(typeof currentElem !== "undefined")
		{
			m_currentElem = document.querySelector(currentElem);

			if(m_currentElem !== null)
			{
				if(m_isWeek)
				{
					m_currentElem.addEventListener('click', currentWeek);
				}
				else
				{
					m_currentElem.addEventListener('click', m_currentMonth);
				}
			}
		}
		if(typeof nextElem !== "undefined")
		{
			m_nextElem = document.querySelector(nextElem);

			if(m_nextElem !== null)
			{
				if (m_isWeek) {
					m_nextElem.addEventListener('click', nextWeek);
				}
				else {
					m_nextElem.addEventListener('click', m_nextMonth);
				}
			}
		}
		if(typeof addElem !== "undefined")
		{
			m_addElem = document.querySelector(addElem);
		}

		if(m_prevElem !== null && m_currentElem !== null && m_nextElem !== null && m_addElem !== null)
        {
            m_isReady = true;
        }
	}
	var updateActivity = function()
	{
		var result = that.ajax.fetch();

    	var invitedArr = [];
		if(result.invited !== null)
		{
            for(var i = 0; i<result.invited.length; i++)
            {
                invitedArr[i] = result.invited[i].id;
            }
		}
		var aD = new ActivityData(result.id, result.title, result.description, result.timestart.substring(0,10), ('0'+(result.timestart)).slice(-5), ('0'+(result.timeend)).slice(-5), result.isOwner, invitedArr);

		if(m_isWeek)
		{
			that.week.updateActivity(aD);
		}
		else
		{
			that.month.updateActivity(aD);
		}

        window.removeEventListener('AC-UA', updateActivity);
	}
	var addActivity = function()
	{
		var result = that.ajax.fetch();
		var invitedArr = [];

		if(result.invited !== null)
		{
			for(var i = 0; i<result.invited.length; i++)
			{
				invitedArr.push(result.invited[i].id);
			}
		}

		var aD = new ActivityData(result.id, result.title, result.description, result.date, ('0'+(result.timestart)).slice(-5), ('0'+(result.timeend)).slice(-5), result.isOwner, invitedArr);

		if(m_isWeek)
		{
			that.week.addActivity(aD);
		}
		else
		{
			that.month.addActivity(aD);
		}
		window.removeEventListener("AC-CA", addActivity);
	}
	var addActivities = function() 
	{
        var result = that.ajax.fetch();
		var tmp = new Array();
		for(var i = 0; i < result.length; i++) 
		{
			var invitedArr = [];
			if(result[i].invited !== null)
			{
                invitedArr.push(result[i].invited.split(","));
			}

			var aD = new ActivityData(result[i].id, result[i].title, result[i].description, result[i].date, ('0'+(result[i].timestart)).slice(-5), ('0'+(result[i].timeend)).slice(-5), result[i].owner, invitedArr);
			tmp.push(aD);
        };
        if(m_isWeek)
		{
			that.week.addActivities(tmp);
		}
		else
		{
			that.month.addActivities(tmp);
		}

        window.removeEventListener('AC-AA', addActivities);
	};
	var nextWeek = function()
	{
		date.setDate((date.getDate() + 7));
		that.resetWeek(date.getWeekAsArray());
	};
	var currentWeek = function()
	{
		date = new Date();
		var dates = date.getWeekAsArray();
		that.resetWeek(dates);
	};
	var previousWeek = function()
	{
		date.setDate((date.getDate() - 7));
		that.resetWeek(date.getWeekAsArray());
	};
	var m_currentMonth = function ()
	{
		date = new Date();

		var map = new MonthMap(date);

		that.resetMonth(map.getDates(),map.getLDC(),map.getTDC());
	}
	var m_nextMonth = function ()
	{
		date.setMonth(date.getMonth() +1);

		var map = new MonthMap(date);

		that.resetMonth(map.getDates(),map.getLDC(),map.getTDC());
	};
	var m_previousMonth = function ()
	{
		date.setMonth(date.getMonth() -1);

		var map = new MonthMap(date);

		that.resetMonth(map.getDates(),map.getLDC(),map.getTDC());
	};
	var highlightCurrentDay = function(dates)
	{
		var today = new Date();
		var days = document.querySelectorAll('.weekday');
		
		for(var i=0; i < days.length; i++)
		{
			days[i].classList.remove('today');
		}

		for(var i = 0; i < dates.length; i++)
		{
			if(today.toJSON().slice(0,10) == dates[i])
			{
				
				var column = document.querySelectorAll('.weekday:nth-of-type('+(i+1)+')');
				
				for(var j = 0; j < column.length; j++)
				{
					column[j].classList.add('today'); 
				}
			}
		}
	};
	
	this.setTitle = function(dates)
	{
		var heading = document.getElementById('plannerHeading');

		heading.innerHTML = date.getFullYear() + ' ' + date.getMonthName(date.getMonth() );

		if(dates[dates.length - 1].slice(-2) < dates[0].slice(-2))
		{
			heading.innerHTML += ' - ';
			heading.innerHTML += date.getMonthName(date.getMonth() + 1);
		}
	}
	this.resetWeek = function (dates)
	{
		var date = new Date(dates[0]);
		var pwd = document.getElementById('plannerWeekDays');
		
		that.setTitle(dates);

		if(pwd !== null)
		{
			pwd.innerHTML = '';
			for(var i = 0; i < 7; i++)
			{
				pwd.innerHTML +=
					'<div class="pull-left weekday">' +
					'<span>' + dates[i].slice(-2) + ' ' +  week[i] +	'</span>' +
					'</div>';
			}
		}
		that.week.setDates(dates);
        window.addEventListener('AC-AA', addActivities);
		that.ajax.fetchActivitiesByDate(dates[0], dates[dates.length - 1], 'AC-AA');

		if(pwd !== null)
		{
			highlightCurrentDay(dates);
		}
	};
	this.createUpdateModal = function(e)
	{
		var fm = new FormMap();
		fm.addButton('Update', 'update', 'spanicon btn btn-sm btn-primary');
		fm.addButton('Close', 'cancel', 'btn btn-sm btn-default');
		fm.addButton('Delete Activity', 'delete', 'pull-right btn btn-sm btn-danger');
		fm.addInput("Title", "title", "text", e.detail.getTitle());
		fm.addInput("Description", "description", "textarea", e.detail.getDescription());
		fm.addTime("Date", "date", e.detail.getDate());
		fm.addTime("Start", "start", e.detail.getStart());
		fm.addTime("End", "end", e.detail.getEnd());
		fm.addInput("Add a friend?", "friend-field", "text");

		var modal = new Modal(fm, e.detail);
		window.removeEventListener("UpdateActivity", that.createUpdateModal);
		window.addEventListener("UpdateActivity", that.updateFromModal);
        location.assign("#header");
	}
	this.createActivityModal = function(e)
	{
		var fm = new FormMap();
		fm.addButton('Submit', 'submit', 'spanicon btn btn-sm btn-primary');
		fm.addButton('Close', 'cancel', 'btn btn-sm btn-default');
		fm.addInput("Title", "title", "text");
		fm.addInput("Description", "description", "textarea");
		fm.addTime("Date", "date", e.detail.getDate());
		fm.addTime("Start", "start", e.detail.getStart());
		fm.addTime("End", "end", e.detail.getEnd());
		fm.addInput("Add a friend?", "friend-field", "text");

		var modal = new Modal(fm);
		window.removeEventListener("CreateActivity", that.createActivityModal);
		window.addEventListener("CreateActivity", that.createFromModal);
        location.assign("#header");
	}
	this.createFromModal = function(e)
	{
		window.addEventListener('AC-CA', addActivity);
		that.ajax.createActivity(e.detail.getAjaxFormat(), 'AC-CA');
		window.removeEventListener("CreateActivity", that.createFromModal);
		window.addEventListener("CreateActivity", that.createActivityModal);
	}
	this.updateFromModal = function(e)
	{
		window.addEventListener('AC-UA', updateActivity);
		that.ajax.updateActivity(e.detail.getAjaxFormat(), 'AC-UA');
		window.removeEventListener("UpdateActivity", that.updateFromModal);
		window.addEventListener("UpdateActivity", that.createUpdateModal);
	}
	this.deleteActivityFromView = function(e)
	{
		var result = that.ajax.fetch();
		if(m_isWeek)
		{
			that.week.removeActivityById(result.activity_id);
		}
		else
		{
			that.month.removeActivityById(result.activity_id);
		}

		window.removeEventListener('AC-DA', that.deleteActivityFromView);
	}
	this.viewActivityModal = function(e)
	{
		var fm = new FormMap();
		fm.addButton('Opt-out', 'decline', 'btn btn-sm btn-danger spanicon' );
		fm.addButton('Close', 'cancel', 'btn btn-sm btn-default');
		fm.addInput("Title", "title", "text", e.detail.getTitle());
		fm.addInput("Description", "description", "textarea", e.detail.getDescription());
		fm.addTime("Date", "date", e.detail.getDate());
		fm.addTime("Start", "start", e.detail.getStart());
		fm.addTime("End", "end", e.detail.getEnd());

		var modal = new Modal(fm, e.detail);
		modal.disableInput();
        location.assign("#header");
	}
	this.deleteActivity = function(e)
	{
		window.addEventListener('AC-DA', that.deleteActivityFromView);
		that.ajax.deleteActivity(e.detail.getId(), 'AC-DA');
	}
	this.declineActivity = function(e)
	{
		window.addEventListener('AC-DA', that.deleteActivityFromView);
		that.ajax.declineActivityInvite(e.detail.getId(), 'AC-DA');
	}
	this.closeForm = function(e)
	{
		window.addEventListener("CreateActivity", that.createActivityModal);
		window.removeEventListener("CreateActivity", that.createFromModal);
		window.removeEventListener("UpdateActivity", that.updateFromModal);
		window.addEventListener("UpdateActivity", that.createUpdateModal);
	}
	this.createWeek = function(element, size)
	{
        that.isWeek = true;
        m_setupBtnElems();

        if(!m_isReady)
        {
            return;
        }


		that.week = new Week(document.querySelector(element), size);

		date = new Date();
		var dates = date.getWeekAsArray();
		that.resetWeek(dates);

		window.addEventListener('UpdateActivity', that.createUpdateModal);
		window.addEventListener('CreateActivity', that.createActivityModal);
		window.addEventListener('DeleteActivity', that.deleteActivity);
		window.addEventListener('CloseForm', that.closeForm);
		window.addEventListener('ViewActivity', that.viewActivityModal);
		window.addEventListener('DeclineActivity', that.declineActivity);
	}
	this.resetMonth = function(dates, LDC, TDC)
	{
		that.setTitle(dates);
		that.month.setDates(dates, LDC, TDC);
		window.addEventListener('AC-AA', addActivities);
		that.ajax.fetchActivitiesByDate(dates[0], dates[dates.length - 1], 'AC-AA');
	};
	this.createMonth = function (elem, viewElem)
	{
        m_isWeek = false;
        m_setupBtnElems();

        if(!m_isReady)
        {
            return;
        }

		date = new Date();
		that.month = new Month(document.querySelector(elem), document.querySelector(viewElem), date.getFullDateString(), m_addElem);

		var map = new MonthMap(date);

		that.resetMonth(map.getDates(),map.getLDC(),map.getTDC());

		window.addEventListener('UpdateActivity', that.createUpdateModal);
		window.addEventListener('CreateActivity', that.createActivityModal);
		window.addEventListener('DeleteActivity', that.deleteActivity);
		window.addEventListener('CloseForm', that.closeForm);
		window.addEventListener('ViewActivity', that.viewActivityModal);
		window.addEventListener('DeclineActivity', that.declineActivity);
	};

	window.addEventListener('ActivityDrop', function(e)
	{
		that.ajax.updateActivity(e.detail.getAjaxFormat());
    });
    
    window.addEventListener('NotificationUpdate', function() {
        if(m_isWeek) {
            that.resetWeek(date.getWeekAsArray());
        } else {
            var map = new MonthMap(date);
            that.resetMonth(map.getDates(),map.getLDC(),map.getTDC());
        }
    });
}