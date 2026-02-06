'use client';
import Link from 'src/shared/components/Link';
import { LuChevronRight } from 'react-icons/lu';

type BreadcrumbItem = [string, string] | [string];

function Breadcrumb({ items }: { items: Array<BreadcrumbItem> }) {
  return (
    <ol className="flex items-center whitespace-nowrap">
      {items.map((item, index) => {
        const isFirst = index === 0;
        const isLast = items.length - 1 === index;

        return (
          <li
            key={item[0]}
            className={`${isLast ? 'font-semibold' : 'mr-1'} truncate`}
          >
            {!isFirst && (
              <LuChevronRight className="mr-1 inline-block h-4 w-4 font-normal text-muted-foreground" />
            )}
            {item.length > 1 ? (
              <Link
                className="text-muted-foreground hover:underline"
                href={item[1]!}
                prefetch={false}
              >
                {item[0]}
              </Link>
            ) : (
              <span>{item[0]}</span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default Breadcrumb;
