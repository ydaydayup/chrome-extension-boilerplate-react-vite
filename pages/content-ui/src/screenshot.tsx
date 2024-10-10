import { sendMessage } from '@src/extensonWrapper';
import { setTabDialogState } from '@src/state';
import * as htmlToImage from 'html-to-image';
import download from 'downloadjs';
// import { toPng, toJpeg, toBlob, toPixelData, toSvg, download } from 'html-to-image';

// export async function SendCanvas2Background(tabs) {
//   return sendMessage({ greeting: 'canvas2htmlSender', tabs });
// }

// export async function canvas2htmlSaver(tab: chrome.tabs.Tab) {
//   return html2canvas(document.body, {
//     // x: window.scrollX,
//     // y: window.scrollY,
//     // width: window.innerWidth,
//     // height: window.innerHeight,
//     // useCORS: true,
//     // scrollY: -window.scrollY,
//     // scrollX: 0,
//     // windowHeight: window.innerHeight,
//   }).then(function(canvas) {
//     console.log({ canvas });
//     const dataURL = canvas.toDataURL();
//     return sendMessage({ greeting: 'canvas2htmlSaver', dataURL, tab });
//   });
// }

export async function canvas2htmlSaver(tab: chrome.tabs.Tab) {
  return htmlToImage
    .toPng(document.body, {
      width: window.innerWidth,
      height: window.innerHeight,
    })
    .then(function (dataURL) {
      return sendMessage({ greeting: 'canvas2htmlSaver', dataURL, tab });
    });
}

export async function canvas2htmlRetriever(tab: { id: number }) {
  const tabCanvas = (await sendMessage({ greeting: 'canvas2htmlRetriever', tab })) as { number: { dataURL: string } };
  console.log({ tabCanvas });
  setTabDialogState({ tabCanvas, preview: tabCanvas[tab.id]?.dataURL });
}
