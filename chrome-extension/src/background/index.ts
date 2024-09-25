import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';
import {
  addLink,
  getAllCollectionList,
  createLinkSchema,
  getUrlHtml,
  addText,
  searchTest,
  SearchTestRequest,
} from './fastgpt';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");

async function getAllTabs(sendResponse) {
  const tabs = await chrome.tabs.query({});
  sendResponse(JSON.stringify(tabs));
}

async function getBookmarkTreeNodes() {
  return new Promise((resolve, reject) => {
    chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        if (bookmarkTreeNodes.length > 0) {
          resolve(bookmarkTreeNodes);
        }
        return resolve([]);
      }
    });
  });
}

function sendResponseMessage(result: Promise<any>, sendResponse) {
  result
    .then(response => {
      sendResponse(response);
    })
    .catch(error => {
      console.error('during searchTest request:', error);
      sendResponse(null);
    });
}

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request, sender, sendResponse);
  switch (request.greeting) {
    case 'getAllCollectionList':
      sendResponseMessage(getAllCollectionList(), sendResponse);
      break;
    case 'getBookmarkTreeNodes':
      sendResponseMessage(getBookmarkTreeNodes(), sendResponse);
      break;
    case 'addText':
      sendResponseMessage(addText(request.requestBody), sendResponse);
      break;
    case 'getUrlHtml':
      sendResponseMessage(getUrlHtml(request.url), sendResponse);
      break;
    case 'searchTest':
      sendResponseMessage(searchTest(request.requestBody), sendResponse);
      break;
    default:
      sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
  }
  return true;
});
