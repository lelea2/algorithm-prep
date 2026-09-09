/**
 * Best Time to Buy and Sell Stock (single transaction).
 * Buy once and sell once later; return the maximum possible profit.
 * If no profit is possible, return 0.
 * Input: prices = [7, 1, 5, 3, 6, 4]
 * Output: 5
 * @param {number[]} prices
 * @return {number}
 */
export default function optimalStockTrading(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;

  for (const price of prices) {
    minPrice = Math.min(price, minPrice);
    maxProfit = Math.max(price - minPrice, maxProfit);
  }
  return maxProfit;
}

// Time complexity: O(n) - single pass through the array
// Space complexity: O(1) - constant space for minPrice and maxProfit
// Instead of brute force, 
// we can keep track of the minimum price seen so far and calculate the profit if we sell at the current price. 
// This way, we only need to traverse the array once, making it efficient.
