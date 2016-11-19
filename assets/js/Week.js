function Converter() {
    "use strict";
    var m_hours;
    var m_minutes;
    var m_percent;

    this.timeToPercent = function(str)
    {
        var arr = str.split(":");
        m_hours = parseInt(arr[0]);
        m_minutes = parseInt(arr[1]);

        var temp = m_hours + m_minutes/60;

        return m_remap(temp, 0,24,0,100);
    };
    this.percentToTime = function (multiplier, totalHours, distribution) {
        var temp = multiplier * (totalHours / distribution);
        m_hours = Math.floor(temp);
        temp = temp - m_hours;

        m_minutes = Math.round(m_remap(temp, 0,1,0,60));

        return m_createTimeString();
    };

    var m_createTimeString = function (value) {
        var str = "";

        if (m_hours < 10) {
            str += "0" + m_hours;
        }
        else {
            str += m_hours;
        }

        str += ":";

        if (m_minutes < 10) {
            str += "0" + m_minutes;
        }
        else {
            str += m_minutes;
        }
        return str;
    };

    var m_remap = function (value, inMin, inMax, outMin, outMax) {
        return parseFloat((value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin);
    };
}
function Draggable(element, aD, parentWidth, parentHeight, isMovingEvent, gridSizeY)
{
    "use strict";
    var m_element = element;
    var m_aD = aD;
    var m_parentWidth = parentWidth;
    var m_parentHeight = parentHeight;
    var m_isMovingEvent = isMovingEvent;
    var that = this;
    var m_gridSizeX = 1;
    var m_gridSizeY = gridSizeY;
    var m_gridX = [];
    var m_gridY = [];
    var m_inner;
    var m_stretchUp;
    var m_stretchDown;
    var m_isStretchingDown = false;
    var m_isStretchingUp = false;
    var m_title;
    var m_content;
    var m_textBox;
    var m_converter = new Converter();
    var m_offsetTop = document.getElementById('plannerMain').offsetTop;
    this.isMoving = false;
    this.isSelected = false;

    this.updateActivityTime = function()
    {
        var start = that.toTime(m_getTop());
        var end = that.toTime(this.getEndPos());

        if(start !== m_aD.getStart() || end !== m_aD.getEnd())
        {
            m_aD.updateTime(start, end);
        }
    };
    this.setActivityData = function (aD)
    {
        m_aD = aD;
        that.transferActivityData();
    };
    this.getDataId = function ()
    {
        return m_aD.getId();
    };
    this.fromTime = function(str)
    {
        return m_converter.timeToPercent(str);
    };
    this.toTime = function(val)
    {
        var index = m_getCellIndexY(val);

        return m_converter.percentToTime(index,24,m_gridSizeY);
    };
    this.transferActivityData = function()
    {
        var newTop = that.fromTime(m_aD.getStart());
        var newHeight = that.fromTime(m_aD.getEnd()) - newTop;

        m_title = m_aD.getTitle();

        if(m_aD.getIsOwner() === 1)
        {
            m_textBox.classList.add("owner");
        }
        else
        {
            m_textBox.classList.add("invited");
        }

        m_setTop(newTop);
        m_setHeight(newHeight);
        that.updateTextBox();
    };
    this.isStreching = function()
    {
        return (m_isStretchingUp || m_isStretchingDown);
    };
    this.enableMoving = function()
    {
        that.isMoving = true;

        m_element.style.zIndex = 1;
    };
    this.disableMoving = function()
    {
        that.isMoving = false;
        m_element.style.zIndex = 0;
    };
    this.setIsMovingEvent = function(isMovingEvent)
    {
        m_isMovingEvent = isMovingEvent;
    };
    this.updateTextBox = function()
    {
        var posTop = that.toTime(m_getTop());
        var posBot = that.toTime(this.getEndPos());

        m_textBox.innerHTML = '<div class="timestamp">' + posTop + '-' + posBot + '<div>';
        m_textBox.innerHTML += '<div class="title">' + m_title + '</div>';
    };
    var m_createTextBox = function ()
    {
        var textBox = document.createElement("DIV");
        textBox.classList.add("textBox");

        m_inner.appendChild(textBox);

        m_textBox = textBox;

        that.updateTextBox();
    };
    var m_createInner = function()
    {
        var inner = document.createElement("DIV");
        inner.classList.add("inner");

        m_element.appendChild(inner);

        m_inner = inner;
    };
    var m_createStretchables = function()
    {
        var stretchUp = document.createElement("DIV");
        stretchUp.classList.add("stretchable");
        m_inner.appendChild(stretchUp);
        m_stretchUp = stretchUp;

        var stretchDown = document.createElement("DIV");
        stretchDown.classList.add("stretchable");
        m_inner.appendChild(stretchDown);
        m_stretchDown = stretchDown;
    };
    this.setGridSizeX = function(gridSizeX)
    {
        m_gridSizeX = gridSizeX;
        m_createGridX();
    };
    var m_createGridX = function()
    {
        m_gridX = [];
        for(var i = 0; i <= m_gridSizeX; i++)
        {
            m_gridX.push(parseFloat(i * (100 / m_gridSizeX)));
        }
    };
    var m_createGridY = function()
    {
        for(var i = 0; i <= m_gridSizeY; i++)
        {
            m_gridY.push(parseFloat(i * (100 / m_gridSizeY)));
        }
    };
    var m_getClosestCellX = function(value)
    {
        var diff = 101;
        var temp;
        var index = 0;

        for(var i = 0; i < m_gridX.length; i++)
        {
            temp = Math.abs(parseFloat(m_gridX[i] - value));

            if(temp < diff)
            {
                diff = temp;
                index = i;
            }
        }
        return m_gridX[index];
    };
    var m_getClosestCellY = function(value)
    {
        var diff = 101;
        var temp;
        var index = 0;
        for(var i = 0; i < m_gridY.length; i++)
        {
            temp = Math.abs(parseFloat(m_gridY[i] - value));

            if(temp < diff)
            {
                diff = temp;
                index = i;
            }
        }
        return m_gridY[index];
    };
    var m_getWidth = function ()
    {
        return that.toPercentWidth(parseFloat(window.getComputedStyle(m_element).width));
    };
    this.getWidth = function ()
    {
        return that.toPercentWidth(parseFloat(window.getComputedStyle(m_element).width));
    };
    this.getLeft = function ()
    {
        return that.toPercentWidth(parseFloat(window.getComputedStyle(m_element).left));
    };
    var m_setTop = function(value)
    {
        m_element.style.top = value + "%";
    };
    var m_setHeight = function(value)
    {
        m_element.style.height = value + "%";
    };
    var m_setWidth = function(value)
    {
        m_element.style.width = value + "%";
    };
    var m_getTop = function ()
    {
        return that.toPercentHeight(parseFloat(window.getComputedStyle(m_element).top));
    };
    var m_getHeight = function()
    {
        return that.toPercentHeight(parseFloat(window.getComputedStyle(m_element).height));
    };
    this.setLeft = function(value)
    {
        m_element.style.left = value + "%";
    };
    var m_snapHeightToGrid = function()
    {
        m_setHeight(m_getClosestCellY( m_getTop()+m_getHeight() ) - m_getTop());
        that.updateTextBox();
    };
    var m_snapWidthToGrid = function()
    {
        m_setWidth(m_getClosestCellX( that.getLeft()+ m_getWidth() ) - that.getLeft());
    };
    var m_getCellIndexX = function(value)
    {
        var diff = 101;
        var temp;
        var index = 0;

        for(var i = 0; i < m_gridX.length; i++)
        {
            temp = Math.abs(parseFloat(m_gridX[i] - value));

            if(temp < diff)
            {
                diff = temp;
                index = i;
            }
        }
        return index;
    };
    var m_getCellIndexY = function(value)
    {
        var diff = 101;
        var temp;
        var index = 0;

        for(var i = 0; i < m_gridY.length; i++)
        {
            temp = Math.abs(parseFloat(m_gridY[i] - value));

            if(temp < diff)
            {
                diff = temp;
                index = i;
            }
        }
        return index;
    };
    var m_getPreviousCellX = function(value)
    {
        var index = m_getCellIndexX(value);
        return m_gridX[index-1];
    };
    this.snapToGridX = function ()
    {
        var temp = m_getClosestCellX(that.getLeft() + that.toPercentWidth(1));
        if(temp >= 100)
        {
            that.setLeft(m_getPreviousCellX(temp));
        }
        else
        {
            that.setLeft(temp);
        }
        m_snapWidthToGrid();
    };
    this.snapToGridY = function ()
    {
        m_setTop(m_getClosestCellY(m_getTop()) + that.toPercentHeight(1));
        m_snapHeightToGrid();
    };
    this.getStartPos = function()
    {
        return this.toPercentHeight(parseFloat(window.getComputedStyle(m_element).top));
    };
    this.getEndPos = function()
    {
        return this.getStartPos() + this.toPercentHeight(parseFloat(window.getComputedStyle(m_element).height));
    };
    this.setElement = function(element)
    {
        m_element = element;
    };
    this.getElement = function()
    {
        return m_element;
    };
    this.setParentHeight = function(parentHeight)
    {
        m_parentHeight = parentHeight;
    };
    this.toPercentWidth = function(value)
    {
        var in_min = 0;
        var in_max =  m_parentWidth;
        var out_min = 0;
        var out_max = 100;

        return parseFloat((value - in_min)*(out_max - out_min)/(in_max - in_min) + out_min);
    };
    this.toPercentHeight = function(value)
    {
        var in_min = 0;
        var in_max =  m_parentHeight;
        var out_min = 0;
        var out_max = 100;

        return parseFloat((value - in_min)*(out_max - out_min)/(in_max - in_min) + out_min);
    };
    this.toPixelsWidth = function(value)
    {
        var in_min = 0;
        var in_max = 100;
        var out_min = 0;
        var out_max = m_parentWidth;

        return parseFloat((value - in_min)*(out_max - out_min)/(in_max - in_min) + out_min);
    };
    this.toPixelsHeight = function(value)
    {
        var in_min = 0;
        var in_max = 100;
        var out_min = 0;
        var out_max = m_parentHeight;

        return parseFloat((value - in_min)*(out_max - out_min)/(in_max - in_min) + out_min);
    };
    var m_move = function(e)
    {
        e.stopPropagation();
        e.preventDefault();

        that.enableMoving();

        var originalLeft = parseFloat(window.getComputedStyle(this).left);
        var originalTop =  parseFloat(window.getComputedStyle(this).top);

        var mouseDownX = that.toPercentWidth(e.clientX);
        var mouseDownY = that.toPercentHeight(e.pageY);

        var mdy2 = that.toPercentHeight(e.pageY - m_offsetTop);

        var stretchUpHeight = that.toPercentHeight(parseFloat(window.getComputedStyle(m_stretchUp).height));
        var stretchDownHeight = that.toPercentHeight(parseFloat(window.getComputedStyle(m_stretchDown).height));

        var selectState;

        if ((mdy2 >= m_getTop()) && (mdy2 <= (m_getTop() + stretchUpHeight)))
        {
            m_isStretchingUp = true;
            m_isStretchingDown = false;
        }
        else if(mdy2 >=  that.getEndPos() - stretchDownHeight)
        {
            m_isStretchingDown = true;
            m_isStretchingUp = false;
        }
        else
        {
            m_isStretchingUp = false;
            m_isStretchingDown = false;
        }

        var m_drag = function (e)
        {
            var newLeft = that.toPercentWidth(originalLeft + e.clientX) - mouseDownX;
            var newTop = that.toPercentHeight(originalTop + e.pageY) - mouseDownY;


            that.setLeft(newLeft);

            if( (newTop >= 0 && (newTop + m_getHeight()) <= 100) && (m_getClosestCellY(newTop) !== m_getClosestCellY(m_getTop())))
            {
                m_setTop(newTop);
                that.snapToGridY();
            }

            document.dispatchEvent(m_isMovingEvent);
            e.stopPropagation();
        };

        var m_drop = function (e)
        {
            that.snapToGridX();
            that.disableMoving();

            document.removeEventListener("mouseup", m_drop, true);
            document.removeEventListener("mousemove", m_drag,  true);
            e.stopPropagation();

            that.updateActivityTime();
        };

        var m_startStretchUp = function (e)
        {
            if(!m_isStretchingUp)
            {
                return;
            }
            var top = m_getTop();
            var diff = that.toPercentHeight(e.pageY - m_offsetTop) - top;
            var result = top + diff;
            var newHeight = that.getEndPos() - m_getClosestCellY(result);


            if(result < (that.getEndPos() - (100/m_gridSizeY)) && (m_getClosestCellY(result) !== m_getClosestCellY(top)))
            {
                m_setTop(result);
                m_setHeight(newHeight);
                that.snapToGridY();


                document.dispatchEvent(m_isMovingEvent);
            }
            e.stopPropagation();
        };

        var m_endStretchUp = function (e)
        {
            if(!m_isStretchingUp)
            {
                return;
            }
            that.snapToGridX();
            m_isStretchingUp = false;
            that.disableMoving();

            document.removeEventListener("mouseup", m_startStretchUp, true);
            document.removeEventListener("mousemove", m_endStretchUp,  true);

            e.stopPropagation();

            that.updateActivityTime();
        };

        var m_startStretchDown = function (e)
        {
            var top = m_getTop();
            var result = that.toPercentHeight(e.pageY - m_offsetTop) - top;
            var newEndPos = result + top;

            if( newEndPos > (top + (100/m_gridSizeY)) && (newEndPos) <= 100 && (m_getClosestCellY(newEndPos) !== m_getClosestCellY(that.getEndPos())))
            {
                m_setHeight(result);
                that.snapToGridY();
                document.dispatchEvent(m_isMovingEvent);
            }
            e.stopPropagation();
        };

        var m_endStretchDown = function (e)
        {
            that.snapToGridX();
            m_isStretchingDown = false;
            that.disableMoving();

            document.removeEventListener("mousemove", m_startStretchDown,  true);
            document.removeEventListener("mouseup", m_endStretchDown, true);
            e.stopPropagation();

            that.updateActivityTime();
        };


        if(m_isStretchingUp)
        {
            document.addEventListener("mousemove", m_startStretchUp, true);
            document.addEventListener("mouseup", m_endStretchUp, true);
        }
        else if(m_isStretchingDown)
        {
            document.addEventListener("mousemove", m_startStretchDown, true);
            document.addEventListener("mouseup", m_endStretchDown, true);
        }
        else
        {
            document.addEventListener("mousemove", m_drag, true);
            document.addEventListener("mouseup", m_drop, true);
        }
    };
    var m_clicked = function()
    {
        if(!this.isSelected)
        {
            m_element.classList.add('selected');
            this.isSelected = true;
        }
        else
        {
            m_element.classList.remove('selected');
            this.isSelected = false;
        }
    };
    var m_dblclick = function(e)
    {
        e.stopPropagation();
        e.preventDefault();

        if (m_aD.getIsOwner() === 1)
        {
            window.dispatchEvent(new CustomEvent('UpdateActivity', {'detail': m_aD}));
        }
        else
        {
            window.dispatchEvent(new CustomEvent('ViewActivity', {'detail': m_aD}));
        }
    };

    m_createGridY();
    m_createInner();
    m_createTextBox();
    m_createStretchables();
    this.transferActivityData();
    this.updateTextBox();
    this.snapToGridY();
    this.disableMoving();


    if(m_aD.getIsOwner() === 1)
    {
        m_element.addEventListener("mousedown",m_move,false);
    }

    m_element.addEventListener("dblclick", m_dblclick, false);
}
function Collision(index)
{
    "use strict";
    var m_collidingIndices = [];
    this.hasBeendAdded = false;

    var m_sortCollidingIndices = function ()
    {
        m_collidingIndices.sort(function (a, b)
        {
            return a - b;
        });
    };

    if(typeof index === "object")
    {
        for(var i = 0; i < index.length; i++)
        {
            m_collidingIndices.push(index[i]);
        }
        m_sortCollidingIndices();
    }
    else
    {
        m_collidingIndices.push(index);
    }
    this.getFirstCI = function()
    {
        if(m_collidingIndices > 0)
        {
            return m_collidingIndices[0];
        }
        else
        {
            return "CI is empty";
        }

    };
    this.addCollindingIndex = function (index)
    {
        if(m_hasIndex(index) === false)
        {
            m_collidingIndices.push(index);
            m_sortCollidingIndices();
        }
    };
    this.getCollidingIndices = function ()
    {
        return m_collidingIndices;
    };
    this.addOther = function(other)
    {
        for (var i = 0; i < other.getCollidingIndices().length; i++)
        {
            var found = false;

            for (var j = 0; j < m_collidingIndices.length; j++)
            {
                if (other.getCollidingIndices()[i] === m_collidingIndices[j])
                {
                    found = true;
                    break;
                }
            }

            if (found === false)
            {
                m_collidingIndices.push(other.getCollidingIndices()[i]);
            }
        }
        m_sortCollidingIndices();
    };
    this.shareCommonIndex = function (other)
    {
        var found = false;

        for (var i = 0; i < other.getCollidingIndices().length; i++)
        {
            for (var j = 0; j < m_collidingIndices.length; j++)
            {
                if (other.getCollidingIndices()[i] === m_collidingIndices[j])
                {
                    found = true;
                    break;
                }
            }
            if (found === true)
            {
                break;
            }
        }
        return found;
    };
    var m_hasIndex = function(index)
    {
        for(var i = 0; i < m_collidingIndices.length; i++)
        {
            if(m_collidingIndices[i] === index)
            {
                return true;
            }
        }
        return false;
    };
    var m_getIndexOf = function(value)
    {
        var index;

        for(var i = 0; i < m_collidingIndices.length; i++)
        {
            if(m_collidingIndices[i] === value)
            {
                index = i;
                break;
            }
        }
        return index;
    };
    this.getString = function ()
    {
        var str = "[";
        for(var i = 0; i < m_collidingIndices.length; i++)
        {
            if(i > 0)
            {
                str +=",";
            }
            str += m_collidingIndices[i].toString();
        }
        str += "]";
        return str;
    };
    this.clearCollision = function()
    {
        var length = m_collidingIndices.length;
        for(var i = 0; i < length; i++)
        {
            m_collidingIndices.pop();
        }
    };
    this.addCollindingIndexWithoutSort = function(index)
    {
        if(m_hasIndex(index) === false)
        {
            m_collidingIndices.push(index);
        }
    };
    this.removeCollidingIndex = function(index)
    {
        if(!m_hasIndex(index))
        {
            return;
        }

        var foundIndex;

        var indexOf = m_getIndexOf(index);

        for(var j = indexOf; j < m_collidingIndices.length-1; j++)
        {
            m_collidingIndices[j] = m_collidingIndices[j+1];
        }
        m_collidingIndices.pop();
    };

    this.insertBefore = function(index, value)
    {
        if(!m_hasIndex(value))
        {
            return;
        }

        var indexOf = m_getIndexOf(value);

        m_collidingIndices.push(-2);

        for(var i = m_collidingIndices.length-1; i > indexOf; i--)
        {
            m_collidingIndices[i] = m_collidingIndices[i-1];
        }

        m_collidingIndices[indexOf] = index;
    };
    this.insertAfter = function (index, value)
    {
        if(!m_hasIndex(value))
        {
            return;
        }
        var indexOf = m_getIndexOf(value);

        m_collidingIndices.push(-2);

        for(var i = m_collidingIndices.length-1; i > indexOf; i--)
        {
            m_collidingIndices[i] = m_collidingIndices[i-1];
        }

        m_collidingIndices[indexOf+1] = index;
    };
}
function Column(element, gridSizeY)
{
    "use strict";
    var m_element = element;
    var m_gridSizeY = gridSizeY;
    var m_dataItems = [];
    var m_items = [];
    var m_width = 0;
    var m_height = 0;
    var m_isMovingEvent;
    var m_collisions;
    var that = this;
    var m_itemIsMoving = false;
    var m_movingItemIndex = null;
    var m_prev = null;
    var m_next = null;
    var m_date;
    var m_gridY = [];

    var m_getCellIndexY = function(value)
    {
        var diff = 101;
        var temp;
        var index = 0;

        for(var i = 0; i < m_gridY.length; i++)
        {
            temp = Math.abs(parseFloat(m_gridY[i] - value));

            if(temp < diff)
            {
                diff = temp;
                index = i;
            }
        }
        return index;
    };
    this.toPercentHeight = function(value)
    {
        var in_min = 0;
        var in_max =  m_height;
        var out_min = 0;
        var out_max = 100;

        return parseFloat((value - in_min)*(out_max - out_min)/(in_max - in_min) + out_min);
    };
    var m_getClosestCellY = function(value)
    {
        var diff = 101;
        var temp;
        var index = 0;
        for(var i = 0; i < m_gridY.length; i++)
        {
            temp = Math.abs(parseFloat(m_gridY[i] - value));

            if(temp < diff)
            {
                diff = temp;
                index = i;
            }
        }
        if(index >= 1)
        {
            index--;
        }
        return m_gridY[index];
    };

    var m_createGridY = function()
    {
        for(var i = 0; i <= m_gridSizeY; i++)
        {
            m_gridY.push(parseFloat(i * (100 / m_gridSizeY)));
        }
    };
    this.clearActivities = function ()
    {
        for(var i = m_items.length-1; i >= 0; i--)
        {
            m_element.removeChild(m_items[i].getElement());
            m_items.pop();
            m_dataItems.pop();
        }
        m_items = [];
        m_dataItems = [];
    };
    this.getDate = function()
    {
        return m_date;
    };
    this.updateActivity = function(aD)
    {
        var index = m_getIndexofDataItemById(aD.getId());

        m_dataItems[index] = aD;

        m_items[that.getIndexOfCorrenspondingItem(aD.getId())].setActivityData(aD);
    };
    this.hasId = function (id)
    {
        for(var i = 0; i < m_dataItems.length; i++)
        {
            if(id === m_dataItems[i].getId())
            {
                return true;
            }
        }
        return false;
    };
    var m_getIndexofDataItemById = function (id)
    {
        for(var i = 0; i < m_dataItems.length; i++)
        {
            if(id === m_dataItems[i].getId())
            {
                return i;
            }
        }
        return null;
    };
    this.removeActivityById = function (id)
    {
        that.removeItemByIndex(that.getIndexOfCorrenspondingItem(id));
        that.removeDataItemByIndex(m_getIndexofDataItemById(id));

        m_movingItemIndex = null;
        that.manageCollisions();
    };
    this.setDate = function(date)
    {
        m_date = date;
    };
    this.addItemFromOther = function (obj)
    {
        m_element.appendChild(obj.getElement());
        obj.setIsMovingEvent(m_isMovingEvent);

        m_items.push(obj);

        obj.disableMoving();
        m_movingItemIndex = null;

        obj.transferActivityData();

        that.manageCollisions();
    };
    this.addDataItemFromOther = function (obj)
    {
        obj.setDate(m_date);
        m_dataItems.push(obj);

        window.dispatchEvent(new CustomEvent('ActivityDrop', {'detail': obj}));
    };
    this.removeItemByIndex = function(index)
    {
        if (index < 0 || index >= m_items.length)
        {
            return;
        }

        m_element.removeChild(m_items[index].getElement());

        for(var i = index; i < m_items.length; i++)
        {
            m_items[i] =  m_items[i+1];
        }

        m_items.pop();
    };
    this.removeDataItemByIndex = function(index)
    {
        if (index < 0 || index >= m_dataItems.length)
        {
            return;
        }
        for(var i = index; i < m_dataItems.length; i++)
        {
            m_dataItems[i] =  m_dataItems[i+1];
        }
        m_dataItems.pop();
    };
    var m_sendItemToPrev = function (index)
    {
        if(typeof m_prev === "undefined")
        {
            return "Prev is null!";
        }
        var temp = m_items[index];

        var dataItemIndex = m_findIndexOfCorrenspondingDataItem(m_items[index]);

        m_prev.addDataItemFromOther(m_dataItems[dataItemIndex]);

        that.removeItemByIndex(index);

        m_prev.addItemFromOther(temp);
        that.removeDataItemByIndex(dataItemIndex);

        m_movingItemIndex = null;

        that.manageCollisions();
    };
    var m_sendItemToNext = function (index)
    {
        if(typeof m_next === "undefined")
        {
            return "Next is null!";

        }
        var temp = m_items[index];

        var dataItemIndex = m_findIndexOfCorrenspondingDataItem(m_items[index]);

        m_next.addDataItemFromOther(m_dataItems[dataItemIndex]);

        that.removeItemByIndex(index);
        m_next.addItemFromOther(temp);
        that.removeDataItemByIndex(dataItemIndex);

        m_movingItemIndex = null;

        that.manageCollisions();
    };
    this.sendActivityToOther = function(index, obj)
    {
        if(typeof m_next === "undefined")
        {
            return "Next is null!";

        }
        var temp = m_items[index];

        var dataItemIndex = m_findIndexOfCorrenspondingDataItem(m_items[index]);

        obj.addDataItemFromOther(m_dataItems[dataItemIndex]);

        that.removeItemByIndex(index);
        obj.addItemFromOther(temp);
        that.removeDataItemByIndex(dataItemIndex);

        m_movingItemIndex = null;
    };
    this.getIndexOfCorrenspondingItem = function(id)
    {
        for(var i = 0; i < m_items.length; i++)
        {
            if(id === m_items[i].getDataId())
            {
                return i;
            }
        }

        return null;
    };
    var m_findIndexOfCorrenspondingDataItem = function(obj)
    {
        var id = obj.getDataId();

        for(var i = 0; i < m_dataItems.length; i++)
        {
            if(id === m_dataItems[i].getId())
            {
                return i;
            }
        }
        return null;
    };
    this.setPrev = function(obj)
    {
        m_prev = obj;
    };
    this.setNext = function(obj)
    {
        m_next = obj;
    };
    this.getPrev = function()
    {
        if(m_prev === null)
        {
            return "Prev is null!";
        }
        else
        {
            return m_prev;
        }
    };
    this.getNext = function()
    {
        if(m_next === null)
        {
            return "Next is null!";
        }
        else
        {
            return m_next;
        }
    };
    this.removePrev = function()
    {
        m_prev = null;
    };
    this.removeNext = function()
    {
        m_next = null;
    };
    var consolidateCollisions = function(arr)
    {
        var consolidatedCollisions = [];

        for(var i = 0; i < arr.length; i++)
        {
            if(arr[i].hasBeendAdded === false)
            {
                var collision = new Collision(arr[i].getCollidingIndices());
                arr[i].hasBeendAdded = true;

                for(var j = 0; j < arr.length; j++)
                {
                    if(collision.shareCommonIndex(arr[j]) === true && arr[j].hasBeendAdded === false)
                    {
                        collision.addOther(arr[j]);
                        arr[j].hasBeendAdded = true;
                    }
                }
                consolidatedCollisions.push(collision);
            }
        }
        return consolidatedCollisions;
    };
    var findCollisions = function()
    {
        if(typeof m_items === "undefined")
        {
            return;
        }

        var collisions = [];
        var collision;

        for (var i = 0; i < m_items.length; i++)
        {
            collision = new Collision(i);

            for (var j = 0; j < m_items.length; j++)
            {
                if ((m_items[i].getStartPos() <= m_items[j].getEndPos() && m_items[i].getStartPos() >= m_items[j].getStartPos()) ||
                    (m_items[i].getEndPos() <= m_items[j].getEndPos() && m_items[i].getEndPos() >= m_items[j].getStartPos()))
                {
                    collision.addCollindingIndex(j);
                }
            }
            var found = false;

            if (typeof collisions !== "undefined")
            {
                for (var k = 0; k < collisions.length; k++)
                {
                    if (collisions[k].getString() === collision.getString())
                    {
                        found = true;
                        break;
                    }
                }
            }
            if (found === false)
            {
                collisions.push(collision);
            }
        }
        m_collisions = consolidateCollisions(collisions);
    };
    var m_formatItems = function(excludedIndex)
    {
        for(var i = 0; i < m_collisions.length; i++)
        {
            var temp = m_collisions[i].getCollidingIndices();

            for(var j = 0; j < temp.length; j++)
            {
                m_items[temp[j]].setGridSizeX(temp.length);
                m_items[temp[j]].getElement().style.width = (100/temp.length) + "%";
                if(excludedIndex !== temp[j])
                {
                    m_items[temp[j]].getElement().style.left = j * (100/temp.length) + "%";
                }
            }
        }
    };
    var splitCollisions = function()
    {
        var splitCollisions = [];
        var tempCI = [];
        var tempC;
        for(var i = 0; i < m_collisions.length; i++)
        {
            tempCI = m_collisions[i].getCollidingIndices();
            if(tempCI.length > 1)
            {
                for(var j = 0; j < tempCI.length; j++)
                {
                    tempC = new Collision(tempCI[j]);

                    for(var k = 0; k < tempCI.length; k++)
                    {
                        if ((m_items[tempCI[j]].getStartPos() <= m_items[tempCI[k]].getEndPos() && m_items[tempCI[j]].getStartPos() >= m_items[tempCI[k]].getStartPos()) ||
                            (m_items[tempCI[j]].getEndPos() <= m_items[tempCI[k]].getEndPos() && m_items[tempCI[j]].getEndPos() >= m_items[tempCI[k]].getStartPos()))
                        {
                            tempC.addCollindingIndex(tempCI[k]);
                        }
                    }
                    splitCollisions.push(tempC);
                }
            }
            else
            {
                splitCollisions.unshift(m_collisions[i]);
            }
        }
    };
    this.manageCollisions = function()
    {
        m_items.sort(function(a,b)
        {
            if(a.getLeft() === b.getLeft())
            {
                return 0;
            }
            else if(a.getLeft() < b.getLeft())
            {
                return -1;
            }
            else
            {
                return 1;
            }
        });

        for(var i = 0; i < m_items.length; i++)
        {
            if(m_items[i].isMoving)
            {
                m_movingItemIndex = i;
                break;
            }
        }

        if(m_movingItemIndex !== null)
        {
            if(!m_items[m_movingItemIndex].isStreching())
            {
                m_element.style.overflow = "visible";
                if(m_items[m_movingItemIndex].getLeft() + m_items[m_movingItemIndex].getWidth()/2 >= 100)
                {
                    if(m_next === null)
                    {
                        m_items[m_movingItemIndex].snapToGridX();
                    }
                    else
                    {
                        m_sendItemToNext(m_movingItemIndex);
                    }
                }
                else if(m_items[m_movingItemIndex].getLeft() <= -(m_items[m_movingItemIndex].getWidth()/2))
                {
                    if(m_prev === null)
                    {
                        m_items[m_movingItemIndex].snapToGridX();
                    }
                    else
                    {
                        m_sendItemToPrev(m_movingItemIndex);
                    }
                }
            }
            else
            {
                m_element.style.overflow = "hidden";

            }

        }

        findCollisions();

        if(m_movingItemIndex !== null )
        {
            var colIndexOfMoving;

            for(var j = 0; j < m_collisions.length; j++)
            {
                for(var k = 0; k < m_collisions[j].getCollidingIndices().length; k++)
                {
                    if((m_collisions[j].getCollidingIndices()[k] === m_movingItemIndex))
                    {
                        colIndexOfMoving = j;
                        break;
                    }
                }
            }
            var temp;
            var isSwitch = false;

            var tempC = m_collisions[colIndexOfMoving];

            tempC.removeCollidingIndex(m_movingItemIndex);

            for(var l = 0; l < tempC.getCollidingIndices().length; l++)
            {
                temp = tempC.getCollidingIndices()[l];

                if (m_items[m_movingItemIndex].getLeft() + m_items[m_movingItemIndex].getWidth() >= m_items[temp].getLeft() + (m_items[temp].getWidth() / 2) && m_items[m_movingItemIndex].getLeft() <= m_items[temp].getLeft())
                {
                    tempC.insertAfter(m_movingItemIndex, temp);
                    m_movingItemIndex = null;

                    isSwitch = true;
                    break;
                }
                else if (m_items[m_movingItemIndex].getLeft() <= m_items[temp].getLeft() + (m_items[temp].getWidth() / 2) &&
                    m_items[m_movingItemIndex].getLeft() + m_items[m_movingItemIndex].getWidth() >= (m_items[temp].getLeft() + (m_items[temp].getWidth())))
                {
                    tempC.insertBefore(m_movingItemIndex, temp);
                    m_movingItemIndex = null;

                    isSwitch = true;
                    break;
                }
            }
            if( isSwitch)
            {
                m_collisions[colIndexOfMoving] = tempC;
            }
            else
            {
                m_collisions[colIndexOfMoving].addCollindingIndex(m_movingItemIndex);
            }
        }

        m_formatItems(m_movingItemIndex);
    };
    var m_onIsMoving = function (e)
    {
        if(e.receiver !== m_element.getAttribute("id"))
        {
            return;
        }

        that.manageCollisions();
    };
    this.updateWidth = function()
    {
        m_width = parseFloat(window.getComputedStyle(m_element).width);
    };
    this.updateHeight = function()
    {
        m_height = parseFloat(window.getComputedStyle(m_element).height);
    };
    this.getElement = function()
    {
        return m_element;
    };
    this.setElement = function (element)
    {
        m_element = element;
    };
    this.getItems = function()
    {
        return m_items;
    };
    var m_createCells = function()
    {
        for(var i = 0; i < m_gridSizeY; i++)
        {
            var cell = document.createElement("div");
            cell.classList.add("cell");

            cell.style.height = m_height/m_gridSizeY + "px";

            m_element.appendChild(cell);
        }
    };
    this.addActivity = function(aD)
    {
        m_dataItems.push(aD);

        var box = document.createElement("DIV");
        box.classList.add("draggable");
        box.classList.add("activity");

        m_element.appendChild(box);


        m_items.push(new Draggable(box, aD, m_width, m_height, m_isMovingEvent,m_gridSizeY));
        that.manageCollisions();
    };

    m_isMovingEvent = new Event("isMoving");
    m_isMovingEvent.receiver = m_element.getAttribute("id");
    document.addEventListener("isMoving", m_onIsMoving, false);

    this.updateWidth();
    this.updateHeight();
    m_createCells();
    m_createGridY();

    this.getTimeOfMouse = function(pageY)
    {
        var offsetTop = document.getElementById('plannerMain').offsetTop;
        var mouseY = pageY - offsetTop;
        var c = new Converter();
        return c.percentToTime(m_getCellIndexY(m_getClosestCellY(that.toPercentHeight(mouseY))),24,m_gridSizeY);
    };

    var m_dblclick = function(e)
    {
        var start = that.getTimeOfMouse(e.pageY);
        var aD = new ActivityData("null", "null", "null", m_date, start, start, 1);
        window.dispatchEvent(new CustomEvent('CreateActivity', {'detail': aD}));
    };
    m_element.addEventListener("dblclick", m_dblclick, false);
}
function ActivityData(id, title, description, date, start, end, isOwner, invitedArr)
{
    "use strict";
    var m_id = id;
    var m_title = title;
    var m_description = description;
    var m_date = date;
    var m_start = start;
    var m_end = end;
    var m_isOwner = parseInt(isOwner);
    if(typeof invitedArr === "undefined") {
        invitedArr = [];
    }
    var m_invited = invitedArr;
    var that = this;

    this.getId = function()
    {
        return m_id;
    };

    this.getInvited = function()
    {
        return m_invited;
    };

    this.getTitle = function()
    {
        return m_title;
    };
    this.getDescription = function()
    {
        return m_description;
    };
    this.getStart = function ()
    {
        return m_start;
    };
    this.getDate = function()
    {
        return m_date;
    };
    this.getEnd = function ()
    {
        return m_end;
    };
    this.setDate = function (date)
    {
        m_date = date;
    };
    this.setStart = function(str)
    {
        m_start = str;
    };
    this.setEnd = function(str)
    {
        m_end = str;
    };
    this.getString = function()
    {
        var str ="";
        str += '"id":'+'"' + m_id + '",';
        str += '"title":"' + m_title + '",';
        str += '"description":"' + m_description + '",';
        str += '"date":"' + m_date + '",';
        str += '"start":"' + m_start + '",';
        str += '"end":"' + m_end + '"';
        str += '"isOwner":"' + m_isOwner + '"';
        str += '"invited":"';
        str += m_invited.toString();
        str += '"';

        return str;
    };
    this.getAjaxFormat = function()
    {
        var activity = {};
        activity.id = that.getId();
        activity.title = that.getTitle();
        activity.description = that.getDescription();
        activity.date = that.getDate();
        activity.activity_start = that.getDate() + ' ' + that.getStart();
        activity.activity_end = that.getDate() + ' ' + that.getEnd();
        activity.isOwner = that.getIsOwner();
        activity.invited_str = "";
        if(that.getInvited().length > 0) {
            activity.invited_str = that.getInvited().toString();
        }

        return activity;
    };
    this.updateTime = function(start, end)
    {
        m_start = start;
        m_end = end;
        window.dispatchEvent(new CustomEvent('ActivityDrop', {'detail': that}));
    };
    this.getIsOwner = function()
    {
        return m_isOwner;
    };
}
function Week(element, gridSizeY)
{
    "use strict";
    var m_element = element;
    var m_days = [];
    var m_dates = [];
    var m_gridSizeY = gridSizeY;
    var m_borderSize;
    var that = this;

    this.clearActivities = function()
    {
        for(var i = 0; i < m_days.length; i++)
        {
            m_days[i].clearActivities();
        }
    };
    this.getIndexOfDate = function(date)
    {
        for(var i = 0; i < m_dates.length; i++)
        {
            if(date === m_dates[i])
            {
                return i;
            }
        }
        return -1;
    };
    this.updateActivity = function(aD)
    {
        var index = -1;
        for(var i = 0; i < m_days.length; i++)
        {
            if(m_days[i].hasId(aD.getId()))
            {
                index = i;
                break;
            }
        }
        if(index !== -1)
        {
            if(aD.getDate() === m_days[index].getDate())
            {
                m_days[index].updateActivity(aD);
            }
            else if(that.getIndexOfDate(aD.getDate()) !== -1)
            {
                var temp = m_days[index].getIndexOfCorrenspondingItem(aD.getId());

                m_days[index].updateActivity(aD);
                m_days[index].sendActivityToOther(temp, m_days[that.getIndexOfDate(aD.getDate())]);
            }
            else
            {
                m_days[index].removeActivityById(aD.getId());
            }
        }
    };
    this.setDates = function(arr)
    {
        if(m_days.length > 0)
        {
            that.clearActivities();
        }
        else
        {
            m_createDays();
        }
        m_dates = arr;

        for(var i = 0; i < 7; i++)
        {
            m_days[i].setDate(m_dates[i]);
        }
    };
    this.addActivity = function(aD)
    {
        var index = -1;
        for(var i = 0; i < m_dates.length; i++)
        {
            if(aD.getDate() === m_dates[i])
            {
                index = i;
                break;
            }
        }
        if(index !== -1)
        {
            m_days[index].addActivity(aD);
        }
    };
    this.addActivities = function(aDs)
    {
        for(var i = 0; i < aDs.length; i++)
        {
            this.addActivity(aDs[i]);
        }
    };
    var m_createDays = function ()
    {
        for(var i = 0; i < 7; i++)
        {
            var day = document.createElement("DIV");
            day.classList.add("weekday");

            m_element.appendChild(day);

            m_days.push(new Column(day, m_gridSizeY));
        }
        for(var j = 0; j < 7; j++)
        {
            if(i !== 0)
            {
                m_days[j].setPrev(m_days[j-1]);


            }
            if(i !== 6)
            {
                m_days[j].setNext(m_days[j+1]);
            }
        }
    };
    this.removeActivityById = function(id)
    {
        for(var i = 0; i < m_days.length; i++)
        {
            if(m_days[i].hasId(id))
            {
                m_days[i].removeActivityById(id);
                break;
            }
        }
    };
}