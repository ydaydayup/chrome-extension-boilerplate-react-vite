import 'webextension-polyfill';
import { addText, getAllCollectionList, getUrlHtml, searchTest } from './fastgpt';
import type { OnClickData } from '@types/chrome';
import { getHtmlTextSummary } from '@src/background/kimi';
import { mostFrequent } from '@src/background/history';
import { activeTab, getAllTabs, getExtensionIndex, jump2Tab, removeTab, tabDataPrepare } from '@src/background/tab';
import { getStorage } from '@src/background/storage_help';
import { panelState } from '@src/background/state';

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

async function setDatasetId(datasetId: string) {
  chrome.storage.sync.set({ datasetId }, function () {
    console.log('保存成功！');
  });
  chrome.storage.sync.get({ datasetId }, function (items) {
    console.log(items);
  });
  return datasetId;
}

async function canvas2htmlRetriever(tab: chrome.tabs.Tab) {
  return await chrome.storage.local.get({ [tab.id as number]: { dataURL: null } });
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
    case 'initial': {
      // const url = chrome.runtime.getURL( 'content-ui/index.html')
      sendResponseMessage(getAllTabs(), sendResponse);
      // await chrome.tabs.sendMessage(tab?.id as number, { message: 'tabAssistant', tabs, url  });
    }
    case 'canvas2htmlRetriever':
      sendResponseMessage(canvas2htmlRetriever(request.tab), sendResponse);
      break;
    case 'jump2Tab':
      sendResponseMessage(jump2Tab(request.tab), sendResponse);
      break;
    case 'getActiveTab':
      sendResponseMessage(activeTab(), sendResponse);
      break;
    case 'removeTab':
      sendResponseMessage(removeTab(request.tabId), sendResponse);
      break;

    default:
      sendResponse('我是后台，我已收到你的消息：' + JSON.stringify(request));
  }
  return true;
});
const TabsManagerId = 'TabsManager';
const BookmarksManagerId = 'BookmarksManager';

function checkCommandShortcuts() {
  chrome.commands.getAll(commands => {
    let missingShortcuts = [];

    for (let { name, shortcut } of commands) {
      if (shortcut === '') {
        missingShortcuts.push(name);
      }
    }

    if (missingShortcuts.length > 0) {
      console.error('快捷键失效', missingShortcuts);
      // Update the extension UI to inform the user that one or more
      // commands are currently unassigned.
    }
  });
}

const injectScript = () => {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [
          '/content-ui/index.iife.js',
          // '/content-ui/style.css',
          // /content.css'
        ],
      });
      chrome.scripting.insertCSS({
        files: ['/content-ui/style.css'],
        target: { tabId: tab.id },
      });
    });
  });
};

// chrome.management.onEnabled.addListener(function (extension) {
//   injectScript();
//   console.log('Extension enabled:', extension.id);
// });

chrome.runtime.onInstalled.addListener(details => {
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
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    checkCommandShortcuts();
  }
  // injectScript();
  mostFrequent();
  // tabDataPrepare();
});

chrome.commands.onCommand.addListener(async (command: string) => {
  console.log('result');
  if (command === 'tabAssistant') {
    const url = getExtensionIndex();
    // Create a new window for the tab switcher
    // const tabs = await getAllTabs();
    // const tabId = await getOrSetCurrentTab(undefined, '新窗口', false);
    // console.log('新窗口已创建，窗口ID为：' + tabId, tabs.map(tab => tab.id).includes(tabId));
    const result = await createOptimizedWindow(url);
    console.log('result', result);
    panelState.panelId = result!.id!;
  }
});

chrome.contextMenus.onClicked.addListener(async function (info: OnClickData, tab: chrome.tabs.Tab) {
  const storage = await getStorage();
  chrome.tabs.sendMessage(tab.id!, { message: 'getStorage', storage: storage });
  if (info.menuItemId === BookmarksManagerId) {
    chrome.tabs.sendMessage(tab.id!, { message: '打开书签面板' });
  } else if (info.menuItemId === TabsManagerId) {
    chrome.tabs.sendMessage(tab.id!, { message: TabsManagerId });
  }
});

// 获取主显示器信息并创建窗口
async function createOptimizedWindow(url: string) {
  // 首先检查是否已存在包含该 URL 的窗口
  const existingWindows = await chrome.windows.getAll({ populate: true });
  for (const window of existingWindows) {
    if (window.tabs) {
      const matchingTab = window.tabs.find(tab => tab.url === url);
      if (matchingTab) {
        // 如果找到匹配的标签页，激活对应的窗口和标签页
        console.log('[Window Manager]', {
          event: 'activate_existing_window',
          windowId: window.id,
          tabId: matchingTab.id,
          timestamp: new Date().toISOString(),
        });

        await chrome.windows.update(window.id, {
          focused: true,
          state: 'normal', // 确保窗口不是最小化状态
        });

        if (matchingTab.id) {
          await chrome.tabs.update(matchingTab.id, { active: true });
        }

        return window;
      }
    }
  }

  // 如果没有找到现有窗口，则创建新窗口
  // 获取显示器信息
  const displayInfo = await chrome.system.display.getInfo();
  const primaryDisplay = displayInfo[0]; // 使用主显示器

  // 计算窗口大小 (90% 的屏幕尺寸)
  const width = Math.round(primaryDisplay.workArea.width * 0.9);
  const height = Math.round(primaryDisplay.workArea.height * 0.9);

  // 计算窗口位置使其居中
  const left = Math.round(primaryDisplay.workArea.left + (primaryDisplay.workArea.width - width) / 2);
  const top = Math.round(primaryDisplay.workArea.top + (primaryDisplay.workArea.height - height) / 2);

  // 创建新窗口
  console.log('[Window Manager]', {
    event: 'create_new_window',
    url,
    dimensions: { width, height, left, top },
    timestamp: new Date().toISOString(),
  });

  return await chrome.windows.create({
    url,
    type: 'panel',
    width,
    height,
    left,
    top,
  });
}
