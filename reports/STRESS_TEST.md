# Репетиция стресс-теста · конверт A

18.11.2026; автор Лобацкий Артём Сергеевич; код 5b7a133. Самостоятельная репетиция, без имитации чужой проверки или очной защиты.

Добавлены ui-tag--paused и ui-alert--paused. Обе семьи читают --color-paused/--color-paused-bg, но не общий is-paused. В light: #69409b / #f2eaff; в dark: #dfc4ff / #3c2857. Есть раздел paused-example. Смена класса метки на danger не меняет alert и danger button.

Варианты живут в components, темы — tokens. Новый vendor-v2 имеет префикс .legacy-widget и nested legacy.vendor-v2: legacy-action остаётся квадратной, а библиотечная кнопка сохраняет радиус и акцент. Container query добавлен ранее в core fix и проверяется при 350/500px без влияния на внешние кнопки.

Проверка: npm test 18/18; test:e2e 84/84. Есть отдельные тесты paused, vendor-v2 и container bounds для обеих тем; contrast paused >=4.5. STRESS_TEST.patch содержит изменения после исправления ядра 929754d.

Правка преподавателя на будущей защите неизвестна; эта репетиция её не заменяет.
