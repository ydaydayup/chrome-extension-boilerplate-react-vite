import React, { useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  lucide,
  Progress,
} from '@extension/ui';
import type { SearchTestRequest } from '@src/bookmark';
import { addBookmarks2Datasets, searchDatasetText } from '@src/bookmark';
import { Items } from '@src/mail-list';
import { setBookmarkDialogState, useBookmarkDialogState } from '@src/state';
import { InputForm } from '@src/config';

function SearchDataset() {
  const [searchText, setSearchText] = useState('');
  const [result, setResult] = useState<{ title: string; url: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const body2: SearchTestRequest = {
    datasetId: '66eeb16187788986aff82fb1',
    text: `为什么使用MongoDB？`,
    limit: 5,
    similarity: 0.6,
    searchMode: 'mixedRecall',
    usingReRank: false,
  };

  function handleTextareaChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchText(e.target.value);
  }

  const search = async event => {
    setIsLoading(true);
    event.preventDefault();
    body2.text = searchText;
    const result_ = await searchDatasetText(body2);
    setIsLoading(false);
    setResult(
      Array.from(result_.data.list, item => {
        return { title: item.sourceName, url: item.sourceName };
      }),
    );
  };
  return (
    <div className="grid w-full items-center">
      <form onSubmit={search}>
        <div className="relative">
          <div className="absolute left-1 top-2.5 h-4 w-4 text-muted-foreground">
            {isLoading ? <lucide.Loader /> : <lucide.Search />}
          </div>
          <Input
            placeholder="书签模糊搜索"
            disabled={isLoading}
            className={'pl-8'}
            value={searchText}
            onChange={handleTextareaChange}
            type="text"
            id="search"
          />
        </div>
      </form>
      <Items items={result}></Items>
    </div>
  );
}

export function ProgressBookmarks(props: React.ComponentPropsWithoutRef<typeof Progress>) {
  return <Progress {...props}></Progress>;
}

export function BookmarkCollection() {
  const { isOpen, isUpload, progress } = useBookmarkDialogState(state => state);
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const setOpen = (isOpen: boolean) => {
    setBookmarkDialogState({ isOpen });
  };

  return (
    <div className={'dark text-primary'}>
      <div ref={setContainer} />
      <Dialog open={isOpen} modal={false} onOpenChange={setOpen}>
        <DialogContent container={container} className="z-[9999]">
          <div className={'h-20 w-20 bg-green-300 overflow-y-scroll'}>
            <div className={'h-60 w-20 bg-green-30'}></div>
          </div>
          <DialogHeader>
            <DialogTitle>书签助手</DialogTitle>
            <DialogDescription>点击收集书签信息既可以把书签存到向量库中</DialogDescription>
          </DialogHeader>
          <Button onClick={addBookmarks2Datasets}>收集书签信息</Button>
          <ProgressBookmarks value={progress} className={isUpload ? 'visible' : 'invisible'}>
            收集书签信息
          </ProgressBookmarks>
          {/*<Progress value={progress} className="w-[60%]" />*/}
          <SearchDataset></SearchDataset>
          <InputForm></InputForm>
          <DialogFooter>{/*<Button type="submit">Save changes</Button>*/}</DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
