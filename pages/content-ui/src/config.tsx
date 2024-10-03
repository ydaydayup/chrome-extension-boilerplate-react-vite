import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Button,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@extension/ui';
import { toast } from '@extension/ui/lib/hooks/use-toast';
import { sendMessage } from '@src/extensonWrapper';
import { createStorage, useStorageState } from '@src/state';
import React from 'react';
// import { Input } from "@/components/ui/input"

const FormSchema = z.object({
  datasetId: z.string().min(2, {
    message: 'datasetId must be at least 2 characters.',
  }),
});

export function InputForm() {
  const storage = useStorageState(state => state);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      datasetId: storage.datasetId || '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const datasetId = (await sendMessage({ greeting: 'datasetId', ...data })) as string;
    console.log(datasetId, 'datasetId');
    await createStorage();
    form.setValue('datasetId', datasetId);
    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

  const datasetIdInput = storage.datasetId ? '已配置datasetId，重新提交可以更新' : '请配置datasetId';
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 grid">
        <FormField
          control={form.control}
          name="datasetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>知识库ID</FormLabel>
              <a
                className={'text-muted-foreground text-xs'}
                target="_blank"
                href="https://doc.tryfastgpt.ai/docs/development/openapi/dataset/#%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E7%A9%BA%E7%9A%84%E9%9B%86%E5%90%88">
                (知识库ID获取文档)
              </a>
              <FormControl>
                <Input placeholder={datasetIdInput} {...field} />
              </FormControl>
              <FormDescription></FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className={'justify-self-end row-start-2'} type="submit">
          提交
        </Button>
      </form>
    </Form>
  );
}
