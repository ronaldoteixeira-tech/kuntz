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
                await fetch('https://n8n.v4lisboatech.com.br/webhook/6e6301de-33f1-4116-8504-7b1cb4adf2b2', {
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
