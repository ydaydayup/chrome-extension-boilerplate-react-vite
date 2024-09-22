import React, { useEffect } from 'react';
// import { Button } from '@extension/ui';
import { useStorage } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
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
import BookmarkTreeNode from '@types/chrome';

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

// import { Copy } from 'lucide-react';
async function getCurrentTab() {
  chrome.runtime.sendMessage({ greeting: '你好，我是content-script呀，我主动发消息给后台！' }, function (response) {
    const bookmarks = JSON.parse(response);
    console.log(bookmarks);
    const bookmarksTransformed = traverseBookmarks(bookmarks);
  });
}

export function DialogDemo() {
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const [open, setOpen] = React.useState(true);
  return (
    <div>
      <div ref={setContainer} />
      <Dialog open={open} modal={false}>
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
