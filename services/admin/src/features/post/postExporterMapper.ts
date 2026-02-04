import { PostWithRelationships } from 'src/features/post/postSchemas';
import { membershipLabel } from 'src/features/membership/membershipLabel';
import { AppContext } from 'src/shared/controller/appContext';
import { enumeratorLabel } from 'src/shared/lib/enumeratorLabel';
import { formatDecimal } from 'src/shared/lib/formatDecimal';
import { Locale } from 'src/translation/locales';

export function postExporterMapper(
  posts: PostWithRelationships[],
  context: AppContext,
): Record<string, string | null | undefined>[] {
  return posts.map((post) => {
    return {
      id: post.id,
      title: post.title,
      body: post.body,
      type: post.type?.join(', '),
      user: membershipLabel(post.user, context.dictionary),
      meta: post.meta?.toString(),
      createdByMembership: membershipLabel(post.createdByMembership, context.dictionary),
      createdAt: String(post.createdAt),
      updatedByMembership: membershipLabel(post.createdByMembership, context.dictionary),
      updatedAt: String(post.updatedAt),
      archivedByMembership: membershipLabel(
        post.createdByMembership,
        context.dictionary,
      ),
      archivedAt: String(post.archivedAt),
    };
  });
}
