import { sqlGetAll } from './dbWrapper'

interface Pagination {
  limit: number;
  skip: number;
}

const SORTED_PRODUCT_QUERY = `
  SELECT
    products.id AS id, 
    products.name AS name, 
    products.brand AS brand, 
    (SELECT COUNT(id) FROM Labtests WHERE Labtests.batch_id = Batches.id) as test_count,
    count(DISTINCT Reviews.id) AS review_count, 
    avg(score) AS avg_score
  FROM products 
  LEFT OUTER JOIN reviews ON products.id = reviews.product_id
  LEFT OUTER JOIN Batches ON Products.id = Batches.product_id
    GROUP BY products.id
    ORDER BY 
    test_count DESC,
      review_count DESC, 
      avg_score DESC
`

const parseNum = (num: any): number => parseInt(num, 10)
export async function sortedProducts({ limit, skip }: Pagination) {
  return sqlGetAll(`
      ${SORTED_PRODUCT_QUERY}
      LIMIT ${parseNum(limit) || 5}
      OFFSET ${parseNum(skip) || 0}
  `)
}
