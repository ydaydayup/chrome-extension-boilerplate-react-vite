import { sendMessage } from '@src/extensonWrapper';
import { setTabDialogState } from '@src/state';

export async function canvas2htmlRetriever(tab: { id: number }) {
  const tabCanvas = (await sendMessage({ greeting: 'canvas2htmlRetriever', tab })) as { number: { dataURL: string } };
  console.log({ tabCanvas });
  setTabDialogState({ tabCanvas, preview: tabCanvas[tab.id]?.dataURL });
}
