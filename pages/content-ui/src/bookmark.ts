// import { Button } from '@extension/ui';
import { convert } from 'html-to-text';
import { setBookmarkDialogState, useBookmarkDialogState } from './state';
import { sendMessage } from '@src/extensonWrapper';

type createLinkSchema = {
  link?: string;
  text?: string;
  name?: string;
  datasetId: string;
  parentId: null;
  trainingType: 'chunk';
  chunkSize: 512;
  // chunkSplitter: '';
  // qaPrompt: '';
};

interface BookmarkSet {
  title: string;
  url: string; // 书签有 url，文件夹没有
}

interface BookmarkTreeNode {
  id: string;
  title: string;
  url?: string; // 书签有 url，文件夹没有
  children?: BookmarkTreeNode[]; // 书签文件夹有子节点
}

// 定义一个接口来表示 URL 和标题的组合
interface BookmarkInfo {
  url: string;
  title: string;
}

// 递归函数来遍历书签树并收集 URL 和标题
function traverseBookmarks(bookmarkNodes: BookmarkTreeNode[]): BookmarkInfo[] {
  const bookmarks: BookmarkInfo[] = [];
  for (const node of bookmarkNodes) {
    if (node.url) {
      // 如果是书签，则添加到数组中
      bookmarks.push({ url: node.url, title: node.title });
    }
    if (node.children) {
      // 如果有子节点，递归调用遍历函数并将结果合并到数组中
      const childBookmarks = traverseBookmarks(node.children);
      bookmarks.push(...childBookmarks);
    }
  }
  return bookmarks;
}

type CollectionList = {
  _id: string;
  parentId: null;
  tmbId: '66ee5536dfb00794b1a20687';
  type: 'link';
  name: '哔哩哔哩 (゜-゜)つロ 干杯~-bilibili';
  forbid: false;
  trainingType: 'chunk';
  rawLink: string;
  createTime: '2024-09-22T14:04:52.731Z';
  updateTime: '2024-09-22T14:04:52.731Z';
  dataAmount: 19;
  trainingAmount: 0;
  permission: {
    value: 4294967295;
    isOwner: true;
    hasManagePer: true;
    hasWritePer: true;
    hasReadPer: true;
  };
}[];

function html2text(html: string): string {
  const options = {};
  const text = convert(html, options);
  console.log(text); // Hello World
  return text;
}

export async function addBookmarks2Datasets() {
  setBookmarkDialogState({ progress: 0, isUpload: true });
  // 获取所有书签
  const bookmarks = (await sendMessage({ greeting: 'getBookmarkTreeNodes' })) as BookmarkTreeNode[];

  // 获取书签中的title url
  const bookmarksTransformed: BookmarkInfo[] = traverseBookmarks(bookmarks);

  const collectionList_: CollectionList = (await sendMessage({ greeting: 'getAllCollectionList' })) as CollectionList;
  // 获取向量库中的所有列表
  // const collectionList_: CollectionList = JSON.parse(response3);
  const names = Array.from(collectionList_, collection => {
    return collection.name;
  });

  const addDatasetBookmark: BookmarkSet[] = [];
  for (const bookmark of bookmarksTransformed) {
    if (names.some(name => name.includes(bookmark.url))) {
      continue;
    }
    addDatasetBookmark.push(bookmark);
  }

  const addDatasetBookmark_ = addDatasetBookmark.slice(0, 3);
  const length = addDatasetBookmark_.length;
  for (const [index, bookmark] of addDatasetBookmark_.entries()) {
    const progress = (index / (length - 1)) * 100;
    setBookmarkDialogState({ progress: progress });
    const html: string = (await sendMessage({ greeting: 'getUrlHtml', url: bookmark.url })) as string;
    if (html === null) {
      continue;
    }
    const text = html2text(html);
    const summary: string = (await sendMessage({ greeting: 'kimiApi', htmlText: text })) as string;
    if (summary === null) {
      console.error({ bookmark });
      continue;
    }
    console.log({ summary });
    const body: createLinkSchema = {
      text: summary,
      datasetId: '66eeb16187788986aff82fb1',
      name: `${bookmark.title}-${bookmark.url}`,
      parentId: null,
      // trainingType: 'chunk',
      // chunkSize: 512,
      // chunkSplitter: '',
      // qaPrompt: '',
    };
    chrome.runtime.sendMessage({ greeting: 'addText', requestBody: body }, function (response) {
      console.log('收到来自后台的回复：');
      console.log(response);
    });
    // break
  }
  // setBookmarkDialogState({ isUpload: false });
}

export type SearchTestRequest = {
  datasetId: string;
  text: string;
  limit: number;
  similarity: number;
  searchMode: string;
  usingReRank: boolean;
};

export async function searchDatasetText(body: SearchTestRequest): Promise<{
  data: { list: { sourceName: string }[] };
}> {
  const result: string = (await sendMessage({ greeting: 'searchTest', requestBody: body })) as string;
  console.log(result);
  return result;
}
