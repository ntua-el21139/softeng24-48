SELECT 
    P.timestamp,
    P.tag_id AS tagID,
    P.tag_home_id AS tagProvider,
    CASE 
        WHEN P.tag_home_id = P.operator_id THEN 'home'
        ELSE 'visitor'
    END AS passType,
    P.charge AS passCharge
FROM Passes P
WHERE P.toll_id = 'T001'
  AND P.timestamp >= STR_TO_DATE('20250101', '%Y%m%d')
  AND P.timestamp < DATE_ADD(STR_TO_DATE('20250131', '%Y%m%d'), INTERVAL 1 DAY);