import React, { useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  Dialog,
  DialogContent,
  lucide,
} from '@extension/ui';
import { getAllTabs, jump2Tab, setTabDialogState, useTabDialogState } from '@src/state';
import { canvas2htmlRetriever, SendCanvas2Background } from '@src/screenshot';

const { Calculator, Calendar, CreditCard, Settings, Smile, User } = lucide;

export function SearchComponent() {
  const { isOpen, tabs } = useTabDialogState(state => state);
  const [isInputFocused, setIsInputFocused] = React.useState(false);

  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  useEffect(() => {
    getAllTabs().then(async tabs => {
      await SendCanvas2Background(tabs);
    });
  }, []);
  useEffect(() => {
    function isAlphaNumeric(key: string) {
      // 不区分大小写的版本
      if (key.length !== 1) return false;
      return /^[A-Za-z0-9]+$/i.test(key);
    }

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

  const mappedChildren = tabs.map(tab => (
    <CommandItem
      onMouseEnter={() => canvas2htmlRetriever(tab)}
      key={tab.id}
      onSelect={() => {
        jump2Tab(tab);
      }}>
      <Calendar className="mr-2 h-4 w-4" />
      <div>
        <span>{tab.id || ''}</span>
        <span>{tab.title || ''}</span>
        <span> {tab.url || ''}</span>
      </div>
    </CommandItem>
  ));
  const filter = (value: string, search: string, keywords?: string[]) => {
    const extendValue = value + ' ' + (keywords ? keywords.join(' ') : '');
    const searchKey = search.split(' ');
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
      <div className={'dark text-primary'} ref={setContainer}>
        <CommandDialog
          commandProps={{ filter, label: '=====' }}
          modal={false}
          open={isOpen}
          contentProps={{ portalProps: { container: container } }}
          onOpenChange={setOpen}>
          <CommandInput
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Type a command or search..."
          />
          <CommandList className={'max-h-[80svh]'}>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading={'tabs'}>{mappedChildren}</CommandGroup>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Suggestions">
              <CommandItem>Calendar</CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>Profile</CommandItem>
              <CommandItem>Billing</CommandItem>
              <CommandItem>Settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </>
  );
}

export function Preview() {
  const { isOpen, tabs } = useTabDialogState(state => state);
  const { preview } = useTabDialogState(state => state);
  // const [ isOpen, setIsOpen ] = useState<boolean>(Boolean(preview));
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const setOpen = (isOpen: boolean) => {
    // setIsOpen(isOpen)
  };

  console.log({ preview });
  return (
    <div className={'dark text-primary'}>
      <div ref={setContainer} />
      <Dialog open={isOpen} modal={false} onOpenChange={setOpen}>
        <DialogContent
          portalProps={{ container }}
          closeProps={{ closeClassName: 'hidden' }}
          className="bg-transparent border-transparent z-[9998] max-w-full max-h-full">
          <img src={preview} alt={''}></img>
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
