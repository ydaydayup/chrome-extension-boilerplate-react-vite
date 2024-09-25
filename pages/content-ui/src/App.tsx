import React, { useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  Input,
  Label,
} from '@extension/ui';
import type { SearchTestRequest } from '@src/bookmark';
import { addBookmarks2Datasets, searchDatasetText } from '@src/bookmark';

function SearchDataset() {
  const [searchText, setSearchText] = useState('');

  const body2: SearchTestRequest = {
    datasetId: '66eeb16187788986aff82fb1',
    text: `为什么使用MongoDB？`,
    limit: 5,
    similarity: 0.8,
    searchMode: 'mixedRecall',
    usingReRank: false,
  };
  const search = async () => {
    body2.text = searchText;
    const result = await searchDatasetText(body2);
  };
  return (
    <div className="grid w-full max-w-sm items-center gap-1.5">
      <Label htmlFor="search">搜索书签</Label>
      <Input value={searchText} type="text" id="search" placeholder="" />
      <Button type="submit" onClick={search}>
        Submit
      </Button>
    </div>
  );
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
            {/*<DialogTitle>书签助手</DialogTitle>*/}
            <DialogDescription>点击收集书签信息既可以把书签存到向量库中，可以对书签内容做模糊搜索</DialogDescription>
          </DialogHeader>
          <Button onClick={addBookmarks2Datasets}>收集书签信息</Button>
          <SearchDataset></SearchDataset>
          <DialogFooter>{/*<Button type="submit">Save changes</Button>*/}</DialogFooter>
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
  return <DialogDemo></DialogDemo>;
}
