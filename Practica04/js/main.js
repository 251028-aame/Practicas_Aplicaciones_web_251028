
(function () {
    document.addEventListener('DOMContentLoaded', function () {

        const form = document.getElementById('formRegistro');
        if (!form) return;

        const $ = id => document.getElementById(id);

        const panels = [...form.querySelectorAll('.wizard-panel')];
        const steps = [...document.querySelectorAll('.stepper-item')];

        const progress = $('wizardProgress');
        const banner = $('bannerFormulario');
        const card = $('registroWizard');
        const prev = $('btnAnterior');
        const nextText = $('btnSiguienteTexto');
        const nextIcon = $('btnSiguienteIcono');
        const stepCounter = $('stepCounter');

        let current = 1;
        const total = panels.length;
        let refreshAddressLists = function () {};

        // Mostrar mensajes del formulario
        function showBanner(message, type = 'warning') {
            banner.textContent = message;
            banner.className = `form-banner is-${type}`;
            banner.hidden = false;
        }

        function hideBanner() {
            banner.hidden = true;
            banner.textContent = '';
        }

        // Calcular edad
        function ageText() {
            const input = $('fechaNacimiento');
            const output = $('resultadoEdad');

            output.className = 'age-result';

            if (!input.value) {
                output.textContent = 'Selecciona tu fecha de nacimiento para calcular tu edad.';
                return;
            }

            const [y, m, d] = input.value.split('-').map(Number);
            const birth = new Date(y, m - 1, d);

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (birth > today) {
                output.textContent = 'La fecha de nacimiento no puede ser futura.';
                output.classList.add('is-error');
                return;
            }

            let age = today.getFullYear() - y;

            if (
                today.getMonth() < m - 1 ||
                (today.getMonth() === m - 1 && today.getDate() < d)
            ) {
                age--;
            }

            output.textContent = `Edad calculada: ${age} ${age === 1 ? 'año' : 'años'}.`;

            output.classList.add(age >= 18 ? 'is-ok' : 'is-info');
        }

        $('fechaNacimiento').addEventListener('change', ageText);

        // Reglas de contraseña
        const passwordRules = value => ({
            longitud: value.length >= 8,
            mayuscula: /[A-ZÁÉÍÓÚÑ]/.test(value),
            numero: /\d/.test(value),
            especial: /[^A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s]/.test(value)
        });

        function updatePasswordRules() {
            const state = passwordRules($('contrasena').value);

            $('reglasContrasena').querySelectorAll('li').forEach(li => {
                li.classList.toggle('is-ok', !!state[li.dataset.regla]);
            });
        }

        // Obtener mensaje de validación
        function getMessage(el) {
            if (el.type === 'checkbox') {
                return el.required && !el.checked
                    ? (el.dataset.mensaje || 'Este campo es obligatorio.')
                    : '';
            }

            const value = el.value.trim();

            if (!value) {
                return el.required ? 'Este campo es obligatorio.' : '';
            }

            if (
                el.id === 'fechaNacimiento' &&
                new Date(`${value}T00:00:00`) >
                new Date(new Date().setHours(0, 0, 0, 0))
            ) {
                return 'La fecha no puede ser futura.';
            }

            if (el.id === 'telefono' && !/^\d{7,15}$/.test(value)) {
                return 'Ingresa entre 7 y 15 dígitos, sin espacios ni símbolos.';
            }

            if (
                el.id === 'contrasena' &&
                !Object.values(passwordRules(el.value)).every(Boolean)
            ) {
                return 'Debe tener 8 caracteres, mayúscula, número y signo especial.';
            }

            if (
                el.id === 'confirmarContrasena' &&
                el.value !== $('contrasena').value
            ) {
                return 'Las contraseñas no coinciden.';
            }

            if (el.type === 'email' && !el.validity.valid) {
                return 'Ingresa un correo electrónico válido.';
            }

            if (el.type === 'url' && !el.validity.valid) {
                return 'Ingresa una dirección web válida (https://...).';
            }

            if (el.minLength > 0 && value.length < el.minLength) {
                return `Utiliza al menos ${el.minLength} caracteres.`;
            }

            return '';
        }

        // Validar un campo
        function validateField(el) {
            if (!el || el.disabled || el.type === 'file') {
                return true;
            }

            const field = el.closest('.field');
            const error = $('error-' + el.id);
            const message = getMessage(el);

            if (field) {
                field.classList.toggle('is-invalid', !!message);
            }

            el.setAttribute('aria-invalid', message ? 'true' : 'false');

            if (error) {
                error.textContent = message;
                error.hidden = !message;
            }

            return !message;
        }

        // Obtener campos de cada paso
        function fieldsInStep(index) {
            return [
                ...panels[index - 1].querySelectorAll(
                    'input:not([type="file"]):not([type="hidden"]), select, textarea'
                )
            ];
        }

        function validateStep(index) {
            let first = null;

            fieldsInStep(index).forEach(el => {
                if (!validateField(el) && !first) {
                    first = el;
                }
            });

            if (
                index === 2 &&
                $('whatsAppQR').files.length &&
                !$('whatsAppQR').files[0].type.startsWith('image/')
            ) {
                first = $('whatsAppQR');
            }

            return first;
        }

        // Mostrar paso seleccionado
        function showStep(index, scroll = true) {
            current = index;

            panels.forEach((panel, i) => {
                panel.hidden = i !== index - 1;
            });

            steps.forEach((step, i) => {
                step.classList.toggle('is-active', i + 1 === index);
                step.classList.toggle('is-done', i + 1 < index);

                const icon = step.querySelector('.step-icon');

                if (icon) {
                    icon.textContent = i + 1 < index
                        ? 'check'
                        : ['person', 'contact_mail', 'lock', 'location_on'][i];
                }

                step.querySelector('button').setAttribute(
                    'aria-current',
                    i + 1 === index ? 'step' : 'false'
                );
            });

            progress.style.width =
                `${((index - 1) / (total - 1)) * 100}%`;

            stepCounter.textContent = `PASO ${index} DE ${total}`;

            prev.disabled = index === 1;

            nextText.textContent =
                index === total ? 'Enviar solicitud' : 'Siguiente';

            nextIcon.textContent =
                index === total ? 'check' : 'arrow_forward';

            hideBanner();

            if (scroll) {
                card.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        // Navegar entre pasos
        function goTo(index) {
            if (index <= current) {
                showStep(index);
                return;
            }

            for (let i = current; i < index; i++) {
                const invalid = validateStep(i);

                if (invalid) {
                    if (i !== current) {
                        showStep(i);
                    }

                    showBanner('Revisa los campos señalados antes de continuar.');
                    invalid.focus();
                    return;
                }
            }

            showStep(index);
        }

        prev.addEventListener('click', () => showStep(current - 1));

        steps.forEach(step => {
            step.querySelector('button').addEventListener('click', () => {
                goTo(Number(step.dataset.step));
            });
        });

        // Envío del formulario
        form.addEventListener('submit', event => {
            event.preventDefault();

            if (current < total) {
                goTo(current + 1);
                return;
            }

            for (let i = 1; i <= total; i++) {
                const invalid = validateStep(i);

                if (invalid) {
                    showStep(i);
                    showBanner('Revisa los campos señalados antes de enviar.');
                    invalid.focus();
                    return;
                }
            }

            showBanner(
                '¡Registro revisado! El envío es una demostración; los datos no se almacenaron.',
                'success'
            );

            banner.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        });

        // Validaciones mientras se escribe
        form.addEventListener('input', event => {
            const el = event.target;

            if (el.id === 'contrasena') {
                updatePasswordRules();
            }

            if (
                el.id === 'contrasena' &&
                $('confirmarContrasena').value
            ) {
                validateField($('confirmarContrasena'));
            }

            if (el.closest('.field')?.classList.contains('is-invalid')) {
                validateField(el);
            }
        });

        form.addEventListener('change', event => {
            const el = event.target;

            if (el.matches('input:not([type="file"]), select')) {
                validateField(el);
            }
        });

        // Activar y desactivar redes sociales
        const social = [
            { check: $('socialNetworks1'), input: $('urlFacebook') },
            { check: $('socialNetworks2'), input: $('urlLinkedIn') },
            { check: $('socialNetworks3'), input: $('whatsAppQR') }
        ];

        function syncSocial(item) {
            item.input.disabled = !item.check.checked;

            if (!item.check.checked) {
                if (item.input.type === 'file') {
                    clearQR();
                } else {
                    item.input.value = '';
                    validateField(item.input);
                }
            }
        }

        social.forEach(item => {
            item.check.addEventListener('change', () => syncSocial(item));
        });

        // Vista previa del código QR
        let qrUrl = null;

        function clearQR() {
            if (qrUrl) {
                URL.revokeObjectURL(qrUrl);
                qrUrl = null;
            }

            $('whatsAppQR').value = '';
            $('qrImage').removeAttribute('src');
            $('qrImage').hidden = true;

            $('qrEmpty').hidden = false;
            $('qrFileName').textContent = 'No se ha seleccionado ningún archivo.';

            $('qrRemove').hidden = true;
            $('qrError').hidden = true;
            $('qrError').textContent = '';
        }

        $('whatsAppQR').addEventListener('change', () => {
            const file = $('whatsAppQR').files[0];

            clearQR();

            if (!file) return;

            if (!file.type.startsWith('image/')) {
                $('qrError').textContent = 'Selecciona un archivo de imagen.';
                $('qrError').hidden = false;
                return;
            }

            qrUrl = URL.createObjectURL(file);

            $('qrImage').src = qrUrl;
            $('qrImage').hidden = false;

            $('qrEmpty').hidden = true;
            $('qrFileName').textContent = file.name;
            $('qrRemove').hidden = false;

            $('socialNetworks3').checked = true;
        });

        $('qrRemove').addEventListener('click', clearQR);

        // Catálogo de domicilios
        (function initAddresses() {
            const catalog = window.MECAGEST_DOMICILIOS;

            if (!catalog) return;

            const country = $('pais');
            const state = $('estado');
            const city = $('ciudad');
            const cp = $('codigoPostal');

            const examples = catalog.ejemplosMexico || [];

            const auto = {
                pais: '',
                estado: '',
                ciudad: '',
                cp: ''
            };

            const norm = text =>
                text.trim().toLowerCase().normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');

            const isMexico = () =>
                ['', 'mexico'].includes(norm(country.value));

            function fillList(id, values) {
                const list = $(id);

                if (!list) return;

                list.innerHTML = '';

                [...new Set(values)].forEach(value => {
                    const option = document.createElement('option');
                    option.value = value;
                    list.appendChild(option);
                });
            }

            function put(field, key, value) {
                if (!field.value.trim() || field.value === auto[key]) {
                    field.value = value;
                    auto[key] = value;
                }
            }

            function refresh() {
                fillList('listaPaises', catalog.paises || []);

                fillList(
                    'listaEstados',
                    isMexico() ? (catalog.estadosMexico || []) : []
                );

                let list = isMexico() ? examples : [];

                if (state.value.trim()) {
                    list = list.filter(item =>
                        norm(item.estado) === norm(state.value)
                    );
                }

                fillList('listaCiudades', list.map(item => item.ciudad));

                if (city.value.trim()) {
                    list = list.filter(item =>
                        norm(item.ciudad) === norm(city.value)
                    );
                }

                fillList('listaCP', list.map(item => item.cp));
            }

            refreshAddressLists = refresh;

            country.addEventListener('input', refresh);
            state.addEventListener('input', refresh);

            city.addEventListener('change', () => {
                if (isMexico() || !country.value.trim()) {
                    const found = examples.find(item =>
                        norm(item.ciudad) === norm(city.value) &&
                        (!state.value.trim() ||
                            norm(item.estado) === norm(state.value))
                    );

                    if (found) {
                        put(country, 'pais', 'México');
                        put(state, 'estado', found.estado);
                        put(cp, 'cp', found.cp);
                    }
                }

                refresh();
            });

            cp.addEventListener('input', () => {
                cp.value = cp.value.replace(/\D/g, '').slice(0, 5);

                if (cp.value.length === 5) {
                    const found = examples.find(item => item.cp === cp.value);

                    if (found) {
                        put(country, 'pais', 'México');
                        put(state, 'estado', found.estado);
                        put(city, 'ciudad', found.ciudad);
                    }
                }

                refresh();
            });

            refresh();
        })();

        // Inicializar formulario
        ageText();
        updatePasswordRules();

        // Limpiar formulario y restablecer los pasos
        form.addEventListener('reset', () => {
            setTimeout(() => {
                form.querySelectorAll('.field.is-invalid').forEach(field => {
                    field.classList.remove('is-invalid');
                });

                form.querySelectorAll('.field-error').forEach(error => {
                    error.hidden = true;
                    error.textContent = '';
                });

                form.querySelectorAll('[aria-invalid]').forEach(el => {
                    el.removeAttribute('aria-invalid');
                });

                clearQR();
                social.forEach(syncSocial);
                ageText();
                updatePasswordRules();
                showStep(1, false);

                // Restaurar las sugerencias del catálogo de domicilios
                refreshAddressLists();

            }, 0);
        });

        showStep(1, false);

    });
})();
