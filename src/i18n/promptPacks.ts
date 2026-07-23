import { registerPromptLocale } from '@/i18n/prompts';
import de from '@/i18n/prompts/de.json';
import es from '@/i18n/prompts/es.json';
import fr from '@/i18n/prompts/fr.json';
import hi from '@/i18n/prompts/hi.json';
import id from '@/i18n/prompts/id.json';
import it from '@/i18n/prompts/it.json';
import ja from '@/i18n/prompts/ja.json';
import ko from '@/i18n/prompts/ko.json';
import nl from '@/i18n/prompts/nl.json';
import pl from '@/i18n/prompts/pl.json';
import ptBR from '@/i18n/prompts/pt-BR.json';
import ru from '@/i18n/prompts/ru.json';
import tr from '@/i18n/prompts/tr.json';
import zhHans from '@/i18n/prompts/zh-Hans.json';

/**
 * Registers bundled prompt-translation packs with the resolver. English is the
 * source (no pack needed); each other locale that has been translated is added
 * here. Import this module once for its side effects (see i18n/index.ts).
 *
 * A locale not listed here simply falls back to English per prompt — safe and
 * intended while translation is in progress.
 */
registerPromptLocale('de', de);
registerPromptLocale('es', es);
registerPromptLocale('fr', fr);
registerPromptLocale('hi', hi);
registerPromptLocale('id', id);
registerPromptLocale('it', it);
registerPromptLocale('ja', ja);
registerPromptLocale('ko', ko);
registerPromptLocale('nl', nl);
registerPromptLocale('pl', pl);
registerPromptLocale('pt-BR', ptBR);
registerPromptLocale('ru', ru);
registerPromptLocale('tr', tr);
registerPromptLocale('zh-Hans', zhHans);
