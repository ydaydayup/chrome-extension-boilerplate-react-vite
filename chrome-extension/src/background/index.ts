import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';
import { addLink, getAllCollectionList, createLinkSchema, getUrlHtml } from './fastgpt';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

async function getAllTabs(sendResponse) {
  const tabs = await chrome.tabs.query({});
  sendResponse(JSON.stringify(tabs));
}

async function getBookmarkTreeNodes(sendResponse) {
  chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
    console.log(bookmarkTreeNodes);
    if (bookmarkTreeNodes.length > 0) {
      // 这里可以处理书签数据，例如发送到后台脚本或内容脚本
      sendResponse(JSON.stringify(bookmarkTreeNodes[0]));
    }
  });
}

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request, sender, sendResponse);
  switch (request.greeting) {
    case 'getAllCollectionList':
      getAllCollectionList(sendResponse);
      break;
    case 'getBookmarkTreeNodes':
      getBookmarkTreeNodes(sendResponse);
      break;
    case 'addLink':
      addLink(request.requestBody, sendResponse);
      break;
    case 'getUrlHtml':
      getUrlHtml(request.url, sendResponse);
      break;
    default:
      sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
  }
  return true;
});
