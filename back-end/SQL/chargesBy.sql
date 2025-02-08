SELECT 
    tag_home_id AS other_operator,
    COUNT(*) AS num_passes,
    SUM(charge) AS total_cost
FROM Passes
WHERE operator_id = 'tollOpID'
  AND tag_home_id <> 'tollOpID'
  AND timestamp >= STR_TO_DATE('20250101', '%Y%m%d')
  AND timestamp < DATE_ADD(STR_TO_DATE('20250131', '%Y%m%d'), INTERVAL 1 DAY)
GROUP BY tag_home_id;