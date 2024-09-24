import React, { useEffect } from 'react';
// import { Button } from '@extension/ui';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { compile, convert } from 'html-to-text';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  Input,
  Label,
  DialogPortal,
  DialogOverlay,
} from '@extension/ui';
import { addLink, createLinkSchema, getAllCollectionList } from '@src/fastgpt';

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
  const options = {
    // wordwrap: 130,
    // ...
  };
  // const compiledConvert = compile(options); // options passed here
  // const html = '<div>Hello World</div>';
  const text = convert(html, options);
  console.log(text); // Hello World
  return text;
}

async function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, function (response) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

// import { Copy } from 'lucide-react';
async function getCurrentTab() {
  const bookmarks: BookmarkTreeNode[] = [];
  let bookmarksTransformed: BookmarkSet[] = [];
  const collectionList: BookmarkTreeNode[] = [];

  const response2 = await sendMessage({ greeting: 'getBookmarkTreeNodes' });

  const bookmarks_ = JSON.parse(response2);
  bookmarks.push(bookmarks_);
  bookmarksTransformed = traverseBookmarks(bookmarks);

  const response3 = await sendMessage({ greeting: 'getAllCollectionList' });
  const collectionList_: CollectionList = JSON.parse(response3);
  const links = Array.from(collectionList_, collection => {
    return collection.rawLink;
  });

  const addDatasetBookmark: BookmarkSet[] = [];
  const collectionSet = new Set(links);
  for (const bookmark of bookmarksTransformed) {
    if (collectionSet.has(bookmark.url)) {
      console.log(bookmark);
      continue;
    }
    addDatasetBookmark.push(bookmark);
  }

  // const response4 = await sendMessage({ greeting: 'getBookmarkTreeNodes' });
  for (const bookmark of addDatasetBookmark) {
    const html: string = (await sendMessage({ greeting: 'getUrlHtml', url: bookmark.url })) as string;
    if (html === null) {
      continue;
    }
    const text = html2text(html);
    console.log(text);
    const body: createLinkSchema = {
      text,
      datasetId: '66eeb16187788986aff82fb1',
      name: bookmark.url,
      parentId: null,
      trainingType: 'chunk',
      chunkSize: 512,
      chunkSplitter: '',
      qaPrompt: '',
    };
    chrome.runtime.sendMessage({ greeting: 'addLink', requestBody: body }, function (response) {
      console.log('收到来自后台的回复：');
      console.log(response);
    });
    break;
  }
}

export function DialogDemo() {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const [open, setOpen] = React.useState(true);
  return (
    <div>
      <div ref={setContainer} />
      <Dialog open={open} modal={false} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit Profile</Button>
        </DialogTrigger>
        <DialogContent container={container} className="absolute z-[9999] bg-white">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Make changes to your profile here. Click save</DialogDescription>
          </DialogHeader>
          <Button onClick={getCurrentTab}>收集书签信息</Button>

          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>

        {/*<DialogPortal container={container}>*/}
        {/*  /!*<DialogOverlay>*!/*/}
        {/*  */}
        {/*  /!*</DialogOverlay>*!/*/}
        {/*</DialogPortal>*/}
      </Dialog>
    </div>
  );
}

export default function App() {
  // const theme = useStorage(exampleThemeStorage);
  //
  // useEffect(() => {
  //   console.log('content ui loaded');
  // }, []);
  return <DialogDemo></DialogDemo>;
  // return (
  //   <div className="flex items-center justify-between gap-2 bg-blue-100 rounded py-1 px-2">
  //     <div className="flex gap-1 text-blue-500">
  //       Edit <strong className="text-blue-700">pages/content-ui/src/app.tsx</strong> and save to reload.
  //     </div>
  //     <Button theme={theme} onClick={exampleThemeStorage.toggle}>
  //       Toggle Theme
  //     </Button>
  //   </div>
  // );
}
