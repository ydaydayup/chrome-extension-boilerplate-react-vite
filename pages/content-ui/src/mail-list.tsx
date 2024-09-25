import { Badge } from '@extension/ui';

export function Items({ items }: { items: { title: string; url: string }[] }) {
  const listItems = items.map(item => <Badge key={item.title}>{item.title}</Badge>);
  return listItems;
}
