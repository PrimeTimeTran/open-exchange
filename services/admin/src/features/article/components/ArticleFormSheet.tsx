import { ArticleWithRelationships } from 'src/features/article/articleSchemas';
import { ArticleForm } from 'src/features/article/components/ArticleForm';
import { AppContext } from 'src/shared/controller/appContext';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from 'src/shared/components/ui/sheet';

export function ArticleFormSheet({
  article,
  context,
  onCancel,
  onSuccess,
}: {
  article?: Partial<ArticleWithRelationships>;
  context: AppContext;
  onCancel: () => void;
  onSuccess: (article: ArticleWithRelationships) => void;
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
            {article?.id
              ? context.dictionary.article.edit.title
              : context.dictionary.article.new.title}
          </SheetTitle>
        </SheetHeader>

        <div className="pt-8">
          <ArticleForm
            article={article}
            context={context}
            onCancel={onCancel}
            onSuccess={onSuccess}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
