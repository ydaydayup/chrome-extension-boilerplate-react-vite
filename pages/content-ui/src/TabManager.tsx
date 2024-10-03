import React, { useCallback, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
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

  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'j' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
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
  return (
    <>
      <div className={'dark text-primary'} ref={setContainer}>
        {/*<p className="text-sm text-muted-foreground">*/}
        {/*  Press{' '}*/}
        {/*  <kbd*/}
        {/*    className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">*/}
        {/*    <span className="text-xs">⌘</span>J*/}
        {/*  </kbd>*/}
        {/*</p>*/}
        <CommandDialog modal={false} open={isOpen} contentProps={{ container: container }} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading={'tabs'}>{mappedChildren}</CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </>
  );
}
