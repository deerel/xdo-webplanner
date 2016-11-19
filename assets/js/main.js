if(APP.USER_AGENT == 'Desktop')
{
	$(document).ready(function()
	{
	
		$('#userMenu > a').on('mouseover', function()
		{
			$('#userMenu').children('.sub-menu').fadeIn(300);
		});
		$('#userMenu').on('mouseleave', function()
	 	{
	 		$(this).children('.sub-menu').fadeOut(300);
	 	});
	});
}

// function getMeta(c) {
// 	for (var b = document.getElementsByTagName("meta"), a = 0; a < b.length; a++) {
// 	    if (c == b[a].name || c == b[a].getAttribute("property")) { 
// 	    	return b[a].content; 
// 		}
// 	} 

// 	return false;
// }

function validate(e)
{
	var isFilledIn = true;
	
	if (e.target.id === "friendForm") {
		var friendForm = {
			email: document.getElementsByName('email')[0]
		}
		for(var field in friendForm) {
			if (friendForm[field].value === "") {
				friendForm[field].classList.add("form-error");
				isFilledIn = false;
			}
			else {
				friendForm[field].classList.remove("form-error");
			}
		}
	};
	if(e.target.id === "loginForm")
	{
		var loginForm = {
			email: document.getElementsByName('email')[0],
			password: document.getElementsByName('password')[0]
		}

		for(var field in loginForm)
		{
			if (loginForm[field].value === "") {
				loginForm[field].classList.add("form-error");
				isFilledIn = false;
			}
			else {
				loginForm[field].classList.remove("form-error");
			}
		}
	}
	if(e.target.id === "registerForm")
	{
		var registerForm = {
			email: document.getElementsByName('email')[0],
			password: document.getElementsByName('password')[0],
			passwordRepeat: document.getElementsByName('passwordRepeat')[0],
			fname: document.getElementsByName('fname')[0],
			lname: document.getElementsByName('lname')[0]
		}

		for(var field in registerForm)
		{
			if (registerForm[field].value === "") {
				registerForm[field].classList.add('form-error');
				isFilledIn = false;
			}
			else {
				registerForm[field].classList.remove('form-error');
			}
		}
	}
	if (!isFilledIn) {
		e.preventDefault();
	};
}

var main = function()
{
	var flashClose = document.querySelector('.flash-close');
	if(flashClose != null)
	{
		flashClose.addEventListener('click', function() {
			flashClose.parentNode.classList.add('hidden');
		});
	}

	var forms = document.querySelectorAll('form');
	for(var i = 0; i < forms.length; i++)
	{
		forms[i].addEventListener('submit', validate, false);
	}

	// for(var i = 0; i < forms.length; i++)
	// {
	// 	forms[i].innerHTML += '<input name="csrftoken" type="hidden" value="' + getMeta('csrf_token') + '" />';
	// }
	
	if(APP.USER_AGENT == 'Desktop')
	{	
	  	if(APP.CURRENT_PAGE == 'planner')
	  	{
	  		var planner = new Planner("#previous", "#current", "#next", "#add");

	  		if(APP.MODE == 'week')
	  		{
	  			planner.createWeek('#plannerContent', 24*4);
	  		}
	  		else if (APP.MODE == 'month')
	  		{
				planner.createMonth("#plannerMonthGrid", "#plannerMonthDayInfo");     
	  		}
	  	}
	}
	else 
	{
		var toggleNav = document.querySelector('[data-group="toggleDropdown"][data-role="toggle"]');
		var nav = document.querySelector('[data-group="toggleDropdown"][data-role="target"]');
		var toggleNotification = document.querySelector('[data-group="toggleNotifications"][data-role="toggle"]');
		var notificationList = document.querySelector('[data-group="toggleNotifications"][data-role="target"]');

		if(nav != null && toggleNav != null)
		{
			toggleNav.addEventListener('click', function() 
			{
				notificationList.classList.add('hidden');		
				if(nav.classList.contains('hidden'))
				{
					nav.classList.remove('hidden');
				}
				else
				{
					nav.classList.add('hidden');
				}
			});
		}

		if(toggleNotification != null && notificationList != null)
		{
			toggleNotification.addEventListener('click', function() 
			{
				nav.classList.add('hidden');
			});
		}
		
		if(APP.CURRENT_PAGE == 'planner')
	  	{
			var planner = new Planner("#previous", "#current", "#next", "#add");
			planner.createMonth("#plannerMonthGrid", "#plannerMonthDayInfo");  
		} 
	}

    var notification = new Notification();
	if(APP.CURRENT_PAGE == 'settings')
	{
		document.querySelector('.form-upload').addEventListener('click', function() {
			this.querySelector('input[type="file"]').click();
		});

		document.querySelector('.form-upload input[type="file"]').addEventListener('change', function() {
			if(this.value == "") {
				this.previousElementSibling.innerHTML = 'Click to upload';
			} else  {
				this.previousElementSibling.innerHTML = this.value.split('\\').pop();
			}
		});  
	}
    
};
window.addEventListener('load', main, false);
