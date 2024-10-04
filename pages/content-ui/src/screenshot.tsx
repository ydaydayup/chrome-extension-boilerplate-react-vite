import html2canvas from 'html2canvas';
import { sendMessage } from '@src/extensonWrapper';
import { setTabDialogState, useTabDialogState } from '@src/state';

export async function SendCanvas2Background(tabs) {
  return sendMessage({ greeting: 'canvas2htmlSender', tabs });
}

export async function canvas2htmlSaver(tab: chrome.tabs.Tab) {
  return html2canvas(document.body, {
    x: window.scrollX,
    y: window.scrollY,
    width: window.innerWidth,
    height: window.innerHeight,
    // scrollY: -window.scrollY,
    // scrollX: 0,
    // windowHeight: window.innerHeight,
  }).then(function (canvas) {
    console.log({ canvas });
    const dataURL = canvas.toDataURL();
    return sendMessage({ greeting: 'canvas2htmlSaver', dataURL, tab });
  });
}

export async function canvas2htmlRetriever(tab: chrome.tabs.Tab) {
  const tabCanvas = await sendMessage({ greeting: 'canvas2htmlRetriever', tab });
  console.log({ tabCanvas });
  setTabDialogState({ tabCanvas, preview: tabCanvas[tab.id]?.dataURL });
}

// export async function getAllTabs() {
//   const tabs = (await sendMessage({ greeting: 'getAllTabs' })) as chrome.tabs.Tab[];
//   console.log({ tabs });
//   setTabDialogState({ tabs });
// }
