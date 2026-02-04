'use client';

import { Post } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PostForm } from 'src/features/post/components/PostForm';
import { postFindApiCall } from 'src/features/post/postApiCalls';
import { postLabel } from 'src/features/post/postLabel';
import { PostWithRelationships } from 'src/features/post/postSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function PostEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [post, setPost] = useState<PostWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setPost(undefined);
        const post = await postFindApiCall(id);

        if (!post) {
          router.push('/post');
        }

        setPost(post);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/post');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!post) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.post.list.menu, '/post'],
          [postLabel(post, context.dictionary), `/post/${post?.id}`],
          [dictionary.post.edit.menu],
        ]}
      />
      <div className="my-10">
        <PostForm
          context={context}
          post={post}
          onSuccess={(post: Post) => router.push(`/post/${post.id}`)}
          onCancel={() => router.push('/post')}
        />
      </div>
    </div>
  );
}
