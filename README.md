# ARCH-06 · Atlas UI — CSS Architecture Rescue

Практическая работа № 6. Лобацкий Артём Сергеевич. Стек: HTML5, CSS layers/custom properties, JavaScript ES modules, Node.js. Все семь семейств и виджет подрядчика сохранены.

## Запуск

Node.js 18+ для приложения. Зависимости нужны только для инструментов проверки и DOCX.

```sh
npm ci
npm run dev
```

Откройте http://127.0.0.1:5173. Через file:// модули не запускаются.

## Проверки

```sh
npm test
npx playwright install chromium
npm run test:e2e
npm run test:all
```

На этой машине используется установленный Chrome. В PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL='chrome'
npm run test:e2e
```

Предоставленные 18 структурных и 6 браузерных тестов сохранены. Дополнительные проверки находятся в `tests/browser/regression.spec.js`: матрица состояний, контраст, клавиатура, вложенность, reduced-motion, paused, vendor-v2 и границы container query. CI устанавливает Chromium и выполняет обе группы.

## Архитектура и материалы сдачи

- [CSS API и ограничения](reports/CSS_API.md).
- [Аудит 18 причин и трассировки](reports/AUDIT.md).
- [ADR-001](reports/ADR.md).
- [Матрица сценариев с фактами до/после](reports/MATRIX.csv).
- [Регрессионный отчёт](reports/REGRESSION.md).
- [Стресс-сценарий A и diff](reports/STRESS_TEST.md).
- [Заполненный отчёт DOCX](reports/Отчёт_ARCH06_Лобацкий.docx).
- `reports/screenshots/before/` и `after/`: шесть ширин × две темы, снимки компонентов, состояний и настоящего Chrome DevTools.
- `reports/before.json`, `after.json`, `*-traces.json`, `reports/logs/`: сырые результаты и логи.

`@layer reset, legacy, tokens, base, components, states, utilities` задаёт порядок. Все импорты слоистые; vendor-v2 помещён в `legacy.vendor-v2` и ограничен `.legacy-widget`. Компонентные варианты имеют семейные имена. Валидация начинается после взаимодействия; checkbox остаётся нативным, dialog использует showModal().

Для повторной фиксации браузерных данных из корня проекта:

```sh
node tools/capture.mjs before
node tools/capture.mjs after
node tools/devtools.mjs
```

`before` воспроизводит исходники точного коммита `d069ef0` через перехват локальных HTTP-ответов. Текущее рабочее дерево не переключается. По умолчанию инструменты снимков используют установленный Chrome; для другого канала задайте PLAYWRIGHT_CHANNEL. Эти команды записывают новые доказательства, включая время и версию браузера.

Генерация отчёта с сохранением стилей предоставленного шаблона: `node tools/report.mjs <путь-к-шаблону.docx>`. Генератор использует Node.js и Open XML; отдельный исполняемый стек для отчёта не требуется.

## История и защита

Ветка `fix/css-architecture`; отдельные коммиты содержат исходное состояние, замеры, исправления, расширение и итоговые документы. Ревизия сдачи отмечена тегом `arch06-submission`. Выполнена самостоятельная репетиция конверта A; очная защита и peer-review другой командой не проводились. План показа — в DOCX и `reports/DEFENSE.md`.
