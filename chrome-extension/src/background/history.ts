// 定义历史记录项的类型
interface HistoryItem {
  url: string;
}

// 定义最常访问的URL对象的类型
interface MostFrequentUrl {
  url: string;
  count: number;
}

function getFrequentVisits(historyItems: HistoryItem[]): Map<string, number> {
  const frequencyMap = new Map<string, number>();
  historyItems.forEach(item => {
    const url = item.url;
    if (frequencyMap.has(url)) {
      frequencyMap.set(url, frequencyMap.get(url)! + 1);
    } else {
      frequencyMap.set(url, 1);
    }
  });
  return frequencyMap;
}

function getMostFrequentUrls(frequencyMap: Map<string, number>, topN: number): MostFrequentUrl[] {
  const frequentUrls = Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1]) // 根据访问次数降序排序
    .slice(0, topN); // 获取前N个
  return frequentUrls.map(item => {
    return { url: item[0], count: item[1] };
  });
}

// 添加防抖计时器
let historyDebounceTimer: NodeJS.Timeout | null = null;

/**
 * 获取 Map 中访问次数排名前 n 的数据
 * @param {Map} urlMap - 输入的 Map 对象，键是 URL，值是访问次数
 * @param {number} n - 返回排名前 n 的数据
 * @returns {Map} - 返回一个新的 Map 对象，包含排名前 n 的数据
 */
function getTopNEntries(urlMap: Map<string, number>, n: number) {
  // 将 Map 转换为数组，并按访问次数降序排序
  const sortedArray = Array.from(urlMap).sort((a, b) => b[1] - a[1]);

  // 截取前 n 个元素
  const topNArray = sortedArray.slice(0, n);

  // 将结果转换回 Map
  const topNMap = new Map(topNArray);

  return topNMap;
}
// 防抖包装的 mostFrequent 函数
const debouncedMostFrequent = () => {
  if (historyDebounceTimer) {
    clearTimeout(historyDebounceTimer);
  }

  historyDebounceTimer = setTimeout(async () => {
    console.log('[History]', {
      event: 'calculate_frequent_urls',
      timestamp: new Date().toISOString(),
    });

    try {
      const historyItems = await chrome.history.search({
        text: '',
        startTime: 0,
        maxResults: 100000,
      });

      const frequencyMap = getFrequentVisits(historyItems);
      const mostFrequentUrls = getMostFrequentUrls(frequencyMap, 5);

      // for (const [url, count] of getTopNEntries(frequencyMap, 100)) {
      //   chrome.storage.sync.set({ [url]: count });
      // }
      console.log('[History]', {
        event: 'frequent_urls_calculated',
        frequencyMap,
        mostFrequentUrls,
        timestamp: new Date().toISOString(),
      });

      // 显示或使用这些最常访问的URL
    } catch (error) {
      console.error('[History]', {
        event: 'history_error',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    }
  }, 1000); // 1秒的防抖延迟
};

// 监听历史记录变化
// chrome.history.onVisited.addListener((result) => {
//   console.log('[History]', {
//     event: 'history_changed',
//     url: result.url,
//     timestamp: new Date().toISOString()
//   });
//   debouncedMostFrequent();
// });

// 监听历史记录删除
chrome.history.onVisitRemoved.addListener(removed => {
  console.log('[History]', {
    event: 'history_removed',
    details: removed,
    timestamp: new Date().toISOString(),
  });
  debouncedMostFrequent();
});

// 导出原始函数以供直接调用
export const mostFrequent = debouncedMostFrequent;
