import { PostWithRelationships } from 'src/features/post/postSchemas';
import { PostForm } from 'src/features/post/components/PostForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function PostFormSheet({
  post,
  context,
  onCancel,
  onSuccess,
}: {
  post?: Partial<PostWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (post: PostWithRelationships) => void;
}) {
  return (
    <Sheet
      open={true}
      onOpenChange={(open) => (!open ? onCancel() : null)}
      modal={true}
    >
      <SheetContent className="overflow-y-scroll sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {post?.id
              ? context.dictionary.post.edit.title
              : context.dictionary.post.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <PostForm
            post={post}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
