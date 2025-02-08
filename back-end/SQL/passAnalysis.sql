SELECT 
    toll_id AS stationID,
    timestamp,
    tag_id AS tagID,
    charge AS passCharge
FROM Passes
WHERE tag_home_id = 'OperatorA'
  AND operator_id = 'OperatorB'
  AND timestamp >= STR_TO_DATE('20250101', '%Y%m%d')
  AND timestamp < DATE_ADD(STR_TO_DATE('20250131', '%Y%m%d'), INTERVAL 1 DAY);