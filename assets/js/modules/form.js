// Form submission
        async function handleSubmit(e) {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            btn.textContent = 'Enviando...';
            btn.disabled = true;

            const form = document.getElementById('leadForm');
            const data = {
                nome: form.realname.value,
                telefone: form.phone.value,
                email: form.email.value,
                tipo_caso: form.case_type.value,
                acordo_consulta: form.agreement_consultation.value,
                mensagem: form.message.value,
                origem: 'Landing Page Kuntz',
                data: new Date().toISOString()
            };

            try {
                await fetch('https://n8n.v4lisboatech.com.br/webhook/06dd2e22-e6e5-481c-b8b8-d8c1704dc4a5', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                    mode: 'no-cors'
                });

                form.style.display = 'none';
                document.getElementById('formSuccess').classList.add('show');
            } catch (err) {
                btn.textContent = 'Solicitar Avaliação Sigilosa do Meu Caso';
                btn.disabled = false;
                alert('Erro ao enviar. Tente novamente ou entre em contato pelo WhatsApp.');
            }
        }

        
window.handleSubmit = handleSubmit;
