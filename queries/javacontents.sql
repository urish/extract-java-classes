#standardSQL
SELECT
  *
FROM
  `bigquery-public-data.github_repos.contents`
WHERE
  id IN (
  SELECT
    id
  FROM
    `java.javafiles`)
  AND binary = FALSE
