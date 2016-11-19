if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

function Notification() {

    var ajax = new Ajax();
    var that = this;
    var ajaxResults;
    var notificationCount = 0;
    var clickElement = document.getElementById("userNotifier");
    var bell = document.getElementById("notificationBell");
    var dropdownElement = document.getElementById("notificationList");
    var hasNotifications = false;
    var notifications = [];
    
    if (typeof(clickElement) != 'undefined' && clickElement != null && typeof(bell) != 'undefined' && bell != null && typeof(dropdownElement) != 'undefined' && dropdownElement != null) {
    dropdownElement.addEventListener("click", function(e) {
        e.stopPropagation();
        
        var item;
        if(e.target.nodeName === "I") {
            item = e.target.parentNode;
        } else {
            item = e.target;
        }
        
        if(typeof item != null && typeof item.dataset.index != 'undefined') {
            ajax.answerNotification(notifications[item.dataset.index], item.dataset.action, 'AnswerNotification');
            
            notifications[item.dataset.index].hide;
            item.parentNode.parentNode.classList.add("hidden");
            
            notificationCount--;
            document.getElementById("notificationCount").innerHTML = notificationCount;

            if( (item.dataset.action === "accept" && item.dataset.type === "3") || item.dataset.type === "4") {
                window.dispatchEvent(new CustomEvent("NotificationUpdate"));
            }
        }
        
    });
    
    clickElement.addEventListener("click", function() {
        hasNotifications = false;
        updateNotificationBell();
        ajax.setNotificationsToRead();
        if(dropdownElement.classList.contains("hidden")) {
            dropdownElement.classList.remove("hidden");
        } else {
            dropdownElement.classList.add("hidden");
        }

    });
    
    var fetchNotificationExists = function() {
        window.addEventListener('CheckNotificationsAjax', checkNotificationsAjax);
        ajax.fetchCountNotifications('CheckNotificationsAjax');
    }
    
    var fetchNotification = function() {
        window.addEventListener('FetchNotificationsAjax', fetchNotificationsAjax);
        ajax.fetchNotifications('FetchNotificationsAjax');
    }
    
    var checkNotificationsAjax = function() {
        window.removeEventListener('CheckNotificationsAjax', checkNotificationsAjax);
        ajaxResults = ajax.fetch();
        var prevState = hasNotifications;
        if(ajaxResults.count>0) {
            hasNotifications = true;
        } else {
            hasNotifications = false;
        }
        
        if(prevState != hasNotifications) {
            updateNotificationBell();
        }
        

        window.setTimeout(function(){ fetchNotificationExists(); }, 5*1000); 

        fetchNotification(); 
    }
    
    var fetchNotificationsAjax = function() {
        window.removeEventListener('FetchNotificationsAjax', fetchNotificationsAjax);
        ajaxResults = ajax.fetch();
        dropdownElement.innerHTML = "";
        notifications = [];
        notificationCount = ajaxResults.length;
        dropdownElement.innerHTML += "<div class=\"notification-header\">Notifications (<span id=\"notificationCount\">"+ajaxResults.length+"</span>)</div>";
        for(var i = 0; i < ajaxResults.length; i++) {
            var newItem = new NotificationsItem(ajaxResults[i], i)
            notifications.push(newItem);
            dropdownElement.innerHTML += newItem.draw();
        }
        dropdownElement.innerHTML += "<div class=\"notification-footer\"></div>";
    }
    
    var updateNotificationBell = function() {
        if(hasNotifications === true) {
            bell.setAttribute("style", "color: #ffa500");
        } else {
            bell.setAttribute("style", "color: #cccccc"); 
        }
    }
    
    fetchNotificationExists();
    }
};

var NotificationsItem = function(obj, index) {
        
    var m_index = index;
    var m_id = obj.id;
    var m_type = obj.type;
    var m_initiatorName = obj.initiator_name;
    var m_activityName = "";
    var m_activityId = "";
    var m_notificationText = obj.content;
    var m_notificationType = obj.category;
    var m_show = true;
    
    if(m_type === "3" || m_type === "4" || m_type === "5") {
        m_activityName = obj.activity_name;
        m_activityId = obj.activity_id;
    }
    
    var that = this;
    
    this.draw = function() {
        
        if(!m_show) {
            return;
        }
        
        var htmlElement = "<div class=\"fs-xs notification-item\">";
        
        if(m_notificationType === "question") {
            if(m_type === "1") {
                htmlElement += "<div class=\"description\">" + m_notificationText.format(m_initiatorName) + "</div>";
            } else {
                htmlElement += "<div class=\"description\">" + m_notificationText.format(m_initiatorName, m_activityName) + "</div>";
            }
            htmlElement += "<div class=\"notification-action\"><div class=\"action\" data-id=\"notification-decline\" data-action=\"decline\" data-index=\"" + m_index + "\" data-type=\"" + m_type + "\" data-notification=\"" + m_id + "\"><i class=\"fa fa-times decline\" aria-hidden=\"true\"></i></div>";
            htmlElement += "<div class=\"action\" data-id=\"notification-confirm\" data-action=\"accept\" data-index=\"" + m_index + "\" data-type=\"" + m_type + "\" data-notification=\"" + m_id + "\"><i class=\"fa fa-check accept\" aria-hidden=\"true\"></i></div></div>";
        
        } else
        {
            if(m_type === "2") {
                htmlElement += "<div class=\"description\">" + m_notificationText.format(m_initiatorName) + "</div>";
            } else if(m_type === "5") {
                htmlElement += "<div class=\"description\">" + m_notificationText.format(m_initiatorName) + "</div>";
            } else {
                htmlElement += "<div class=\"description\">" + m_notificationText.format(m_activityName) + "</div>";
            }
            htmlElement += "<div class=\"notification-action\">";
            htmlElement += "<div class=\"action\" data-id=\"notification-decline\" data-action=\"accept\" data-type=\"" + m_type + "\" data-index=\""+m_index+"\" data-notification=\"" + m_id + "\"><i class=\"fa fa-check accept\" aria-hidden=\"true\"></i></div></div>";
        }
        
        htmlElement += "</div>";
        return htmlElement;
    }
    
    this.getNotificationId = function() {
        return m_id;
    }
    
    this.hide = function() {
        m_show = false;
    }
    
}
