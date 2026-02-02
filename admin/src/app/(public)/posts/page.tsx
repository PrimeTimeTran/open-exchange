import { cookies } from 'next/headers';
import { postFindManyPublicController } from 'src/features/post/controllers/postFindManyPublicController';
import { appContextForReact } from 'src/shared/controller/appContext';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
      <h2 className="text-2xl font-bold mb-4">Posts ({count})</h2>
      <div className="grid gap-4">
        {posts.map((post) => (
          <div key={post.id} className="p-4 border rounded shadow bg-white">
            <h3 className="text-xl font-semibold text-black">{post.title}</h3>
            <p className="text-gray-600 mt-2">{post.body}</p>
            {post.user && (
              <p className="text-sm text-gray-400 mt-2">
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
