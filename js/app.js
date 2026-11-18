const root = document.documentElement;
const themeToggle = document.querySelector('#theme-toggle');
const dialog = document.querySelector('#settings-dialog');
let dialogTrigger;
themeToggle.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  themeToggle.setAttribute('aria-pressed', String(next === 'dark'));
  themeToggle.textContent = next === 'dark' ? '☀️ Светлая тема' : '🌙 Сменить тему';
});
for (const trigger of document.querySelectorAll('#open-dialog, [data-open-dialog]')) {
  trigger.addEventListener('click', () => {
    dialogTrigger = trigger;
    dialog.returnValue = '';
    dialog.showModal();
  });
}
dialog.addEventListener('close', () => {
  document.querySelector('#dialog-feedback').textContent = dialog.returnValue === 'save'
    ? `Команда «${document.querySelector('#dialog-team').value.trim() || 'Без названия'}»: настройки сохранены.`
    : 'Изменения отменены.';
  dialogTrigger?.focus();
});
const form = document.querySelector('#demo-form');
const requiredInputs = [...form.querySelectorAll('input[required]')];
const hints = new Map(requiredInputs.map(input => [input, document.getElementById(input.getAttribute('aria-describedby')).textContent]));
function validate(input) {
  const invalid = !input.checkValidity();
  input.setAttribute('aria-invalid', String(invalid));
  const hint = document.getElementById(input.getAttribute('aria-describedby'));
  hint.textContent = invalid
    ? (input.validity.valueMissing ? (input.type === 'email' ? 'Введите корпоративную почту.' : 'Введите имя сотрудника.') : 'Введите адрес в формате name@company.ru.')
    : hints.get(input);
  return !invalid;
}
for (const input of requiredInputs) {
  input.addEventListener('blur', () => validate(input));
  input.addEventListener('input', () => { if (input.hasAttribute('aria-invalid')) validate(input); });
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const invalid = requiredInputs.filter(input => !validate(input));
  document.querySelector('#form-feedback').textContent = invalid.length ? 'Исправьте поля формы.' : 'Данные прошли проверку.';
  invalid[0]?.focus();
});
const alerts = document.querySelector('.alerts-stack');
const initialAlerts = alerts.innerHTML;
const restoreAlerts = document.querySelector('#restore-alerts');
alerts.addEventListener('click', event => {
  const dismiss = event.target.closest('.ui-alert__dismiss');
  if (!dismiss) return;
  const alert = dismiss.closest('.ui-alert');
  const next = alert.nextElementSibling?.querySelector('.ui-alert__dismiss');
  const keyboard = dismiss.matches(':focus-visible');
  alert.remove();
  document.querySelector('#alert-feedback').textContent = 'Уведомление закрыто.';
  if (keyboard) (next || restoreAlerts).focus();
});
restoreAlerts.addEventListener('click', () => {
  alerts.innerHTML = initialAlerts;
  document.querySelector('#alert-feedback').textContent = 'Уведомления восстановлены.';
});
for (const input of document.querySelectorAll('.ui-switch input')) {
  input.addEventListener('change', () => {
    document.querySelector('#switch-feedback').textContent = `${input.closest('.ui-switch').querySelector('strong').textContent}: ${input.checked ? 'включено' : 'выключено'}`;
  });
}
const legacyAction = document.querySelector('.legacy-action');
legacyAction.addEventListener('click', () => {
  const expanded = legacyAction.getAttribute('aria-expanded') !== 'true';
  legacyAction.setAttribute('aria-expanded', String(expanded));
  const feedback = document.querySelector('#legacy-feedback');
  feedback.hidden = !expanded;
  feedback.textContent = expanded ? 'Заявка № 06 открыта. Статус: ожидает согласования.' : '';
});
