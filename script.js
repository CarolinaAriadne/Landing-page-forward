// ---------- Menu mobile ----------
const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('menu-principal');

function setMenu(open) {
  navToggle.setAttribute('aria-expanded', String(open));
  navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  nav.classList.toggle('is-open', open);
}

navToggle.addEventListener('click', () => {
  setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    navToggle.focus();
  }
});

// ---------- Campos que crescem ao chegar ao fim da linha ----------
// Fallback para navegadores sem suporte a "field-sizing: content".
if (!CSS.supports('field-sizing', 'content')) {
  document.querySelectorAll('textarea.auto-grow').forEach((textarea) => {
    const grow = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight + 2}px`;
    };
    textarea.addEventListener('input', grow);
    window.addEventListener('resize', grow);
    grow();
  });
}

// ---------- Validação do formulário ----------
const form = document.getElementById('form-contato');
const alertBox = document.getElementById('form-alerta');
const popup = document.getElementById('popup-sucesso');
const popupClose = document.getElementById('popup-fechar');

// Algo antes e depois do @, um ponto e uma extensão de pelo menos 2 letras
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[A-Za-z]{2,}$/;

const rules = {
  nome: (value) => {
    if (value.length < 3) return 'O nome precisa ter pelo menos 3 caracteres.';
    if (value.length > 50) return 'O nome pode ter no máximo 50 caracteres.';
    return '';
  },
  email: (value) => (EMAIL_REGEX.test(value) ? '' : 'Informe um e-mail válido, como voce@empresa.com.br.'),
  empresa: (value) => {
    if (value === '') return '';
    if (value.length < 3) return 'O nome da empresa precisa ter pelo menos 3 caracteres.';
    if (value.length > 50) return 'O nome da empresa pode ter no máximo 50 caracteres.';
    return '';
  },
  interesse: (value) => {
    if (value.length < 3) return 'Descreva seu interesse com pelo menos 3 caracteres.';
    if (value.length > 250) return 'O interesse pode ter no máximo 250 caracteres.';
    return '';
  },
  mensagem: (value) => {
    if (value.length < 3) return 'A mensagem precisa ter pelo menos 3 caracteres.';
    if (value.length > 250) return 'A mensagem pode ter no máximo 250 caracteres.';
    return '';
  },
};

const requiredFields = ['nome', 'email', 'interesse', 'mensagem'];

function setFieldError(name, message) {
  const input = form.elements[name];
  const error = document.getElementById(`${name}-erro`);
  input.closest('.field').classList.toggle('is-invalid', Boolean(message));
  input.setAttribute('aria-invalid', String(Boolean(message)));
  error.textContent = message;
}

function validateField(name) {
  const value = form.elements[name].value.trim();
  const isEmpty = requiredFields.includes(name) && value === '';
  // Campo obrigatório vazio é sinalizado pela mensagem geral
  const message = isEmpty ? '' : rules[name](value);
  setFieldError(name, message);
  if (isEmpty) form.elements[name].closest('.field').classList.add('is-invalid');
  return { isEmpty, isValid: !isEmpty && message === '' };
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const results = Object.keys(rules).map((name) => ({ name, ...validateField(name) }));
  const hasEmpty = results.some((r) => r.isEmpty);
  const firstInvalid = results.find((r) => !r.isValid);

  alertBox.hidden = !hasEmpty;

  if (firstInvalid) {
    form.elements[firstInvalid.name].focus();
    return;
  }

  openPopup();
});

// Remove o erro assim que a pessoa corrige o campo
form.addEventListener('input', (event) => {
  const { name } = event.target;
  if (!rules[name] || !event.target.closest('.field').classList.contains('is-invalid')) return;
  validateField(name);
  const stillEmpty = requiredFields.some((n) => form.elements[n].value.trim() === '');
  if (!stillEmpty) alertBox.hidden = true;
});

// ---------- Pop-up de sucesso ----------
function openPopup() {
  popup.hidden = false;
  popupClose.focus();
}

function closePopup() {
  popup.hidden = true;
  form.reset();
  form.querySelectorAll('textarea.auto-grow').forEach((t) => { t.style.height = ''; });
  form.elements.nome.focus();
}

popupClose.addEventListener('click', closePopup);

popup.addEventListener('click', (event) => {
  if (event.target === popup) closePopup();
});

popup.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closePopup();
  // Mantém o foco dentro do pop-up (único elemento focável)
  if (event.key === 'Tab') {
    event.preventDefault();
    popupClose.focus();
  }
});
