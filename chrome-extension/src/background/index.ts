import 'webextension-polyfill';
import { addText, getAllCollectionList, getUrlHtml, searchTest } from './fastgpt';
import type { OnClickData } from '@types/chrome';
import { getHtmlTextSummary } from '@src/background/kimi';

async function getAllTabs(): Promise<chrome.tabs.Tab[]> {
  const tabs = await chrome.tabs.query({});
  return tabs;
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

function sendResponseMessage(result: Promise<unknown>, sendResponse) {
  result
    .then(response => {
      sendResponse(response);
    })
    .catch(error => {
      console.error('during searchTest request:', error);
      sendResponse(error);
    });
}

async function getStorage() {
  const storage = await chrome.storage.sync.get();
  console.log(storage, 'storage');
  return storage;
}

async function setDatasetId(datasetId: string) {
  chrome.storage.sync.set({ datasetId }, function () {
    console.log('保存成功！');
  });
  chrome.storage.sync.get({ datasetId }, function (items) {
    console.log(items);
  });
  return datasetId;
}

async function jump2Tab(tab: chrome.tabs.Tab) {
  chrome.tabs.update(tab.id, { active: true });
  chrome.windows.update(tab.windowId, { focused: true });
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
    case 'datasetId':
      sendResponseMessage(setDatasetId(request.datasetId), sendResponse);
      break;
    case 'getStorage':
      sendResponseMessage(getStorage(), sendResponse);
      break;
    case 'kimiApi':
      sendResponseMessage(getHtmlTextSummary(request.htmlText), sendResponse);
      break;
    case 'getAllTabs':
      sendResponseMessage(getAllTabs(), sendResponse);
      break;
    case 'jump2Tab':
      sendResponseMessage(jump2Tab(request.tab), sendResponse);
      break;
    default:
      sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
  }
  return true;
});
const TabsManagerId = 'TabsManager';
const BookmarksManagerId = 'BookmarksManager';
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: BookmarksManagerId,
    title: '智能书签面板',
    contexts: ['page'],
  });
  chrome.contextMenus.create({
    id: TabsManagerId,
    title: 'TabsManager',
    contexts: ['page'],
  });
});

chrome.commands.onCommand.addListener(async (command: string, tab?: chrome.tabs.Tab) => {
  if (command === 'tabAssistant') {
    await chrome.tabs.sendMessage(tab?.id as number, { message: 'tabAssistant', tabs: await getAllTabs() });
  }
});
// Unchecked runtime.lastError: Extensions using event pages or Service Workers
// must pass an id parameter to chrome.contextMenus.create
chrome.contextMenus.onClicked.addListener(async function (info: OnClickData, tab?: tabs.Tab) {
  const storage = await getStorage();
  // console.table(storage, info, tab);
  await chrome.tabs.sendMessage(tab.id, { message: 'getStorage', storage: storage });

  if (info.menuItemId === BookmarksManagerId) {
    await chrome.tabs.sendMessage(tab.id, { message: '打开书签面板' });
  } else if (info.menuItemId === TabsManagerId) {
    await chrome.tabs.sendMessage(tab.id, { message: TabsManagerId });
  }
  // chrome.tabs.sendMessage(tab.id, { message: TabsManagerId });
  // console.log('收到消息：');
  // 注意不能使用location.href，因为location是属于background的window对象
  // chrome.tabs.create({ url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(info.selectionText) });
});
