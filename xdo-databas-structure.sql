SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;


DELIMITER $$
CREATE DEFINER=`root`@`localhost` PROCEDURE `createActivity` (IN `NAME` VARCHAR(200) CHARSET utf8, IN `DESCRIPTION` VARCHAR(1000) CHARSET utf8, IN `ACT_START` DATETIME, IN `ACT_END` DATETIME, IN `OWNER_ID` INT)  NO SQL
INSERT INTO activities(name, description, activity_start, activity_end, owner_id)
VALUES(NAME, DESCRIPTION, ACT_START, ACT_END, OWNER_ID)$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `createUserFriend` (IN `user` INT, IN `friend` INT)  NO SQL
BEGIN
INSERT INTO friends(user_id, friend_id) VALUES (user, friend);
INSERT INTO notifications (type, initiator, receiver) VALUES ('1', user, friend);
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteActivity` (IN `ACT_ID` INT, IN `OWNER_ID` INT)  NO SQL
DELETE FROM activities
WHERE id=ACT_ID AND owner_id=OWNER_ID$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `deleteInactiveUsers` ()  NO SQL
    DETERMINISTIC
DELETE FROM users WHERE users.activated='0'$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `fetchActivitiesByDate` (IN `SELF_ID` INT, IN `STARTDATE` DATE, IN `ENDDATE` DATE)  NO SQL
    DETERMINISTIC
SELECT act.id, act.name  as title, act.description, DATE_FORMAT(act.activity_start, '%Y-%m-%d') as date, DATE_FORMAT(act.activity_start, '%k:%i') as timestart, DATE_FORMAT(act.activity_end, '%k:%i') as timeend, IF(act.owner_id=SELF_ID, '1','0') as owner,
inv.invited as invited
FROM 
	(SELECT *
	FROM activities
	WHERE owner_id = SELF_ID
	UNION
	SELECT activities.* 
	FROM user_activity
	JOIN activities ON activities.id = activity_id
	WHERE user_id = SELF_ID
    AND accepted = '1') AS act
LEFT JOIN 
	(SELECT GROUP_CONCAT(user_activity.user_id) as invited, activity_id
	FROM user_activity 
	GROUP BY activity_id) 
    AS inv
    ON inv.activity_id = act.id 
WHERE DATE(act.activity_start) >= STARTDATE 
AND DATE(act.activity_end) <= ENDDATE
ORDER BY act.activity_start ASC$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `fetchFriendsByName` (IN `SEARCHTERM` VARCHAR(50), IN `SELFID` INT)  NO SQL
    DETERMINISTIC
SELECT DISTINCT users.id, CONCAT(users.firstname, " ", users.lastname) AS name, users.avatar
FROM users 
JOIN (SELECT * FROM friends WHERE status = 'accepted') AS friends ON friends.user_id = users.id OR friends.friend_id = users.id
WHERE (users.firstname COLLATE UTF8_GENERAL_CI LIKE CONCAT("%",SEARCHTERM,"%") OR users.lastname COLLATE UTF8_GENERAL_CI LIKE CONCAT("%",SEARCHTERM,"%")) AND (friends.user_id = SELFID OR friends.friend_id = SELFID) AND users.id != SELFID$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `fetchInvitedUsersByActivityId` (IN `ACTIVITY_ID` INT)  NO SQL
SELECT users.id, CONCAT(users.firstname, " ", users.lastname) as name, users.avatar 
FROM user_activity as ua
JOIN users AS users ON ua.user_id = users.id
WHERE ua.activity_id=ACTIVITY_ID$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `fetchNotifications` (IN `USER_ID` INT UNSIGNED)  NO SQL
    DETERMINISTIC
SELECT notifications.*, 
		activities.name as activity_name, 
        NA.activity_id,
		CONCAT(users.firstname, " ", users.lastname) as initiator_name,
        NT.content, NT.category
FROM notifications AS notifications
LEFT JOIN notification_activity AS NA ON notifications.id = NA.notification_id
LEFT JOIN activities AS activities ON activities.id = NA.activity_id
LEFT JOIN users AS users ON notifications.initiator = users.id
LEFT JOIN notificationTypes AS NT ON notifications.type = NT.id
WHERE notifications.receiver = USER_ID$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `fetchRandomFriends` (IN `SELF_ID` INT, IN `LIMIT_AMOUNT` INT)  NO SQL
SELECT DISTINCT users.id, CONCAT(users.firstname, " ", users.lastname) AS name, users.avatar
FROM users 
JOIN (SELECT * FROM friends WHERE status = 'accepted') AS friends ON friends.user_id = users.id OR friends.friend_id = users.id
WHERE (friends.user_id = SELF_ID OR friends.friend_id = SELF_ID) AND users.id != SELF_ID
ORDER BY RAND()
LIMIT LIMIT_AMOUNT$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `fetchUsersFriends` (IN `USER_ID` INT)  NO SQL
SELECT DISTINCT users.id, CONCAT(users.firstname, " ", users.lastname) AS name, users.avatar
FROM users 
JOIN (SELECT * FROM friends WHERE status = 'accepted') AS friends ON friends.user_id = users.id OR friends.friend_id = users.id
WHERE (friends.user_id = USER_ID OR friends.friend_id = USER_ID) AND users.id != USER_ID$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `updateActivity` (IN `NAME` VARCHAR(200), IN `DESCRIPTION` VARCHAR(1000), IN `ACT_START` DATETIME, IN `ACT_END` DATETIME, IN `ACT_ID` INT, IN `USER_ID` INT)  NO SQL
    DETERMINISTIC
UPDATE activities
SET name=NAME,
description=DESCRIPTION,
activity_start=ACT_START,
activity_end=ACT_END
WHERE id=ACT_ID AND owner_id=USER_ID$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `updateActivityInvitedUser` (IN `ACT_ID` INT, IN `FRIEND_ID` INT, IN `USER_ID` INT)  NO SQL
    COMMENT 'REWRITE WHEN THE TIME IS RIGHT!'
BEGIN
	DECLARE isFriends INT;
    
    SELECT COUNT(user_id) 
    INTO isFriends 
    FROM friends 
    WHERE (user_id = FRIEND_ID AND friend_id = USER_ID) 
    OR (user_id = USER_ID AND friend_id = FRIEND_ID);
    
    IF isFriends > 0 THEN
    	INSERT INTO user_activity VALUES(FRIEND_ID,ACT_ID);
    END IF;
    
END$$

DELIMITER ;

CREATE TABLE `activities` (
  `id` int(11) NOT NULL,
  `name` varchar(200) COLLATE utf8_bin NOT NULL,
  `description` varchar(1000) COLLATE utf8_bin NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activity_start` datetime NOT NULL,
  `activity_end` datetime NOT NULL,
  `owner_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE `friends` (
  `user_id` int(11) NOT NULL,
  `friend_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('accepted','declined') COLLATE utf8_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` int(11) NOT NULL,
  `initiator` int(11) DEFAULT NULL,
  `receiver` int(11) NOT NULL,
  `isread` enum('0','1') COLLATE utf8_bin DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE `notificationTypes` (
  `id` int(11) NOT NULL,
  `title` varchar(30) COLLATE utf8_bin NOT NULL,
  `content` varchar(100) COLLATE utf8_bin NOT NULL,
  `category` enum('question','statement') COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE `notification_activity` (
  `notification_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(250) COLLATE utf8_bin NOT NULL,
  `password` varchar(255) COLLATE utf8_bin NOT NULL,
  `firstname` varchar(40) COLLATE utf8_bin NOT NULL,
  `lastname` varchar(40) COLLATE utf8_bin NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `activated` enum('0','1') COLLATE utf8_bin NOT NULL DEFAULT '0',
  `token` varchar(64) COLLATE utf8_bin NOT NULL,
  `cookie` varchar(264) COLLATE utf8_bin DEFAULT NULL,
  `avatar` varchar(50) COLLATE utf8_bin DEFAULT 'default-avatar.png'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;

CREATE TABLE `user_activity` (
  `user_id` int(11) NOT NULL,
  `activity_id` int(11) NOT NULL,
  `accepted` enum('0','1') COLLATE utf8_bin DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;


ALTER TABLE `activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `own_id` (`owner_id`);

ALTER TABLE `friends`
  ADD PRIMARY KEY (`user_id`,`friend_id`),
  ADD KEY `friend_id` (`friend_id`);

ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `type` (`type`),
  ADD KEY `initiator` (`initiator`),
  ADD KEY `receiver` (`receiver`);

ALTER TABLE `notificationTypes`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `notification_activity`
  ADD PRIMARY KEY (`notification_id`,`activity_id`),
  ADD KEY `activity_id` (`activity_id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);
ALTER TABLE `users` ADD FULLTEXT KEY `firstname` (`firstname`);
ALTER TABLE `users` ADD FULLTEXT KEY `lastname` (`lastname`);

ALTER TABLE `user_activity`
  ADD PRIMARY KEY (`user_id`,`activity_id`),
  ADD KEY `activity_id` (`activity_id`);


ALTER TABLE `activities`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=229;
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=668;
ALTER TABLE `notificationTypes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

ALTER TABLE `activities`
  ADD CONSTRAINT `activities_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `friends`
  ADD CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`friend_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`type`) REFERENCES `notificationTypes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`initiator`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`receiver`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `notification_activity`
  ADD CONSTRAINT `notification_activity_ibfk_1` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `notification_activity_ibfk_2` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `user_activity`
  ADD CONSTRAINT `user_activity_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_activity_ibfk_2` FOREIGN KEY (`activity_id`) REFERENCES `activities` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
