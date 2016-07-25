SELECT
    `Person`.`firstName`,
    `Person`.`lastName`,
    MIN(`EmployeeSchedule`.`time`) AS "start",
    ADDTIME(MAX(`EmployeeSchedule`.`time`), '00:15:00') AS "end",
    GROUP_CONCAT(DISTINCT `Center`.`shorthand`) AS "center"
FROM
    `EmployeeSchedule`
        LEFT JOIN `EmployeePosition` ON
            `EmployeeSchedule`.`id` = `EmployeePosition`.`id`
        LEFT JOIN `Position` ON
            `EmployeePosition`.`position` = `Position`.`id`
        LEFT JOIN `Person` ON
            `EmployeeSchedule`.`id` = `Person`.`id`
        LEFT JOIN `Term` ON
            `EmployeeSchedule`.`term` = `Term`.`id`
        LEFT JOIN `Center` ON
            `EmployeeSchedule`.`center` = `Center`.`id`
WHERE
    `EmployeePosition`.`start` < CURDATE() AND
    (
        `EmployeePosition`.`end` > CURDATE() OR
        ISNULL(`EmployeePosition`.`end`)
    ) AND
    `EmployeeSchedule`.`day` = DAYOFWEEK(CURDATE()) - 1 AND
    `Term`.`start` <= CURDATE() AND `Term`.`end` >= CURDATE() AND
    `Position`.`category` = 'Management' AND
    `EmployeeSchedule`.`center` > -1
GROUP BY `Person`.`id`
ORDER BY GROUP_CONCAT(DISTINCT `Center`.`shorthand`), MIN(`EmployeeSchedule`.`time`);
