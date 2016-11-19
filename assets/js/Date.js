Number.prototype.mod = function(n)
{
    "use strict";
    return ((this%n)+n)%n;
};
Date.prototype.getNumOfDays = function()
{
    "use strict";
    var date = new Date(this.getFullYear(), this.getMonth() + 1, 0);
    return date.getDate();
};

Date.prototype.getMonthAsArray = function()
{
    "use strict";
    var dates = [];
    for(var i = 0; i < this.getNumOfDays(); i++)
    {
        dates.push(this.getFullYear() + "-" + (this.getMonth()+1) + "-" + ('0'+(i+1)).slice(-2));
    }
    return dates;
};

Date.prototype.getFirstDayOfWeek = function()
{
    "use strict";
    var temp = new Date(this.getTime());
    var distance = (temp.getDay()-1).mod(7);
    return new Date(this.getTime() - (distance * 86400000));
};

Date.prototype.getWeekAsArray = function()
{
    "use strict";
    var d = new Date(this.getFirstDayOfWeek());
    var dates = [];
    for(var i = 0; i < 7; i++) {
        dates.push(d.getFullYear() + "-" + (d.getMonth()+1) + "-" + ('0'+(d.getDate())).slice(-2));
        d.setDate((d.getDate()+1));
    }
    return dates;
};

Date.prototype.getDayName = function()
{
    "use strict";
    var dayName = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    return dayName[this.getDay()];
};

Date.prototype.getDayShortName = function()
{
    "use strict";
    var dayName = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    return dayName[this.getDay()];
};

Date.prototype.getMonthName = function(i)
{
    "use strict";
    var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    if(i == months.length) 
    {
        i = 0;
    }

    return months[i];
};
Date.prototype.getFullDateString = function()
{
    "use strict";
    var year = this.getFullYear();
    var month = this.getMonth()+1;
    var day = this.getDate();

    if(day < 10)
    {
        day = "0" + day;
    }

    return year + "-" + month + "-" + day;
};
