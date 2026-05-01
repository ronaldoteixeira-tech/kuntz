/**
 * Multi-Step Form Logic & Lead Classification
 * 
 * Este arquivo gerencia as etapas do formulário, validação, captura de UTMs,
 * cálculos de pontuação (Lead Scoring), classificação e disparo de webhooks via n8n.
 */

// ==========================================
// 1. CONFIGURAÇÕES E REGRAS DE NEGÓCIO
// ==========================================

const WEBHOOK_URL = "https://n8n.v4lisboatech.com.br/webhook/0357d744-3922-49d5-bca2-080a2573a05f";

// Thresholds para classificação
const THRESHOLD_A = 8;
const THRESHOLD_B = 4;

// Tabela de Pontos
const SCORE_RULES = {
    investimento: {
        sim_alinhado: 4,
        preciso_compreender: 1
        // apenas_orientacao já foi tratado como descarte automático (Lead C)
    },
    valores_envolvidos: {
        acima_50m: 4,
        "5m_50m": 3,
        "500k_5m": 2,
        ate_500k: 0,
        nao_envolve: 1,
        prefiro_nao_informar: 1
    },
    orgao: {
        pf: 2,
        mpf: 2,
        bacen_cvm: 2,
        receita_federal: 2,
        stf_stj: 2,
        mp_estadual: 1,
        outro: 1,
        policia_civil: 0,
        nao_sei: 0
    },
    tipo_situacao: {
        economico_financeiro: 2,
        tribunal_superior: 2,
        repercussao: 2,
        adm_publica: 2,
        revisao_recurso: 1,
        outro_alta_complexidade: 1,
        flagrante_investigacao: 0
    }
};

// ==========================================
// 2. ESTADO DO FORMULÁRIO E UTILS
// ==========================================

let currentStep = 1;
const totalSteps = 4;
let formData = {
    origem: "Form Landing - Multi Step",
    data_hora: ""
};

// Captura UTMs da URL no carregamento
const urlParams = new URLSearchParams(window.location.search);
formData.utm_source = urlParams.get('utm_source') || '';
formData.utm_medium = urlParams.get('utm_medium') || '';
formData.utm_campaign = urlParams.get('utm_campaign') || '';
formData.utm_content = urlParams.get('utm_content') || '';
formData.utm_term = urlParams.get('utm_term') || '';

let formSubmitted = false;

// ==========================================
// 3. INICIALIZAÇÃO
// ==========================================

(function initMultiStepForm() {
    const form = document.getElementById("multiStepForm");
    if (!form) return;

    // Dispara GTM view do step 1
    pushGTM('form_step_view', 1);

    // Eventos de Navegação
    const nextBtns = document.querySelectorAll(".btn-next");
    const prevBtns = document.querySelectorAll(".btn-prev");
    const submitBtn = document.getElementById("btnSubmitFinal");

    nextBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const stepIndex = parseInt(btn.getAttribute("data-step"));
            if (validateStep(stepIndex)) {
                saveStepData(stepIndex);

                // Se for step 1, dispara webhook parcial
                if (stepIndex === 1) {
                    sendWebhookParcial();
                }

                pushGTM('form_step_completed', stepIndex);
                goToStep(stepIndex + 1);
            }
        });
    });

    prevBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const stepIndex = parseInt(btn.getAttribute("data-step"));
            goToStep(stepIndex - 1);
        });
    });

    submitBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (validateStep(4)) {
            saveStepData(4);
            pushGTM('form_step_completed', 4);
            processSubmission();
        }
    });

    // Contador do textarea
    const textarea = document.getElementById("f_resumo");
    if (textarea) {
        textarea.addEventListener("input", (e) => {
            const counter = document.getElementById("charCount");
            const length = e.target.value.length;
            counter.textContent = length;
        });
    }

    // Monitora abandono
    window.addEventListener("beforeunload", () => {
        if (currentStep > 1 && !formSubmitted) {
            pushGTM('form_abandoned', currentStep - 1);
        }
    });
})();

// ==========================================
// 4. LÓGICA DE NAVEGAÇÃO E VALIDAÇÃO
// ==========================================

function goToStep(step) {
    // Esconde atual
    document.getElementById(`step${currentStep}`).classList.remove("active");

    // Atualiza progresso
    currentStep = step;
    document.getElementById(`step${currentStep}`).classList.add("active");

    const progressText = document.getElementById("progressText");
    const progressBar = document.getElementById("progressBar");
    progressText.textContent = `Etapa ${currentStep} de 4`;
    progressBar.style.width = `${(currentStep / totalSteps) * 100}%`;

    pushGTM('form_step_view', currentStep);
}

function validateStep(step) {
    let isValid = true;
    const container = document.getElementById(`step${step}`);
    const requiredInputs = container.querySelectorAll("input[required], select[required], textarea[required]");

    requiredInputs.forEach(input => {
        let inputValid = true;

        // Remove erros antigos
        input.classList.remove("input-error");
        const errorMsg = input.parentElement.querySelector(".error-message");
        if (errorMsg) errorMsg.style.display = "none";

        // Validação básica
        if (!input.value.trim()) {
            inputValid = false;
        }

        // Validação específica para telefone (Step 1)
        if (input.type === "tel" && input.value.replace(/\D/g, '').length < 10) {
            inputValid = false;
        }

        // Validação específica para email (Step 1)
        if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
            inputValid = false;
        }


        if (!inputValid) {
            isValid = false;
            input.classList.add("input-error");
            if (errorMsg) errorMsg.style.display = "block";
        }
    });

    return isValid;
}

function saveStepData(step) {
    const container = document.getElementById(`step${step}`);
    const inputs = container.querySelectorAll("input, select, textarea");

    inputs.forEach(input => {
        if (input.name) {
            formData[input.name] = input.value;
            // Se for select, salva também o label
            if (input.tagName.toLowerCase() === "select") {
                const selectedOption = input.options[input.selectedIndex];
                if (selectedOption && selectedOption.value) {
                    formData[`${input.name}_label`] = selectedOption.textContent.replace(/\s+/g, ' ').trim();
                }
            }
        }
    });
}

// ==========================================
// 5. CLASSIFICAÇÃO E SUBMISSÃO
// ==========================================

function processSubmission() {
    formSubmitted = true;

    // Atualiza hora
    formData.data_hora = new Date().toLocaleString('pt-BR');

    let lead_classification = "C";
    let classification_score = 0;

    // Regra de descarte automático
    if (formData.investimento === "apenas_orientacao") {
        lead_classification = "C";
        classification_score = 0;
    } else {
        // Cálculo de pontos
        classification_score += SCORE_RULES.investimento[formData.investimento] || 0;
        classification_score += SCORE_RULES.valores_envolvidos[formData.valores_envolvidos] || 0;
        classification_score += SCORE_RULES.orgao[formData.orgao] || 0;
        classification_score += SCORE_RULES.tipo_situacao[formData.tipo_situacao] || 0;

        if (classification_score >= THRESHOLD_A) {
            lead_classification = "A";
        } else if (classification_score >= THRESHOLD_B) {
            lead_classification = "B";
        } else {
            lead_classification = "C";
        }
    }

    formData.lead_classification = lead_classification;
    formData.classification_score = classification_score;
    formData.lead_status = "completo";
    formData.etapa_concluida = 4;

    sendWebhookFinal();

    // Meta CAPI + GA4 — CompleteRegistration apenas para leads qualificados (A ou B)
    if (lead_classification === 'A' || lead_classification === 'B') {
        const nameParts = (formData.nome || '').trim().split(/\s+/);
        fireTracker('CompleteRegistration', {
            em: formData.email,
            fn: nameParts[0] || '',
            ln: nameParts.slice(1).join(' ') || '',
            ph: formData.telefone,
        }, {
            lead_classification,
            classification_score,
        });
    }

    pushGTM('form_submitted', null, lead_classification, classification_score);

    // Esconder form
    document.getElementById("multiStepForm").style.display = "none";
    document.getElementById("progressContainer").style.display = "none";

    // Mostrar mensagem
    const messageEl = document.getElementById(`result${lead_classification}`);
    if (!messageEl) {
        console.error(`[Form] Elemento de mensagem não encontrado para classificação: ${lead_classification}`);
        return;
    }
    messageEl.classList.add("active");
}

function sendWebhookParcial() {
    const partialData = {
        lead_status: "parcial",
        etapa_concluida: 1,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        utm_source: formData.utm_source,
        utm_medium: formData.utm_medium,
        utm_campaign: formData.utm_campaign,
        utm_content: formData.utm_content,
        utm_term: formData.utm_term,
        data_hora: new Date().toLocaleString('pt-BR'),
        origem: formData.origem
    };

    fetch(WEBHOOK_URL, {
        method: "POST",
        body: new URLSearchParams(partialData)
    }).catch(err => console.error("[Form] Erro no webhook parcial:", err));

    // Meta CAPI + GA4 — Lead (fase 1: contato coletado)
    const nameParts = (formData.nome || '').trim().split(/\s+/);
    fireTracker('Lead', {
        em: formData.email,
        fn: nameParts[0] || '',
        ln: nameParts.slice(1).join(' ') || '',
        ph: formData.telefone,
    });
}

function sendWebhookFinal() {
    fetch(WEBHOOK_URL, {
        method: "POST",
        body: new URLSearchParams(formData)
    }).catch(err => console.error("[Form] Erro no webhook final:", err));
}

// ==========================================
// 7. TRACKER (Meta CAPI + GA4)
// ==========================================

function fireTracker(eventName, userData, customData) {
    const eventId = (crypto.randomUUID && crypto.randomUUID()) ||
        (Date.now() + '-' + Math.random().toString(36).slice(2));
    const eventTime = Math.floor(Date.now() / 1000);

    // Browser-side pixel fire para dedup
    try { if (window.fbq) fbq('track', eventName, customData || {}, { eventID: eventId }); } catch (_) {}

    const payload = {
        event_name: eventName,
        event_id: eventId,
        event_time: eventTime,
        event_source_url: window.location.href,
        user_data: userData || {},
    };
    if (customData) payload.custom_data = customData;

    fetch('/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    }).catch(function () {});
}

// ==========================================
// 6. INTEGRAÇÃO GTM
// ==========================================

function pushGTM(eventName, stepNumber = null, classification = null, score = null) {
    if (typeof dataLayer !== 'undefined') {
        const payload = { event: eventName };
        if (stepNumber !== null && eventName !== 'form_abandoned') {
            payload.step_number = stepNumber;
        }
        if (eventName === 'form_abandoned') {
            payload.last_completed_step = stepNumber;
        }
        if (classification !== null) {
            payload.lead_classification = classification;
        }
        if (score !== null) {
            payload.classification_score = score;
        }
        dataLayer.push(payload);
    }
}
