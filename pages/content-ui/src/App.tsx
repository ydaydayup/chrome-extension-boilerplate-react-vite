import React from 'react';
import { BookmarkCollection } from '@src/BookmarkCollection';
import { SearchComponent } from '@src/TabManager';

export default function App() {
  return (
    <div>
      <BookmarkCollection></BookmarkCollection>
      <SearchComponent></SearchComponent>
      {/*<div className={"h-20 w-20 bg-green-300 overflow-y-scroll"}>*/}
      {/*  <div className={"h-60 w-20 bg-green-30"}></div>*/}
      {/*</div>*/}
    </div>
  );
}
