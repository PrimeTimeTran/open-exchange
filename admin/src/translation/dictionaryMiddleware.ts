import { AppContext } from 'src/shared/controller/appContext';
import { applyDayjsTranslation } from 'src/translation/applyDayjsTranslation';
import { getDictionary } from 'src/translation/getDictionary';

export async function dictionaryMiddleware(
  locale: any,
  context: Partial<AppContext>,
) {
  context.locale = locale;
  context.dictionary = await getDictionary(locale);
  applyDayjsTranslation(locale);
  return context as AppContext;
}
