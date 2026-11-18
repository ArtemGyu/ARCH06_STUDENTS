# Регрессионный отчёт · ARCH-06

Дата: 18.11.2026. Код: 5b7a133; ветка fix/css-architecture; итоговый тег arch06-submission. ОС Windows; Node v26.13.1; Chrome 157.0.8103.79; deviceScaleFactor=1. Тестирование локально, по http://127.0.0.1:5173.

## Результаты

| Проверка | До | После | Доказательство |
|---|---|---|---|
| npm test | 4/18, 14 FAIL | 18/18, 0 FAIL | logs/baseline-tests.txt; logs/final-structure.txt |
| Предоставленные ui.spec.js | 1/6 | 6/6 сохранённых сценариев | logs/baseline-playwright-results.json; logs/final-playwright-results.json |
| npm run test:e2e | Исходный набор: 6 | 84/84, 0 FAIL (6 исходных + 78 дополнительных) | logs/final-e2e.txt |
| Матрица состояний | 25/72 | 72/72 | before.json; after.json; MATRIX.csv |
| Геометрия | 8/12; overflow 320/375 в обеих темах | 12/12; нет overflow | screenshots/before; screenshots/after |
| Текстовые пары тегов/alert | Часть dark-пар не читается | Все >=4.5:1; минимум 5.00:1 | S19–S23; regression.spec.js |
| Paused / vendor-v2 / container widths | Режимы отсутствовали | 6 дополнительных тестов, 2 темы | STRESS_TEST.md; CSS_API.md |

## Шесть ширин × две темы

| Тема | Viewport px | scrollWidth до | scrollWidth после | Результат |
|---|---|---|---|---|
| light | 320 | 380 | 320 | OK |
| light | 375 | 380 | 375 | OK |
| light | 768 | 768 | 768 | OK |
| light | 1024 | 1024 | 1024 | OK |
| light | 1440 | 1440 | 1440 | OK |
| light | 1920 | 1920 | 1920 | OK |
| dark | 320 | 380 | 320 | OK |
| dark | 375 | 380 | 375 | OK |
| dark | 768 | 768 | 768 | OK |
| dark | 1024 | 1024 | 1024 | OK |
| dark | 1440 | 1440 | 1440 | OK |
| dark | 1920 | 1920 | 1920 | OK |

## Клавиатура и вложенность

Tab/Shift+Tab, Space, Enter, Escape и возврат фокуса проверены. :modal и inert-фон обеспечивает native dialog; цикл фокуса подтверждён. Invalid после blur, исправленный email, submit Enter, disabled checkbox, alerts и виджет работают. В каждой теме: 200 символов заголовка без пробелов, 100 символов кнопки, nested alert typography, nested card ownership.

Reduced-motion эмулируется через prefers-reduced-motion: reduce; transitionDuration=0s и отсутствие hover-transform проверены по computed. Checkbox checked продолжает менять положение. Контрастный тест оценивает sRGB luminance непрозрачных computed-пар и не заменяет аудит доступности.

## Доказательства

12 полных снимков после на 320/375/768/1024/1440/1920 в light/dark, дополнительно компоненты на 375px, dialog.png, S11/S16/S25/S27/S31 и настоящие DevTools Styles/Computed для primary, danger-tag, required и danger-button. CDP-данные: before-traces.json / after-traces.json. Исходные тесты неизменны относительно d069ef0.

## Три ограничения

1. Автоматизация выполнена в Chromium/Chrome; Firefox, Safari, screen reader и визуальная оценка пользователем не проверены. Их следует добавить перед промышленной поставкой.
2. Layers и префикс vendor работают при соблюдении точки импорта. Новый unlayered CSS или important способен нарушить контракт; CI и ревью должны блокировать такие изменения.
3. Контраст рассчитан для непрозрачных computed RGB-пар и не доказывает весь WCAG. Нет автоматической пиксельной эталонной регрессии; шрифты и версия браузера влияют на снимки.

## До / после

Primary: background rgb(41,57,168) и padding-left 10.4px из unlayered vendor → фон темы и единая база. На 320px scrollWidth 380 → 320; на 375px 380 → 375. Все результаты отражают локальный прогон; CI на GitHub оценивается по фактическому workflow.
