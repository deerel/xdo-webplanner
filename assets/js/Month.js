function Activity(aD)
{
    "use strict";
    var m_element;
    var m_aD = aD;
    var m_textBox;
    var that = this;

    this.getTimeValue = function()
    {
        var start = m_aD.getStart();
        start = start.split(":");

        var timeValue = start[0] + start[1];

        return parseInt(timeValue);
    };
    var m_createElement = function ()
    {
        var box = document.createElement("DIV");
        box.classList.add("activity");

        m_element = box;

        m_createTextBox();

        m_element.appendChild(m_textBox);
    };
    var m_createTextBox = function ()
    {
        var tb = document.createElement("DIV");

        tb.classList.add("monthTextBox");

        if (m_aD.getIsOwner() === 1)
        {
            tb.classList.add("owner");
        }
        else
        {
            tb.classList.add("invited");
        }

        tb.innerHTML += '<div class="monthTimestamp">' + m_aD.getStart() + '-' + m_aD.getEnd() + '<div>';
        tb.innerHTML += '<div class="monthTitle">' + m_aD.getTitle() + '</div>';

        m_textBox = tb;
    };
    that.getElement = function ()
    {
        return m_element;
    };
    that.getId = function ()
    {
        return m_aD.getId();
    };
    var m_click = function (e)
    {
        e.stopPropagation();
        e.preventDefault();

        if (m_aD.getIsOwner() === 1) {
            window.dispatchEvent(new CustomEvent('UpdateActivity', {'detail': m_aD}));
        }
        else {
            window.dispatchEvent(new CustomEvent('ViewActivity', {'detail': m_aD}));
        }
    };

    m_createElement();

    m_element.addEventListener("click", m_click, false);
}
function Day(date, viewElement, isToday)
{
    "use strict";
    var m_viewElement = viewElement;
    var m_element;
    var m_dayNum;
    var m_date = date;
    var m_hasActivities = false;
    var m_activities = [];
    var m_isToday;
    var that = this;


    if(typeof isToday === "undefined")
    {
        m_isToday = false;
    }
    else
    {
        m_isToday = isToday;
    }

    this.setIsToday = function (bool)
    {
        if(bool && bool !== m_isToday)
        {
            m_element.classList.add("isToday");

            m_isToday = true;
        }
        else if(!bool && bool !== m_isToday)
        {
            m_element.classList.remove("isToday");

            m_isToday = false;
        }
    };
    var m_sortActivtivies = function()
    {
        m_activities.sort(function(a,b)
        {
            return a.getTimeValue() - b.getTimeValue();
        });
    };
    var m_setHasActivities = function(bool)
    {
        if(bool && bool !== m_hasActivities)
        {
            m_element.classList.remove("empty");
            m_element.classList.add("hasActivity");
            m_hasActivities = true;
        }
        else if(!bool && bool !== m_hasActivities)
        {
            m_element.classList.remove("hasActivity");
            m_element.classList.add("empty");
            m_hasActivities = false;
        }
    };
    var m_updateHasActivities = function ()
    {
        if(m_activities.length > 0)
        {
            m_setHasActivities(true);
        }
        else
        {
            m_setHasActivities(false);
        }
    };
    var m_createElement = function()
    {
        var dayBox = document.createElement("DIV");

        dayBox.classList.add("dayBox");
        dayBox.classList.add("empty");

        if(m_isToday)
        {
            dayBox.classList.add("isToday");
        }

        var dayNum = document.createElement("DIV");

        dayNum.classList.add("dayNum");
        m_dayNum = dayNum;

        m_updateDayNum();

        dayBox.appendChild(dayNum);

        m_element = dayBox;
    };
    var m_updateDayNum = function ()
    {
        m_dayNum.innerHTML = m_date.slice(-2);
    };
    this.getDate = function()
    {
        return m_date;
    };
    this.getIndexOfId = function (id)
    {
        for(var i = 0; i < m_activities.length; i++)
        {
            if(id === m_activities[i].getId())
            {
                return i;
            }
        }
        return -1;
    };
    this.addActivity = function(aD)
    {
        m_activities.push(new Activity(aD));
        m_updateHasActivities();
        m_sortActivtivies();
    };
    this.removeActivityById = function(id)
    {
        var index = -1;

        for(var i = 0; i < m_activities.length; i++)
        {
            if(id === m_activities[i].getId())
            {
                index = i;
                break;
            }
        }
         if(index !== -1)
         {
             that.removeActivityByIndex(index);
             m_updateHasActivities();
         }
    };
    this.removeActivityByIndex = function(index)
    {
        if(m_viewElement === m_activities[index].getElement().parentNode)
        {
            m_viewElement.removeChild(m_activities[index].getElement());
        }

        for(var i = index; i < m_activities.length; i++)
        {
            m_activities[i] =  m_activities[i+1];
        }

        m_activities.pop();

        m_updateHasActivities();
    };
    this.clearActivities = function()
    {
      for(var i = m_activities.length-1; i >= 0; i--)
      {
          that.removeActivityByIndex(i);
      }
      m_updateHasActivities();
    };
    this.getElement = function()
    {
        return m_element;
    };
    var m_click = function (e) {
        e.stopPropagation();
        e.preventDefault();

        m_viewElement.innerHTML = "";

        window.dispatchEvent(new CustomEvent("isViewing", {'detail': m_date}));

        that.draw();
    };
    this.draw = function()
    {
        for(var i = 0; i < m_activities.length; i++)
        {
            m_viewElement.appendChild(m_activities[i].getElement());
        }
    };

    m_createElement();

    m_element.addEventListener("click", m_click, false);
}
function Month(element, viewElement, today, addElement)
{
    "use strict";
    var m_dates = [];
    var m_leadingDays = [];
    var m_leadingDaysCount = 0;
    var m_days = [];
    var m_trailingDays = [];
    var m_trailingDaysCount = 0;
    var m_element = element;
    var m_viewElement = viewElement;
    var m_addElement = addElement;
    var m_today = today;
    var that = this;
    var m_indexOfViewing = -1;

    var m_setupAddElement = function()
    {
        if(typeof m_addElement !== "undefined")
        {
            m_addElement.addEventListener("click", m_click, false);
        }
    };
    var m_click = function(e)
    {
        var date;

        if(m_indexOfViewing !== -1)
        {
            date = m_dates[m_indexOfViewing];
        }
        else
        {
            date = m_dates[0];
        }
        var aD = new ActivityData("-1","-1","-1",date,"00:00","00:00","1");

        window.dispatchEvent(new CustomEvent('CreateActivity', {'detail': aD}));
    };
    var m_checkIsToday = function()
    {
        var m = m_dates[0].slice(0,7);
        var t = m_today.slice(0,7);

        var index = (parseInt(m_today.slice(-2)) -1);



        if(m === t)
        {
            m_days[index].setIsToday(true);
        }
        else
        {
            m_days[index].setIsToday(false);
        }
    }
    var m_setIndexOfViewing = function(e)
    {
        e.stopPropagation();

        if(m_indexOfViewing !== -1)
        {
            m_days[m_indexOfViewing].getElement().classList.remove("isClicked");
        }

        m_indexOfViewing = parseInt(e.detail.slice(-2)) -1;


        m_days[m_indexOfViewing].getElement().classList.add("isClicked");
    }
    this.clearActivities = function ()
    {
        if(m_indexOfViewing !== -1)
        {
            m_days[m_indexOfViewing].getElement().classList.remove("isClicked");
        }
        for(var i = 0; i < m_days.length; i++)
        {
            m_days[i].clearActivities();
        }
    };
    var m_updateLeadingDays = function (newCount)
    {
        var diff = newCount - m_leadingDaysCount;

        if(diff > 0)
        {
            for(var i = m_leadingDaysCount; i < newCount; i++)
            {
                m_element.insertBefore(m_leadingDays[i], m_element.firstChild);
            }
        }
        else if(diff < 0)
        {
            for(var j = (m_leadingDaysCount-1); j >= newCount; j--)
            {
                m_element.removeChild(m_leadingDays[j]);
            }
        }
        m_leadingDaysCount = newCount;
    };
    var m_updateTrailingDays = function (newCount)
    {
        var diff = newCount - m_trailingDaysCount;

        if(diff > 0)
        {
            for(var i = m_trailingDaysCount; i < newCount; i++)
            {
                m_element.insertBefore(m_trailingDays[i], m_element.lastChild.nextSibling);
            }
        }
        else if(diff < 0)
        {
            for(var j = (m_trailingDaysCount-1); j >= newCount; j--)
            {
                m_element.removeChild(m_trailingDays[j]);
            }
        }
        m_trailingDaysCount = newCount;
    };
    var m_updateDays = function()
    {
        var diff = (m_dates.length - m_days.length);

        if(diff > 0)
        {
            var isToday;

            for(var i = 0; i <diff; i++)
            {
                isToday = false;

                var temp = m_dates[m_dates.length-diff];

                if(m_dates[m_dates.length-diff] === m_today)
                {
                    isToday = true;
                }

                m_days.push(new Day(temp,m_viewElement,isToday));
                m_element.insertBefore(m_days[m_days.length-1].getElement(), m_days[m_days.length-2].getElement().nextSibling);
            }
        }
        else if(diff < 0)
        {
            for(var j = m_days.length-1; j >= m_dates.length; j--)
            {
                m_element.removeChild(m_days[j].getElement());
                m_days.pop();
            }
        }
    };
    this.setDates = function(dates, leadingDaysCount, trailingDaysCount)
    {
        m_dates = dates;

        if(m_days.length > 0)
        {
            that.clearActivities();
            m_updateDays();
            m_updateLeadingDays(leadingDaysCount);
            m_updateTrailingDays(trailingDaysCount);
            m_checkIsToday();

        }
        else
        {
            m_createDays();
            m_createLeadingAndTrailingDays();
            m_updateLeadingDays(leadingDaysCount);
            m_updateTrailingDays(trailingDaysCount);
        }
    };
    this.addActivities = function(arr)
    {
        for(var i = 0; i < arr.length; i++)
        {
            that.addActivity(arr[i]);
        }
    };
    this.addActivity = function(aD)
    {
        var temp = aD.getDate().slice(-2);
        var index = (parseInt(temp) -1);


        m_days[index].addActivity(aD);

        if(index === m_indexOfViewing)
        {
            m_days[index].draw();
        }
    };
    this.removeActivityById = function(id)
    {
        for(var i = 0; i < m_days.length; i++)
        {
            var index = m_days[i].getIndexOfId(id);

            if(index !== -1)
            {
                m_days[i].removeActivityByIndex(index);
                break;
            }
        }
    };
    this.updateActivity = function(aD)
    {
        that.removeActivityById(aD.getId());

        var index = m_getIndexOfDate(aD.getDate());

        if(index !== -1)
        {
            m_days[index].addActivity(aD);
        }
        if(index === m_indexOfViewing)
        {
            m_days[index].draw();
        }
    };
    var m_getIndexOfDate = function(date)
    {
        for(var i = 0; i < m_dates.length; i++)
        {
            if(m_dates[i] === date)
            {
                return i;
            }
        }

        return -1;
    };
    var m_createLeadingAndTrailingDays = function()
    {
        var box;

        for(var i = 0; i < 7; i++)
        {
            box = document.createElement("DIV");
            box.classList.add("dayBox");
            box.classList.add("deadDay");
            m_leadingDays.push(box);

            box = document.createElement("DIV");
            box.classList.add("dayBox");
            box.classList.add("deadDay");
            m_trailingDays.push(box);
        }
    };
    var m_createDays = function()
    {
        var isToday;

        for(var i = 0; i < m_dates.length; i++)
        {
            isToday = false;

            if(m_dates[i] === m_today)
            {
                isToday = true;
            }
            m_days.push(new Day(m_dates[i], m_viewElement, isToday));

            m_element.appendChild(m_days[i].getElement());
        }
    };
    window.addEventListener("isViewing", m_setIndexOfViewing, false);

    m_setupAddElement();
}
function MonthMap(date)
{
    "use strict";
    var m_date = date;
    var m_dates = [];
    var m_leadingDaysCount;
    var m_trailingDaysCount;

    this.getDates = function()
    {
        return m_dates;
    };
    this.getLDC = function()
    {
        return m_leadingDaysCount;
    };
    this.getTDC = function()
    {
        return m_trailingDaysCount;
    };
    var m_createDates = function()
    {
        m_dates = m_date.getMonthAsArray();
    };
    var m_createLeadingDaysCount = function()
    {
        m_date.setDate(1);
        m_leadingDaysCount = ((m_date.getDay()-1).mod(7));
    };
    var m_createTrailingDaysCount = function()
    {
        var temp = (7-(m_date.getNumOfDays()+m_leadingDaysCount).mod(7));

        if(temp === 7)
        {
            m_trailingDaysCount = 0;
        }
        else
        {
            m_trailingDaysCount = temp;
        }
    };

    m_createDates();
    m_createLeadingDaysCount();
    m_createTrailingDaysCount();
}