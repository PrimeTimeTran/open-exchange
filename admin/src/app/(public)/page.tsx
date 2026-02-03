import { cookies } from 'next/headers';
import { appContextForReact } from 'src/shared/controller/appContext';
import { postFindManyPublicController } from 'src/features/post/controllers/postFindManyPublicController';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function PostsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const context = await appContextForReact(cookies());
  const { posts, count } = await postFindManyPublicController(
    searchParams,
    context,
  );

  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Posts ({count})</h2>
      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="rounded border bg-white p-4 shadow">
            <h3 className="text-xl font-semibold text-black">{post.title}</h3>
            <p className="mt-2 text-gray-600">{post.body}</p>
            {post.user && (
              <p className="mt-2 text-sm text-gray-400">
                By: {post.user.fullName || post.user.firstName}
              </p>
            )}
          </div>
        ))}
        {posts.length === 0 && <p>No posts found.</p>}
      </div>
    </div>
  );
}
