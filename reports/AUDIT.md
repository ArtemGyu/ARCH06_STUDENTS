# Аудит CSS-архитектуры · ARCH-06

Автор: Лобацкий Артём Сергеевич. Группа не указана. Репозиторий: https://github.com/ArtemGyu/ARCH06_STUDENTS. Baseline: d069ef0. Проверенный код: 5b7a133.

## Гипотеза и проверка до правок

Конфликт вызван сочетанием unlayered vendor, важных объявлений, общих классов состояний и селекторов потомков. Слои управляют приоритетом normal-объявлений, но не заменяют область действия, токены и нативную семантику. До изменения кода записаны CDP matched rules/computed и три требуемые трассировки. До: 4/18 структурных, 1/6 исходных браузерных, 25/72 расширенных сценариев; overflow 380px при 320/375px в обеих темах.

## Независимые причины

| ID | Симптом | Источник baseline / свойство | Почему выиграло / первопричина | Исправление | Проверка |
|---|---|---|---|---|---|
| A-01 | Фон primary = rgb(41,57,168), а не акцент темы | css/app.css:3; background-color | Обычные author rules без слоя сильнее всех normal author layers; specificities сравниваются позже. | Импортировать legacy.css в layer(legacy). | S01; тест 02 |
| A-02 | Vendor меняет радиус всех button и кнопки внутри workbench | css/legacy.css:2; border-radius / background / padding | Глобальный button и #workbench .ui-button пересекают границу интеграции; ID даёт 1-1-0, но решающим для фона был unlayered. | Префикс .legacy-widget, оставить .legacy-action и оформление виджета. | S01–S04, S32; тест 18 |
| A-03 | Danger button остаётся красной vendor даже при смене темы | css/legacy.css:4; background-color | Author important сильнее normal независимо от слоя; перевод vendor в ранний слой сам по себе не устраняет это. | Удалить конфликтующее важное объявление, использовать семейный токен. | S04–S05; тест 03 |
| A-04 | Метка и alert получают оформление опасной кнопки | css/states.css:11; background / color | Общий класс совпадает с несколькими семействами; states позднее components. Для color дополнительно побеждает unlayered legacy .is-danger. | ui-button--danger / ui-tag--danger / ui-alert--danger; убрать служебный класс из HTML. | S18, S23; тесты 08,17 |
| A-05 | Пустое required поле красное до blur | css/states.css:9; border-color / background | Пустое required уже :invalid; правило states сильнее базы components ещё до взаимодействия. | JS устанавливает aria-invalid после blur/submit; :has() ограничен владельцем поля. | S10–S12; тест 09 |
| A-06 | Поле шире доступного мобильного трека | css/components.css:12; min-width | 320px минимум поля превышает внутреннюю ширину формы; width:100% не отменяет min-width. | min-width:0 у поля и flex/grid-ребёнка. | Viewport 320/375; тест 10 |
| A-07 | Карточки расширяют страницу до 380px на viewport 320px | css/components.css:17; min-width | 352px минимум карточки плюс отступы не помещается в узкую сетку. | min-width:0, minmax(0,1fr), overflow-wrap:anywhere, ограничение кнопки. | S14–S15, viewport; тест 10 |
| A-08 | Checkbox отсутствует в клавиатурной навигации | css/components.css:44; display | display:none убирает нативный checkbox из layout и дерева доступности; JS не может исправить Tab CSS-маскировкой. | Визуально скрыть 1px absolute input с clip-path, сохранить disabled и label. | S25–S26; тест 06 |
| A-09 | Авторское правило убирает контур фокуса кнопки | css/states.css:6; outline | outline:none описывает весь focus, а не различает указатель и клавиатуру; полагаться на UA-обходы некорректно. | Явный .ui-button:focus-visible и контур трека checkbox, полей, dismiss. | S06,S25,S35; тест 05 |
| A-10 | Открытый dialog не соответствует :modal, Escape не закрывает | js/app.js:15; HTML dialog mode | show() открывает немодально, фон остаётся доступен; CSS backdrop не создаёт модальность. | showModal(); native method=dialog; явный возврат фокуса инициатору. | S27–S30; тест 04 |
| A-11 | Вложенный alert: текст 11.04px против отдельных 13.28px | css/legacy.css:6; font-size / color | Unlayered .ui-card p побеждает компонент alert; даже после layering .ui-card p в components напрямую задаёт цвет вместо наследования роли alert. | Убрать vendor-нацеливание; .ui-card > p, прямые заголовки и собственные слоты. | S16–S17 |
| A-12 | Теги получают padding-inline:1rem с неожиданной специфичностью | css/states.css:12; padding-inline | Максимум аргументов :is() включает ID; весь селектор имеет 1-1-0 даже внутри карточки. На background он не влияет. | Удалить зависимость от ID; сохранить одинаковый публичный контракт тега. | CDP danger-tag; тест 13 |
| A-13 | Фон primary/danger задан отдельно от таблицы тем | css/components.css:4; background-color | Жёсткие цвета вариантов не меняются вместе с семантическими токенами, даже если устранить vendor. | var(--color-accent), var(--color-danger), контрастные ink/hover токены обеих тем. | S01,S04,S33; тест 07 |
| A-14 | Два базовых блока ui-button конфликтуют внутри components | css/components.css:3; padding-inline | При одинаковом слое и специфичности более поздняя база меняет padding с 1.1rem на 1.25rem, контракт размыт. | Объединить единственный базовый блок и документировать размеры sm/md/lg. | S09; тест 11 |
| A-15 | Неинтерактивный tag реагирует на hover как кнопка | css/states.css:13; cursor / filter | Безусловный states-селектор задаёт pointer и brightness текстовой метке без действия. | Убрать интерактивные состояния; оставить span без tabindex. | S18 |
| A-16 | При reduced-motion продолжаются переходы кнопки и thumb | css/components.css:2; transition / transform | Нет media-правила для пользовательской настройки reduce; базовые переходы действуют всегда. | В states отключить transition и hover-сдвиг; checked-позицию thumb сохранить. | S31; тест 12 |
| A-17 | Ошибка отмечается цветом, а hint остаётся нейтральным | js/app.js:20; aria-invalid / describedby / textContent | JS переключает только aria-invalid и не объясняет, что исправить; name не связан с hint. | Единая validate(): понятные сообщения; describedby для обоих полей; корректное значение восстанавливает hint. | S10–S13; index.html |
| A-18 | После submit фокус остаётся на email, хотя ошибка начинается с имени | js/app.js:25; document.activeElement | Обработчик сообщает общую ошибку, но не направляет пользователя к первому неверному полю. | Проверить все required, затем invalid[0].focus(). | S13 |

## Три трассировки каскада

### Primary button внутри #workbench

Элемент: `#buttons .ui-button--primary`; свойство: background-color.

components: .ui-button--primary (0-1-0); legacy без слоя: #workbench .ui-button (1-1-0). Оба author normal.

До: unlayered normal побеждает layered normal до сравнения специфичности. После: vendor ограничен .legacy-widget и больше не совпадает; фон задаёт components через --color-accent. Порядок в файле не компенсирует более сильную категорию каскада.

До: background-color=rgb(41, 57, 168); padding-left=10.4px. После: background-color=rgb(54, 89, 217); padding-left=20px.

[Styles до](screenshots/before/devtools-primary-styles.png), [Styles после](screenshots/after/devtools-primary-styles.png), [Computed до](screenshots/before/devtools-primary-computed.png), [Computed после](screenshots/after/devtools-primary-computed.png).

### Danger tag во вложенной карточке

Элемент: `.ui-card .ui-tag--danger`; свойство: background-color / color / padding-inline.

components: .ui-tag--danger (0-1-0); states: .is-danger (0-1-0); legacy без слоя: .is-danger (0-1-0). Padding: :is(.ui-card, #workbench) .ui-tag (1-1-0).

До: фон выигрывает .is-danger в states, цвет — unlayered legacy .is-danger; :is() меняет только padding. После: совпадает семейный ui-tag--danger в components, использующий danger/danger-bg. Модификатор кнопки не влияет на метку.

До: color=rgb(255, 255, 255); background-color=rgb(193, 34, 54); padding-left=16px. После: color=rgb(187, 40, 58); background-color=rgb(255, 240, 242); padding-left=10.4px.

[Styles до](screenshots/before/devtools-danger-tag-styles.png), [Styles после](screenshots/after/devtools-danger-tag-styles.png), [Computed до](screenshots/before/devtools-danger-tag-computed.png), [Computed после](screenshots/after/devtools-danger-tag-computed.png).

### Required email до взаимодействия

Элемент: `#user-email`; свойство: border-top-color / background-color.

components: .ui-field input (0-1-1); states: .ui-field:has(input:invalid) input (0-2-2). Оба author normal, states позднее components.

До: required уже невалиден при загрузке, поэтому states немедленно задаёт красную границу. После: :has(input[aria-invalid="true"]) срабатывает только после blur/submit; untouched поле остаётся на базе components. Исправление специфичности без UX-логики не решило бы проблему.

До: background-color=rgb(255, 240, 242); border-top-color=rgb(180, 35, 54). После: background-color=rgb(255, 255, 255); border-top-color=rgb(123, 137, 164).

[Styles до](screenshots/before/devtools-required-styles.png), [Styles после](screenshots/after/devtools-required-styles.png), [Computed до](screenshots/before/devtools-required-computed.png), [Computed после](screenshots/after/devtools-required-computed.png).

## Важность и границы решения

Danger button до исправления: #workbench .ui-button.is-danger (1-2-0), author important, без слоя: background-color rgb(164,30,36). При переносе такого объявления в ранний legacy оно продолжило бы побеждать normal. Среди important приоритет слоёв обратный: ранний слой сильнее позднего; layered important сильнее unlayered important. Поэтому конфликт удалён у источника, а не перекрыт новым important. См. screenshots/before/devtools-danger-button-styles.png и before-traces.json.

Модальность, сообщения об ошибке и возврат фокуса относятся к JS/HTML. Адаптивность требует исправить min-width и переносы. Слои сами по себе не решают эти дефекты. Исходные тесты не изменялись; git diff d069ef0 -- tests/architecture.test.mjs tests/browser/ui.spec.js пуст.
