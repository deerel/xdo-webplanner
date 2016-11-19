function TimeGenerator(distribution)
{
    "use strict";
    var m_distribution = distribution;
    var m_timeArr = [];
    var m_hourSubdividers = [];
 
    var m_createHourSubdividers = function()
    {
        var perHour = m_distribution/24;
        var subDivider = 60/perHour;
        var temp;
 
        for(var i = 0; i < perHour; i++)
        {
            temp = i*subDivider;
 
            if(temp < 10)
            {
                m_hourSubdividers.push(("0" + temp.toString()));
            }
            else
            {
                m_hourSubdividers.push(temp.toString());
            }
        }
    };
    var m_createTimeArr = function ()
    {
        var temp;
 
 
        for(var i = 0; i <= 24; i++)
        {
 
            for(var j = 0; j < m_hourSubdividers.length; j++)
            {
                temp = "";
                if(i < 10)
                {
                    temp += "0" + i;
                }
                else
                {
                    temp += i;
                }
 
                temp +=":";
                temp += m_hourSubdividers[j];
                m_timeArr.push(temp);
                if(i === 24)
                {
                    break;
 
                }
            }
        }
    };
    this.getTimeArr = function ()
    {
        return m_timeArr;
    };
    this.getTimeString = function()
    {
        var str = "";
 
        for(var i = 0; i < m_timeArr.length; i++)
        {
            str += m_timeArr[i] + "<br>";
        }
 
        return str;
    };
    m_createHourSubdividers();
    m_createTimeArr();
}
function Button(label, role, classname)
{
	var m_label = label;
	var m_role = role;
	var m_classname = classname;
	var element;

	this.getElement = function() {
		return element;
	}
	this.getRole = function() {
		return m_role;
	}

	var createButtonElement = function() {
		element = document.createElement("div");
		element.className = m_classname;
		element.innerHTML = m_label;
		element.setAttribute("data-role", m_role);
	}
	createButtonElement();
}
function Input(label, role, type, value)
{
	var value = (typeof value !== 'undefined') ?  value : "";
	var m_label = label;
	var m_role = role;
	var m_type = type;
	var m_value = value;
	var input_element;
	var label_element;
	var m_isFilledIn = true;
	var wrapper_element = document.createElement("div");

	this.getElement = function() {
		return wrapper_element;
	}
	this.getInputElement = function() {
		return input_element;
	}
	this.getValue = function() {
		if (input_element.value === "") {
			m_isFilledIn = false;
		}
		else {
			m_isFilledIn = true;
		}
		return input_element.value;
	}
	this.getIsFilledIn = function()
	{
		return m_isFilledIn;
	}
	this.getRole = function() {
		return m_role;
	}
	
	var createInputElement = function()	{
		label_element = document.createElement("h6");
		label_element.innerHTML = m_label;

		if (m_type === "textarea")
		{
			input_element = document.createElement("textarea");
			input_element.innerHTML = m_value;		
		}
		else
		{
			input_element = document.createElement("input");
			input_element.setAttribute("type", m_type);
			input_element.setAttribute("value", m_value);	
		}

		input_element.setAttribute("data-role", m_role);
		input_element.classList.add("form-input");

		wrapper_element.classList.add("form-field");
		wrapper_element.appendChild(label_element);
		wrapper_element.appendChild(input_element);
	}
	createInputElement();
}
function Time(label, role, value)
{
	var value = (typeof value !== 'undefined') ?  value : "";
	var m_label = label;
	var m_role = role;
	var m_value = value;
	var m_isFilledIn = true;

	var wrapper_element = document.createElement("div");
	var label_element = document.createElement("h6");
	var time_element = document.createElement("select");
	var date_element = document.createElement("input");

	var timeObj = new TimeGenerator(96);
	var timeArr = timeObj.getTimeArr();

	this.getTimeWrapper = function() {
		return wrapper_element;
	}
	this.getTimeElement = function() {
		return time_element;
	}
	this.getRole = function() {
		return m_role;
	}
	this.getSelectedTime = function()
	{
		return timeArr[time_element.selectedIndex];
	}
	this.getDateElement = function() 
	{
		if (date_element.value === "") {
			m_isFilledIn = false;
		}
		else
		{
			m_isFilledIn = true;
		}
		return date_element;
	}
	this.getIsFilledIn = function()
	{
		return m_isFilledIn;
	}
	this.setDateElement = function(value)
	{
		date_element.value = value;
	}

	var createTimeField = function()
	{
		label_element.innerHTML = m_label;
		wrapper_element.appendChild(label_element);
		wrapper_element.className = "form-field";

		if (m_role === "date")
		{
			date_element.setAttribute("data-role", m_role);
			date_element.className = "form-input";
			date_element.value = m_value;
			if(APP.USER_AGENT === "Desktop")
			{
				$( function() 
				{
				    $('input[data-role="date"]').datepicker({
					  dateFormat: "yy-mm-dd"
					});
				});
			}
			wrapper_element.appendChild(date_element);
		}
		else
		{
			time_element.setAttribute("data-role", m_role);
			
			for (var i = 0; i < timeArr.length; i++) 
			{						
				var option = document.createElement("option");
				option.setAttribute("value", timeArr[i]);
				if (timeArr[i] === m_value)
					option.setAttribute("selected", "selected");

				option.text = timeArr[i];
				time_element.appendChild(option);
			}
			wrapper_element.appendChild(time_element);		
		}
		
	}
	createTimeField();
}
function FormMap()
{
	var m_buttons = [];
	var m_inputs = [];
	var m_times = [];

	this.getButtons = function() {
		return	m_buttons;
	}
	this.getInputs = function() {
		return m_inputs;
	}
	this.getTimes = function() {
		return m_times;
	}

	this.addButton = function(label, role, classname) {
		m_buttons.push(new Button(label, role, classname));
	}
	this.addInput = function(label, role, type, value) {
		m_inputs.push(new Input(label, role, type, value));
	}
	this.addTime = function(label, role, value) {
		m_times.push(new Time(label, role, value));
	}
}

function Modal(formMap, aD)
{
	var aD = (typeof aD !== 'undefined') ?  aD: "undefined";
	var modal_div = document.createElement("div");
	var modal_div_background = document.createElement("div");
	var modal_div_wrapper = document.createElement("div");
	var friendResults = document.createElement("div");
	var invited_element = document.createElement("div"); 
	var form = document.createElement("form");
	var isDisabled = false;

	var indexOfFriendField = -1;
	var m_aD = aD;
	var invited = [];

	var inputs = formMap.getInputs();
	var buttons = formMap.getButtons();
	var times = formMap.getTimes();

	this.getModal = function() {
		return modal_div;
	}
	this.getWrapper = function() {
		return modal_div_background;
	}
	this.disableInput = function()
	{
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].getInputElement().setAttribute("readonly", "readonly");
		};
		for (var i = 0; i < times.length; i++) {
			times[i].getTimeElement().setAttribute("disabled", "disabled");
			times[i].getDateElement().setAttribute("readonly", "readonly");
			times[i].getDateElement().setAttribute("data-role", "viewonly");
		};
		isDisabled = true;
	}
	var assignButtonEvents = function()
	{
		var temp;
		for (var i = 0; i < buttons.length; i++) {
			var buttonRole = buttons[i].getRole();

			if (buttonRole === "submit") {
				temp = buttons[i].getElement();
				temp.addEventListener("click", submitData, false);
			}
			if (buttonRole === "update") {
				temp = buttons[i].getElement();
				temp.addEventListener("click", updateData, false);
			}
			if (buttonRole === "cancel") {
				temp = buttons[i].getElement();
				temp.addEventListener("click", closeForm, false);
			}
			if (buttonRole === "decline") {
				temp = buttons[i].getElement();
				temp.addEventListener("click", declineActivity, false)
			};
			if (buttonRole === "delete") {
				temp = buttons[i].getElement();
				temp.addEventListener("click", deleteActivity, false);
			}
		}
	}
	var assignInputEvents = function()
	{
		var temp, timer;
		for (var i = 0; i < inputs.length; i++) {
			var inputRole = inputs[i].getRole();

			if (inputRole === "friend-field") {
				temp = inputs[i].getInputElement();
				indexOfFriendField = i;
				temp.addEventListener("keyup", function()
				{
					clearTimeout(timer);
					timer = setTimeout(function()
					{
						searchFriend(temp);
					}, 200);
				}, false);
			}
		}
	}
	var getFormData = function(e)
	{
		var id, isOwner, title, description, date, start, end;
		var temp;

		if (m_aD === "undefined") {
			id = "null";
			isOwner = "1";
		}
		else
		{
			id = m_aD.getId();
			isOwner = m_aD.getIsOwner();
		}

		for (var i = 0; i < inputs.length; i++) {
			temp = inputs[i].getRole();
			if (temp === "title")
				title = inputs[i].getValue();
			if (temp === "description")
				description = inputs[i].getValue();
		};
		for (var i = 0; i < times.length; i++) {
			temp = times[i].getRole();
			if (temp === "start")
				start = times[i].getSelectedTime();
			if (temp === "end")
				end = times[i].getSelectedTime();
			if (temp === "date")
				date = times[i].getDateElement().value;
		};
		m_aD = new ActivityData(id, title, description, date, start, end, isOwner, invited);
	}
	var declineActivity = function(e)
	{
		window.dispatchEvent(new CustomEvent("DeclineActivity", {'detail': m_aD}));
		closeForm();
	}
	var closeForm = function(e)
	{
		modal_div_background.remove();
		modal_div_wrapper.remove();
		window.dispatchEvent(new CustomEvent("CloseForm"));
	}	
	var deleteActivity = function(e)
	{
		window.dispatchEvent(new CustomEvent("DeleteActivity", {'detail': m_aD}));
		closeForm();
	}
	var addFriend = function(e)
	{
		var id = this.getAttribute("data-userid");
		if (invited.indexOf(id) === -1) //Return -1 if no such id	
		{
			invited.push(id);
			friendResults.innerHTML = "";
			inputs[indexOfFriendField].getInputElement().value = "";
			invited_element.appendChild(this);
		}
	}
	var removeFriend = function(e)
	{
		if (indexOfFriendField !== -1 && isDisabled === false) 
		{
			var id = this.getAttribute("data-userid");
			var index = invited.indexOf(id);
			invited.splice(index, 1);
			this.parentNode.removeChild(this); 
		};
	}
	var submitData = function()
	{
		getFormData();	
		if (checkIsFilledIn())
		{
			window.dispatchEvent(new CustomEvent("CreateActivity", {'detail': m_aD}));
			closeForm();
		}
	}
	var updateData = function()
	{
		getFormData();	
		if (checkIsFilledIn())
		{		
			window.dispatchEvent(new CustomEvent('UpdateActivity', {'detail': m_aD}));
			closeForm();
		}
	}
	var checkIsFilledIn = function()
	{
		var isFilledIn = true;
		var labelArr = [];

		for (var i = 0; i < inputs.length; i++) {
			if (inputs[i].getIsFilledIn() === false) {

				inputs[i].getInputElement().classList.add("form-error");
				isFilledIn = false;
			}		
		}
		for (var i = 0; i < times.length; i++) {
			if (times[i].getIsFilledIn() === false) {
				if (times[i].getDateElement().value === "") {
					times[i].getDateElement().classList.add("form-error");
				};
				isFilledIn = false;
			}
		}
		return !(m_aD.getStart() === m_aD.getEnd() || isFilledIn !== true)
	}
	var insertInvited = function()
	{
		if (indexOfFriendField !== -1 && m_aD !== "undefined" && m_aD.getInvited().length > 0) 
		{
			var ajax = new Ajax();
			var result, name;
			var label = document.createElement("h6");

			label.innerHTML = "Invited";
			invited_element.appendChild(label);

			window.addEventListener("AjaxComplete", function(){
			result = ajax.fetch();

				for (var i = 0; i < result.length; i++) {				
					name = createFriendElement(result, i);
					name.addEventListener("click", removeFriend, false);				
					invited_element.appendChild(name);
					invited.push(result[i].id);
				};
			})
			ajax.fetchInvitedUsersByActivityId(m_aD.getId());
		}
	}
	var searchFriend = function(e)
	{
		var ajax = new Ajax();
		var inputfield = e;
		var result, name;
		var str = e.value;
        var that = e;

        str = str.charAt(0).toUpperCase() + str.slice(1);//First letter of search string to uppercase
		
		if (str.length <= 0) {
			friendResults.innerHTML = "";
			return;
		}

		window.addEventListener("AjaxComplete", function(){
			result = ajax.fetch();
			inputfield.parentNode.appendChild(friendResults);
			friendResults.innerHTML = "";

			for (var i = 0; i < result.length; i++) {
				name = createFriendElement(result, i);
				name.addEventListener("click", addFriend, false);
				friendResults.appendChild(name);			
			};
		});
        
        ajax.fetchFriendsByName(str);	
	}
	var createFriendElement = function(result, index)
	{
		m_result = result;
		m_index = index;

		var name = document.createElement("div");
		var profilePic = document.createElement("img");
		var profilePic_wrapper = document.createElement("span");
		var label_name = document.createElement("span");

		profilePic.setAttribute("src", APP.DOMAIN + "/assets/img/uploads/" + m_result[m_index].avatar);
		profilePic_wrapper.className = "avatar avatar-xs is-circle spanicon" ;
		profilePic_wrapper.appendChild(profilePic);
		
		label_name.innerHTML = m_result[m_index].name;
		
		name.setAttribute("data-userid", m_result[m_index].id);
		name.className = "invited-user flex flex-vcenter";
		name.appendChild(profilePic_wrapper);
		name.appendChild(label_name);
		return name;
	}
	var createModal = function()
	{
		var button_div = document.createElement("div");
		var indexOfDescription = -1;
		button_div.className = "form-field";

		for (var i = 0; i < inputs.length; i++) {
			form.appendChild(inputs[i].getElement());
			if (inputs[i].getRole() === "description") {
				indexOfDescription = i;
				indexOfFriendField = i;
			};
		}
		for (var i = 0; i < buttons.length; i++) {
			button_div.appendChild(buttons[i].getElement());
		}
		for (var i = 0; i < times.length; i++) {
			form.appendChild(times[i].getTimeWrapper());
		}

		assignButtonEvents();
		assignInputEvents();
		insertInvited();

		form.classList.add("form");
		form.appendChild(button_div);

		invited_element.className = "form-field";

		// when js doesnt have insertAfter ¯\_(ツ)_/¯
		inputs[indexOfDescription].getElement().parentNode.insertBefore(invited_element, inputs[indexOfDescription].getElement().nextSibling); 

		modal_div.appendChild(form);
		modal_div.className="modal-form animated bounceInDown";

		modal_div_wrapper.appendChild(modal_div);
		modal_div_wrapper.className="modal-wrapper"
		
		modal_div_background.classList.add("modal-background");
		document.body.insertBefore(modal_div_background, document.body.firstChild);
		document.body.insertBefore(modal_div_wrapper, modal_div_background);
	}
	createModal();
}
