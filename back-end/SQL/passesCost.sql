SELECT 
    COUNT(*) AS num_passes,
    SUM(charge) AS passesCost
FROM Passes
WHERE tag_home_id = 'tagOpID'
  AND operator_id = 'tollOpID'
  AND timestamp >= STR_TO_DATE('20250101', '%Y%m%d')
  AND timestamp < DATE_ADD(STR_TO_DATE('20250131', '%Y%m%d'), INTERVAL 1 DAY);