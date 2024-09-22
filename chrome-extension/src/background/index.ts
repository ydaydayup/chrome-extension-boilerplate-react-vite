import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

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
    sendResponse(JSON.stringify(bookmarkTreeNodes));
    // 这里可以处理书签数据，例如发送到后台脚本或内容脚本
  });
}

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  getBookmarkTreeNodes(sendResponse);
  return true;
});
