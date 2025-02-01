import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DndContext, DragOverlay, closestCenter, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  Dialog,
  DialogContent,
  lucide,
} from '@extension/ui';
import {
  createStorage,
  getActiveTab,
  initializeTabs,
  jump2Tab,
  removeTab,
  setTabDialogState,
  useStorageState,
  useTabDialogState,
} from '@src/state';
import { canvas2htmlRetriever } from '@src/screenshot';
import { generateBorderStyleForDomain, getDomain } from '../utils/tabs';

// const { CalendarIcon, RocketIcon } = lucide;

export function FavIconAvatar({
  favIconUrl,
  ...props
}: React.ComponentPropsWithoutRef<typeof Avatar> & {
  favIconUrl: string;
}) {
  return (
    <Avatar {...props}>
      <AvatarImage src={favIconUrl} alt="ICON" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}

function isAlphaNumeric(key: string) {
  // 不区分大小写的版本
  if (key.length !== 1) return false;
  return /^[A-Za-z0-9]+$/i.test(key);
}
// PreviewComponent 是一个可拖拽排序的标签页管理器组件
// 它使用 @dnd-kit 库实现拖放功能，支持标签页的水平排序
export function PreviewComponent() {
  const { isOpen, tabs } = useTabDialogState(state => state);
  const [isInputFocused, setIsInputFocused] = React.useState(true);
  // const activeTab = useRef<chrome.tabs.Tab | null>(null);
  const [container, setContainer] = React.useState<HTMLElement | null>(null);
  const { localStorage } = useStorageState(state => state);
  useEffect(() => {
    // 立即执行一次
    initializeTabs();

    // 设置定时器，每分钟执行一次
    const timer = setInterval(() => {
      console.log('[Tab Manager]', {
        event: 'auto_refresh_tabs',
        timestamp: new Date().toISOString(),
      });
      initializeTabs();
    }, 1000); // 60000ms = 1分钟

    // 清理函数
    return () => {
      clearInterval(timer);
      console.log('[Tab Manager]', {
        event: 'clear_refresh_timer',
        timestamp: new Date().toISOString(),
      });
    };
  }, []); // 空依赖数组，只在组件挂载时执行

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // 是输入状态 或者 是字母 阻止默认行为
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
        return;
      }
      if (isInputFocused || isAlphaNumeric(e.key)) {
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, isInputFocused]);

  const setOpen = (isOpen: boolean) => {
    // 永远设置为true
    isOpen = true;
    setTabDialogState({ isOpen });
  };
  const [commandListRef, setCommandListRef] = useState<HTMLDivElement | null>(null);

  // 当前正在拖动的标签页的 ID
  const [activeId, setActiveId] = useState<number | null>(null);

  // 配置拖动传感器
  // PointerSensor: 用于检测鼠标/触摸输入
  // activationConstraint.distance: 需要移动 8 像素才会触发拖动，防止误触
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // try {
  //   await chrome.tabs.move(active.id, { index: newIndex });
  // } catch (error) {
  //   console.error('移动标签页失败:', error);
  //   // If the move fails, roll back to the original state
  //   setTabDialogState({ tabs });
  // }
  // 处理拖动开始事件
  // const handleDragStart = useCallback((event: DragStartEvent) => {
  //   setActiveId(event.active.id);
  // }, []);

  // 处理拖动结束事件
  // 1. 更新本地状态
  // 2. 使用 Chrome API 移动标签页
  // const handleDragEnd = useCallback(async (event: DragEndEvent) => {
  //   const { active, over } = event;
  //
  //   if (over && active.id !== over.id) {
  //     const oldIndex = tabs.findIndex((tab) => tab.id === active.id);
  //     const newIndex = tabs.findIndex((tab) => tab.id === over.id);
  //
  //     // 更新本地状态
  //     const newTabs = arrayMove(tabs, oldIndex, newIndex);
  //     setTabDialogState({ tabs: newTabs });
  //
  //     try {
  //       // 使用 Chrome API 移动标签页
  //       // chrome.tabs.move 需要标签页 ID 和目标位置
  //       await chrome.tabs.move(active.id, { index: newIndex });
  //     } catch (error) {
  //       console.error('移动标签页失败:', error);
  //       // 如果移动失败，回滚本地状态
  //       setTabDialogState({ tabs });
  //     }
  //   }

  //   setActiveId(null);
  // }, [tabs]);

  const childrens = useMemo(() => {
    console.log('[Tab Manager]', {
      event: 'preview_tabs',
      timestamp: new Date().toISOString(),
    });

    const handleDragStart = (event: { active: { id: number } }) => {
      setActiveId(event.active.id);
    };

    const handleDragEnd = async (event: { active: { id: number }; over: { id: number } | null }) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = tabs.findIndex(tab => tab.id === active.id);
        const newIndex = tabs.findIndex(tab => tab.id === over.id);

        const newTabs = arrayMove(tabs, oldIndex, newIndex);
        try {
          // 使用 Chrome API 移动标签页
          // chrome.tabs.move 需要标签页 ID 和目标位置
          await chrome.tabs.move(active.id, { index: newIndex });
          setTabDialogState({ tabs: newTabs });
          setActiveId(null);
        } catch (error) {
          console.error('移动标签页失败:', error);
          // 如果移动失败，回滚本地状态
          setTabDialogState({ tabs });
          return;
        }
      }
    };
    const PreviewTabsWithDataURL = [];
    const PreviewTabsWithoutDataURL = [];
    for (const tab of tabs) {
      if (localStorage?.[tab.id!]?.dataURL) {
        PreviewTabsWithDataURL.push(tab);
      } else {
        PreviewTabsWithoutDataURL.push(tab);
      }
    }
    const previewTabs = [...PreviewTabsWithDataURL, ...PreviewTabsWithoutDataURL].filter(t => t.id);
    // const domains = new Set(previewTabs.map(tab => getDomain(tab.url || '')));
    // 创建域名到颜色的映射
    // 计算每个域名出现的次数
    const domainCounts = tabs.reduce(
      (acc, tab) => {
        const domain = getDomain(tab.url || '');
        acc[domain] = (acc[domain] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    // 函数：获取数量大于 1 的键的个数
    function getCountOfUrlsWithFrequencyGreaterThanOne(data) {
      let count = 0;
      for (const url in data) {
        if (data[url] > 1) {
          count++;
        }
      }
      return count;
    }
    // 获取域名总数
    const duplicateDomain = getCountOfUrlsWithFrequencyGreaterThanOne(domainCounts);
    // Object.keys(domainCounts).length;
    // SortableTabProps 定义了可拖拽标签页组件所需的属性
    // tab: 标签页数据
    // style: 样式对象，包含位置和边框样式
    // previewUrl: 标签页预览图的 URL
    // favIconUrl: 标签页图标的 URL
    interface SortableTabProps {
      tab: (typeof tabs)[0];
      style: React.CSSProperties;
      previewUrl: string;
      favIconUrl: string;
    }

    // SortableTab 是一个可拖拽的标签页组件
    // 使用 useSortable 钩子来实现拖拽功能
    // attributes: 需要应用到可拖拽元素的属性
    // listeners: 需要应用到可拖拽元素的事件监听器
    // setNodeRef: 用于设置可拖拽元素的 ref
    // transform: 当前变换，用于在拖动时移动元素
    // transition: 当前过渡，用于平滑动画
    const SortableTab = ({ tab, style, previewUrl, favIconUrl }: SortableTabProps) => {
      const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: tab.id });
      // 合并原有样式和拖拽相关的样式
      const sortableStyle = {
        ...style,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
      };

      return (
        <CommandItem
          ref={setNodeRef}
          {...attributes}
          {...listeners}
          data-tab={tab.id}
          data-title={tab.title}
          data-url={tab.url}
          style={sortableStyle}
          className={`!p-0 cursor-pointer grid grid-cols-2 grid-row-2 w-full whitespace-nowrap overflow-hidden text-ellipsis place-items-start content-start ${previewUrl ? 'row-span-2' : ''}`}
          onMouseDown={(e: React.MouseEvent) => {
            const tabId = parseInt(e.currentTarget.getAttribute('data-tab') || '0', 10);
            if (e.button === 1 && tabId) {
              e.preventDefault();
              removeTab(tabId).then(() => {
                setTabDialogState({ tabs: tabs.filter(t => t.id !== tabId) });
              });
            }
          }}
          onSelect={() => {
            jump2Tab(tab).then(() => {
              setOpen(false);
            });
          }}>
          <div className={'row-span-1 col-span-2 gap-x-1 items-center grid grid-cols-[auto_1fr]'}>
            <FavIconAvatar favIconUrl={favIconUrl} className={'row-start-1 w-4 h-4'} />
            <span className={'row-start-1 text-xs'}>{tab.title || ''}</span>
            <div className={'hidden row-start-1'}>{tab.id || ''}</div>
          </div>
          <div className={'col-start-1 col-span-2'} style={{ fontSize: '0.6rem' }}>
            {tab.url || ''}
          </div>
          {previewUrl && <img className={'col-start-1 col-span-2'} alt="Logo" src={previewUrl} />}
          <div className="flex gap-2 items-center">
            <Badge variant="outline" style={{ fontSize: '0.6rem' }} className="px-1.5 py-0.5 text-[15px] font-normal">
              {`窗口 ${tab.windowGroup}`}
            </Badge>
            {tab.selected && (
              <Badge
                variant="destructive"
                style={{ fontSize: '0.6rem' }}
                className="px-1.5 py-0.5 text-[15px] font-normal">
                当前标签页
              </Badge>
            )}
          </div>
        </CommandItem>
      );
    };

    // 创建拖放上下文，管理整个拖放操作
    // sensors: 配置的传感器，用于检测拖动操作
    // collisionDetection: 使用 closestCenter 算法进行碰撞检测
    // onDragStart: 开始拖动时的回调
    // onDragEnd: 结束拖动时的回调
    const mappedChildren = (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <SortableContext items={previewTabs.map(tab => tab.id)} strategy={horizontalListSortingStrategy}>
          {previewTabs.map((tab, index, array) => {
            const favIconUrl = tab.favIconURL || tab.favIconUrl || '';
            const previewUrl = localStorage?.[tab.id!]?.dataURL || '';
            const domain = getDomain(tab.url || '');
            const domainFrequency = domainCounts[domain] || 0;
            const borderStyle = generateBorderStyleForDomain(domain, duplicateDomain, domainFrequency);

            const style: React.CSSProperties = {
              position: 'relative',
              borderRadius: '4px',
            };
            if (borderStyle.colors.length > 0) {
              // 生成多层边框的样式
              const borderStyles = borderStyle.colors.map((color, index) => {
                const offset = (index + 1) * 2; // 每个边框之间的间距
                return `${color} 0 0 0 ${offset}px`;
              });

              style.margin = `${borderStyle.count * 3}px`;
              style.boxShadow = borderStyles.join(', ');
            }
            console.log('style', style);
            return <SortableTab tab={tab} style={style} previewUrl={previewUrl} favIconUrl={favIconUrl} />;
          })}
        </SortableContext>
      </DndContext>
    );

    return mappedChildren;
  }, [localStorage, tabs, activeId]);

  // const filter = useCallback((value: string, search: string, keywords?: string[]) => {
  //   if (!search) return true;
  //   const searchLower = search.toLowerCase();
  //   const valueLower = value.toLowerCase();
  //
  //   if (keywords && keywords.length > 0) {
  //     return keywords.some(keyword => valueLower.includes(keyword.toLowerCase()));
  //   }
  //
  //   return valueLower.includes(searchLower);
  // }, [localStorage, tabs, activeId]);

  // }, [localStorage, tabs, activeId]);
  // filter 函数用于过滤搜索结果
  // value: 要搜索的文本
  // search: 搜索关键词
  // keywords: 可选的额外关键词数组
  const filter = useCallback((value: string, search: string, keywords?: string[]) => {
    // 将搜索文本和额外关键词合并，并转换为小写
    const extendValue = (value + ' ' + (keywords ? keywords.join(' ') : '')).toLowerCase();
    // 将搜索关键词分割为数组并转换为小写
    const searchKey = search.toLowerCase().split(' ');
    if (
      searchKey.every(key => {
        return extendValue.includes(key);
      })
    )
      return 1;
    return 0;
  }, []);

  return (
    <>
      <div className={'text-primary group large-panel alt-tab'} ref={setContainer}>
        <CommandDialog
          commandProps={{ filter }}
          modal={false}
          open={isOpen}
          contentProps={{
            portalProps: {
              container: container,
            },
            className: 'command-dialog ',
          }}
          onOpenChange={setOpen}>
          <CommandInput
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Type a command or search..."
          />
          <CommandList
            className={'max-h-[80svh] group-[.large-panel]:max-w-svh group-[.large-panel]:max-h-lvh'}
            ref={setCommandListRef}>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className={'group-[.large-panel]:max-w-[svw]'} heading={'tabs'}>
              {childrens}
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </div>
    </>
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
    // 打开面板会默认选中第一个 获取image
    const tabId = tabs[0].id;
    getActiveTab().then(tab => {
      activeTab.current = tab;
      if (activeTab.current && tabId! === activeTab.current?.id) {
        return;
      }
      canvas2htmlRetriever({ id: tabs[0].id as number });
    });
  }, [isOpen]);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // 是输入状态 或者 是字母 阻止默认行为
      if (e.key === 'Escape' && isOpen) {
        setOpen(false);
        return;
      }
      if (isInputFocused || isAlphaNumeric(e.key)) {
        e.stopPropagation();
      }
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
          if (tabId === null) {
            return;
          }
          if (activeTab.current && tabId === (activeTab.current?.id as number).toString()) {
            setTabDialogState({ preview: '', previewTitle: '', previewUrl: '' });
            return;
          }
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
      className={
        'cursor-pointer grid grid-cols-2 group-[.large-panel]:max-w-80 group-[.large-panel]:overflow-hidden whitespace-nowrap text-ellipsis'
      }
      onMouseDown={(e: React.MouseEvent) => {
        // 检查是否是鼠标中键（button 属性为 1 表示中键）
        // console.log({ e });
        const tabId = parseInt(e.currentTarget.getAttribute('data-tab') || '0', 10);
        if (e.button === 1 && tabId) {
          e.preventDefault(); // 阻止默认行为
          // 在这里添加关闭标签页的逻辑
          removeTab(tabId).then(() => {
            // typescript 实现遍历数组，删除tabid
            setTabDialogState({ tabs: tabs.filter(tab => tab.id !== tabId) });
          });
        }
      }}
      onSelect={() => {
        jump2Tab(tab).then(() => {
          setOpen(false);
        });
      }}>
      <div className={'row-start-1 col-span-2 gap-x-1 items-center grid grid-cols-[auto_1fr]'}>
        <FavIconAvatar
          favIconUrl={tab.favIconURL || tab.favIconUrl || ''}
          className={'row-start-1 w-4 h-4'}></FavIconAvatar>
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
      <div className={'text-primary group large-panel'} ref={setContainer}>
        <CommandDialog
          commandProps={{ filter }}
          modal={false}
          open={isOpen}
          contentProps={{
            portalProps: {
              container: container,
            },
            className: 'command-dialog ',
          }}
          onOpenChange={setOpen}>
          <CommandInput
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder="Type a command or search..."
          />
          <CommandList
            className={'max-h-[80svh] group-[.large-panel]:max-w-svh group-[.large-panel]:max-h-lvh'}
            ref={setCommandListRef}>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className={'group-[.large-panel]:max-w-[svw]'} heading={'tabs'}>
              {mappedChildren}
            </CommandGroup>
            {/*<div>            {mappedChildren}*/}
            {/*</div>*/}
            {/*<CommandGroup heading="Suggestions">*/}
            {/*  <CommandItem>*/}
            {/*    <CalendarIcon className="mr-2 h-4 w-4" />*/}
            {/*    <span>Calendar</span>*/}
            {/*  </CommandItem>*/}
            {/*  <CommandItem>*/}
            {/*    <CalendarIcon className="mr-2 h-4 w-4" />*/}
            {/*    <span>Search Emoji</span>*/}
            {/*  </CommandItem>*/}
            {/*  <CommandItem disabled>*/}
            {/*    <RocketIcon className="mr-2 h-4 w-4" />*/}
            {/*    <span>Launch</span>*/}
            {/*  </CommandItem>*/}
            {/*</CommandGroup>*/}
            {/*<CommandSeparator />*/}
            {/*<CommandGroup heading="Settings">*/}
            {/*  <CommandItem>*/}
            {/*    <CalendarIcon className="mr-2 h-4 w-4" />*/}
            {/*    <span>Profile</span>*/}
            {/*    <CommandShortcut>⌘P</CommandShortcut>*/}
            {/*  </CommandItem>*/}
            {/*  <CommandItem>*/}
            {/*    <CalendarIcon className="mr-2 h-4 w-4" />*/}
            {/*    <span>Mail</span>*/}
            {/*    <CommandShortcut>⌘B</CommandShortcut>*/}
            {/*  </CommandItem>*/}
            {/*  <CommandItem>*/}
            {/*    <CalendarIcon className="mr-2 h-4 w-4" />*/}
            {/*    <span>Settings</span>*/}
            {/*    <CommandShortcut>⌘S</CommandShortcut>*/}
            {/*  </CommandItem>*/}
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
      <PreviewComponent></PreviewComponent>
      {/*<SearchComponent></SearchComponent>*/}
      {/*<Preview></Preview>*/}
    </>
  );
}

// 添加一个获取域名的工具函数
