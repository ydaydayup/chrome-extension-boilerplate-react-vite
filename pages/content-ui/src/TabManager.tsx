import React, { useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  lucide,
} from '@extension/ui';
import { getAllTabs, jump2Tab, setTabDialogState, useTabDialogState } from '@src/state';

const { Calculator, Calendar, CreditCard, Settings, Smile, User } = lucide;

export function SearchComponent() {
  useEffect(() => {
    getAllTabs();
  }, []);
  const { isOpen, isUpload, tabs } = useTabDialogState(state => state);
  const setOpen = (isOpen: boolean) => {
    setTabDialogState({ isOpen });
  };
  const [isInputFocused, setIsInputFocused] = React.useState(false);

  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    function isAlphaNumeric(key: string) {
      // 不区分大小写的版本
      if (key.length !== 1) return false;
      return /^[A-Za-z0-9]+$/i.test(key);
    }

    const down = (e: KeyboardEvent) => {
      if (!isInputFocused) return;
      if (!isInputFocused) return;
      // if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      //   // e.preventDefault()
      //   // setOpen((open) => !open)
      // }
      e.stopPropagation();
      // if (isAlphaNumeric(e.key)) {
      //   console.log('>>>>>>.');
      //   e.stopPropagation();
      // }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, isInputFocused]);
  const mappedChildren = tabs.map(tab => (
    <CommandItem
      key={tab.id}
      onSelect={() => {
        jump2Tab(tab);
      }}>
      <Calendar className="mr-2 h-4 w-4" />
      <div>
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
          commandProps={{ filter }}
          modal={false}
          open={isOpen}
          contentProps={{ container: container }}
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
