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

export const mostFrequent = () => {
  chrome.history.search(
    {
      text: '',
      startTime: 0,
      maxResults: 100000,
    },
    (historyItems: chrome.history.HistoryItem[]) => {
      const frequencyMap = getFrequentVisits(historyItems);
      console.log({ frequencyMap });
      const mostFrequentUrls = getMostFrequentUrls(frequencyMap, 5);
      console.log(mostFrequentUrls);
      // 显示或使用这些最常访问的URL
    },
  );
};
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/history/getVisits

// chrome.history.getVisits({url:'https://kimi.moonshot.cn'}, (historyItems) => {
//     console.log({ historyItems });
//     xxx = new Set(historyItems);
//     console.log(xxx);
//   },
// )
// {
//   "historyItems": [
//   {
//     "id": "11973",
//     "isLocal": true,
//     "referringVisitId": "0",
//     "transition": "link",
//     "visitId": "36031",
//     "visitTime": 1723726953010.436
//   },
//   {
//     "id": "11973",
//     "isLocal": true,
//     "referringVisitId": "0",
//     "transition": "link",
//     "visitId": "36058",
//     "visitTime": 1723728581458.3
//   },
//   {
//     "id": "11973",
//     "isLocal": true,
//     "referringVisitId": "0",
//     "transition": "link",
//     "visitId": "36066",
//     "visitTime": 1723728674980.231
//   },
//   {
//     "id": "11973",
//     "isLocal": true,
//     "referringVisitId": "0",
//     "transition": "link",
//     "visitId": "36076",
//     "visitTime": 1723728743457.022
//   },
//   {
//     "id": "11973",
//     "isLocal": true,
//     "referringVisitId": "0",
//     "transition": "link",
//     "visitId": "36077",
//     "visitTime": 1723728743714.551
//   },
//   {
//     "id": "11973",
//     "isLocal": true,
//     "referringVisitId": "0",
//     "transition": "link",
//     "visitId": "43580",
//     "visitTime": 1727784132467.285
//   },
//   {
//     "id": "11973",
//     "isLocal": true,
//     "referringVisitId": "0",
//     "transition": "typed",
//     "visitId": "47727",
//     "visitTime": 1728197943700.184
//   },
//   {
//     "id": "11973",
//     "isLocal": true,
//     "referringVisitId": "0",
//     "transition": "link",
//     "visitId": "47728",
//     "visitTime": 1728197943877.758
//   },
//   {
//     "id": "11973",
//     "isLocal": true,
//     "referringVisitId": "0",
//     "transition": "link",
//     "visitId": "47729",
//     "visitTime": 1728197962527.171
//   }
// ]
// }
