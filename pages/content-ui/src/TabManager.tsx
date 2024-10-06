import React, { useEffect, useRef, useState } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  Dialog,
  DialogContent,
  lucide,
} from '@extension/ui';
import { getActiveTab, getAllTabs, jump2Tab, setTabDialogState, useTabDialogState } from '@src/state';
import { canvas2htmlRetriever, SendCanvas2Background } from '@src/screenshot';

export function FavIconAvatar({
  favIconUrl,
  ...props
}: React.ComponentPropsWithoutRef<typeof Avatar> & {
  favIconUrl: string;
}) {
  return (
    <Avatar {...props}>
      <AvatarImage src={favIconUrl} alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}

export function SearchComponent() {
  const { isOpen, tabs } = useTabDialogState(state => state);
  const [isInputFocused, setIsInputFocused] = React.useState(true);
  const activeTab = useRef<chrome.tabs.Tab | null>(null);
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    canvas2htmlRetriever({ id: tabs[0].id as number });
    getAllTabs().then(async tabs => {
      await SendCanvas2Background(tabs);
    });
    getActiveTab().then(tab => (activeTab.current = tab));
  }, [isOpen]);
  useEffect(() => {
    // function isAlphaNumeric(key: string) {
    //   // 不区分大小写的版本
    //   if (key.length !== 1) return false;
    //   return /^[A-Za-z0-9]+$/i.test(key);
    // }

    const down = (e: KeyboardEvent) => {
      if (!isInputFocused) return;
      e.stopPropagation();
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, isInputFocused]);

  const setOpen = (isOpen: boolean) => {
    setTabDialogState({ isOpen });
  };
  const [commandListRef, setCommandListRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        console.log(mutation);
        if (mutation.type === 'attributes' && mutation.attributeName === 'aria-selected') {
          const target = mutation.target as HTMLElement;
          if (target?.getAttribute('aria-selected') !== 'true') {
            return;
          }
          const tabId = target.getAttribute('data-tab');
          const tabTitle = target.getAttribute('data-title') || '';
          const tabUrl = target.getAttribute('data-url') || '';
          if (tabId === null) {
            return;
          }
          if (activeTab.current && tabId === (activeTab.current?.id as number).toString()) {
            setTabDialogState({ preview: '', previewTitle: '', previewUrl: '' });
            return;
          }
          // setTabDialogState({ previewTitle: tabTitle, previewUrl: tabUrl });
          canvas2htmlRetriever({ id: parseInt(tabId as string, 10) });
        }
      });
    });

    if (commandListRef) {
      observer.observe(commandListRef, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-selected'],
      });
    }

    return () => observer.disconnect();
  }, [commandListRef]);
  const mappedChildren = tabs.map(tab => (
    <CommandItem
      key={tab.id}
      data-tab={tab.id}
      data-title={tab.title}
      data-url={tab.url}
      className={'grid grid-cols-2  whitespace-nowrap text-ellipsis'}
      onSelect={() => {
        jump2Tab(tab);
      }}>
      <div className={'row-start-1 col-span-2 gap-x-1 items-center grid grid-cols-[auto_1fr]'}>
        <FavIconAvatar favIconUrl={tab.favIconUrl || ''} className={'row-start-1 w-4 h-4'}></FavIconAvatar>
        <span className={'row-start-1'}>{tab.title || ''}</span>
        <div className={'hidden row-start-1'}>{tab.id || ''}</div>
      </div>
      <div className={'col-start-1 col-span-2'}> {tab.url || ''}</div>
      {/*<CommandShortcut>xxx</CommandShortcut>*/}
    </CommandItem>
  ));
  const filter = (value: string, search: string, keywords?: string[]) => {
    const extendValue = (value + ' ' + (keywords ? keywords.join(' ') : '')).toLowerCase();
    const searchKey = search.toLowerCase().split(' ');
    if (
      searchKey.every(key => {
        return extendValue.includes(key);
      })
    )
      return 1;
    return 0;
  };

  return (
    <>
      <div className={'text-primary'} ref={setContainer}>
        <CommandDialog
          commandProps={{ filter }}
          modal={false}
          open={isOpen}
          contentProps={{ portalProps: { container: container } }}
          onOpenChange={setOpen}>
          <CommandInput
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Type a command or search..."
          />
          <CommandList className={'max-h-[80svh]'} ref={setCommandListRef}>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading={'tabs'}>{mappedChildren}</CommandGroup>
            {/*<CommandGroup heading="Suggestions">*/}
            {/*  <CommandItem>Calendar</CommandItem>*/}
            {/*  <CommandItem>Search Emoji</CommandItem>*/}
            {/*  <CommandItem>Calculator</CommandItem>*/}
            {/*</CommandGroup>*/}
            {/*<CommandSeparator />*/}
            {/*<CommandGroup heading="Settings">*/}
            {/*  <CommandItem>Profile</CommandItem>*/}
            {/*  <CommandItem>Billing</CommandItem>*/}
            {/*  <CommandItem>Settings</CommandItem>*/}
            {/*</CommandGroup>*/}
          </CommandList>
        </CommandDialog>
      </div>
    </>
  );
}

export function Preview() {
  const { isOpen, preview, previewTitle, previewUrl, tabCanvas } = useTabDialogState(state => state);
  const [container, setContainer] = React.useState<HTMLElement | null>(null);

  return (
    <div className={'text-primary'}>
      <div ref={setContainer} />
      <Dialog open={isOpen} modal={false}>
        <DialogContent
          onOpenAutoFocus={event => event.preventDefault()}
          portalProps={{ container }}
          closeProps={{ closeClassName: 'hidden' }}
          className="bg-transparent border-transparent z-[9998] max-w-full max-h-full p-0">
          {/*<DialogHeader>*/}
          {/*  <DialogTitle>{previewTitle}</DialogTitle>*/}
          {/*  <DialogDescription>*/}
          {/*    {previewUrl}*/}
          {/*  </DialogDescription>*/}
          {/*</DialogHeader>*/}
          <img src={preview || ''} alt={''}></img>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function TabCommand() {
  return (
    <>
      <SearchComponent></SearchComponent>
      <Preview></Preview>
    </>
  );
}
