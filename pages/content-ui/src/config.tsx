'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@extension/ui';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, Input } from '@extension/ui';
import { toast } from '@extension/ui/lib/hooks/use-toast';
import { sendMessage } from '@src/extensonWrapper';
// import { Input } from "@/components/ui/input"

const FormSchema = z.object({
  datasetId: z.string().min(2, {
    message: 'datasetId must be at least 2 characters.',
  }),
});

export function InputForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      datasetId: '',
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    const databaseId = (await sendMessage({ greeting: 'datasetId', ...data })) as string;
    console.log(databaseId, '===============');

    toast({
      title: 'You submitted the following values:',
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
    });
  }

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
                className={'text-zinc-800 text-xs'}
                target="_blank"
                href="https://doc.tryfastgpt.ai/docs/development/openapi/dataset/#%E5%88%9B%E5%BB%BA%E4%B8%80%E4%B8%AA%E7%A9%BA%E7%9A%84%E9%9B%86%E5%90%88">
                (知识库ID获取文档)
              </a>
              <FormControl>
                <Input placeholder="知识库ID" {...field} />
              </FormControl>
              <FormDescription>
                {/*<Button variant="link">Link</Button>*/}
                {/*<Button asChild>*/}

                {/*</Button>*/}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className={'justify-self-end row-start-2'} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
}
