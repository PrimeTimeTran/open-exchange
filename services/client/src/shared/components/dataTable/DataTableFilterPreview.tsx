import { FaChevronDown, FaChevronRight, FaTimes } from 'react-icons/fa';
import { Dictionary } from 'src/translation/locales';

export default function FilterPreview({
  values,
  renders,
  onClick,
  onRemove,
  expanded,
  dictionary,
}: {
  values: { [key: string]: any };
  renders: {
    [key: string]: {
      label: string;
      render?: (val: any) => string | number | boolean | undefined | null;
    };
  };
  onClick: any;
  onRemove: (key: string) => any;
  expanded: boolean;
  dictionary: Dictionary;
}) {
  const itemsNotEmpty = Object.keys(values || {})
    .map((key) => {
      if (!renders[key]) {
        return {
          value: null,
        };
      }

      return {
        key: key,
        label: renders[key].label,
        value: renders[key]?.render
          ? renders[key].render!(values[key])
          : values[key],
      };
    })
    .filter((item) => item.value || item.value === 0 || item.value === false);

  return (
    <div
      onClick={onClick}
      className={`${
        expanded ? 'border-b' : ''
      } flex cursor-pointer items-center justify-between p-2 px-4`}
    >
      {!itemsNotEmpty.length || expanded ? (
        <div className="flex items-center text-sm font-medium">
          {dictionary.shared.dataTable.filters}
        </div>
      ) : (
        <div className="flex items-center">
          <span className="text-sm font-medium">
            {dictionary.shared.dataTable.filters}
          </span>
          :
          <span className="ml-2 flex flex-wrap justify-start gap-1">
            {itemsNotEmpty.map((item) => (
              <span
                key={item.label}
                className="flex items-center rounded-md bg-gray-700 p-1 text-xs text-white"
                style={{ cursor: 'default' }}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                {`${item.label}: ${item.value}`}{' '}
                {onRemove && (
                  <button onClick={() => onRemove(item.key!)} className="ml-1">
                    <FaTimes
                      className="rounded-full bg-gray-900"
                      style={{ padding: 2 }}
                    />
                  </button>
                )}
              </span>
            ))}
          </span>
        </div>
      )}

      <div className="text-sm text-muted-foreground">
        {expanded ? <FaChevronRight /> : <FaChevronDown />}
      </div>
    </div>
  );
}
