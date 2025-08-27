document.addEventListener("DOMContentLoaded", () => {
    const aulaContextos = {
        1: {
            titulo: "Introdução às Operações",
            descricao: "números, contagem, medição e resolução de problemas do dia a dia",
            conceitos: "utilidade dos números, contagem, medição",
            exemplos: "contar objetos, medir ingredientes, ver horas, calcular idades"
        },
        2: {
        titulo: "Frações - Denominador e Numerador",
        descricao: "identificar numerador e denominador em uma fração",
        conceitos: "numerador, denominador, partes de um todo",
        exemplos: "em 3/4, 3 é o numerador e 4 é o denominador; dividir pizza em fatias"
        },
        3: {
            titulo: "Leitura de Números Decimais",
            descricao: "ler e interpretar números decimais corretamente",
            conceitos: "unidades, décimos, centésimos",
            exemplos: "3,75 se lê três inteiros e setenta e cinco centésimos; dinheiro, medidas em metros"
        },
        4: {
            titulo: "Representação de Frações",
            descricao: "interpretar e representar frações corretamente",
            conceitos: "parte de um todo, frações equivalentes",
            exemplos: "1/2 representa uma parte de um total de duas partes iguais; cortar bolo ao meio"
        },
        5: {
            titulo: "Operações com Frações",
            descricao: "realizar soma e simplificação de frações",
            conceitos: "somar frações, denominadores iguais, simplificação",
            exemplos: "1/4 + 1/4 = 2/4; somar fatias de pizza"
        },
        6: {
            titulo: "Porcentagem",
            descricao: "calcular porcentagens de valores",
            conceitos: "porcentagem, fração de um todo, cálculo percentual",
            exemplos: "50% de 100 é 50; descontos em compras, aumento de preços"
        },
        7: {
            titulo: "Expressões Numéricas",
            descricao: "interpretar e calcular expressões com prioridade de operações",
            conceitos: "ordem das operações, parênteses, multiplicação e adição",
            exemplos: "2 + 3 × 4 = 14; calcular expressões no dia a dia, como preços ou medidas"
        },
        8: {
            titulo: "Equações Simples",
            descricao: "resolver equações de primeiro grau",
            conceitos: "isolar a variável, operação inversa",
            exemplos: "x + 5 = 12 → x = 7; problemas com idade, dinheiro, medidas"
        }
    };

    const quizzes = document.querySelectorAll(".quiz-container");
    const aulaTabs = document.querySelectorAll(".aula-tab");
    const aulas = document.querySelectorAll(".course-content");

    // Alternar entre aulas
    aulaTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            const aulaId = tab.getAttribute("data-aula");

            // Ativar tab
            aulaTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            // Mostrar aula correspondente
            aulas.forEach(aula => {
                aula.id === `aula-${aulaId}` ? aula.classList.remove("hidden") : aula.classList.add("hidden");
            });
        });
    });

    quizzes.forEach(quiz => {
        const aulaId = quiz.getAttribute("data-aula");
        const contextoAula = aulaContextos[aulaId];

        const submitBtn = quiz.querySelector(".quiz-submit");
        const feedbackDiv = quiz.querySelector(".quiz-feedback");
        const questionText = quiz.querySelector(".quiz-question p");
        const options = quiz.querySelectorAll(".quiz-option");

        submitBtn.addEventListener("click", async () => {
        const selected = quiz.querySelector(".quiz-option.selected");

        if (!selected) {
            feedbackDiv.textContent = "Por favor, selecione uma opção.";
            feedbackDiv.style.color = "orange";
            return;
        }

        const correta = selected.dataset.correta === "true";

        // Remove explicação anterior
        const oldExplicacao = quiz.querySelector(".quiz-explanation");
        if (oldExplicacao) oldExplicacao.remove();

        const respostaErrada = selected.textContent;
        const respostaCorreta = quiz.querySelector(".quiz-option[data-correta='true']").textContent;
        const questao = questionText.textContent;

        if (correta) {
            feedbackDiv.textContent = `✅ Resposta correta! Muito bem!`;
            feedbackDiv.style.color = "green";
        } else {
            feedbackDiv.textContent = `❌ Resposta incorreta!`;
            feedbackDiv.style.color = "red";

            // Chama a API da Cohere com contexto da aula
            const explicacao = await gerarExplicacao(
                questao,
                respostaErrada,
                respostaCorreta,
                contextoAula,
                aulaId
            );

            // Exibe a explicação junto com a resposta correta e a escolhida
            const explicacaoBox = document.createElement("div");
            explicacaoBox.className = "quiz-explanation";
            explicacaoBox.style.marginTop = "10px";
            explicacaoBox.style.background = "#f0f0f0";
            explicacaoBox.style.padding = "10px";
            explicacaoBox.style.borderRadius = "8px";
            explicacaoBox.innerHTML = `
                <strong>Sua resposta:</strong> ${respostaErrada}<br>
                <strong>Resposta correta:</strong> ${respostaCorreta}<br>
                <strong>Explicação:</strong> ${explicacao}
            `;
            feedbackDiv.insertAdjacentElement("afterend", explicacaoBox);
        }
    });


        // Marca a opção selecionada
        options.forEach(opt => {
            opt.addEventListener("click", () => {
                options.forEach(o => o.classList.remove("selected"));
                opt.classList.add("selected");
            });
        });
    });

    // Função para chamar a Cohere API
    async function gerarExplicacao(questao, respostaErrada, respostaCorreta, contextoAula, aulaId) {
        const prompt = `Você é um professor de matemática básica que fala **apenas português**. 
Explique de forma curta e clara (máximo 3 frases) por que a resposta correta para a pergunta "${questao}" é "${respostaCorreta}" 
e por que a resposta "${respostaErrada}" está incorreta.
Use exemplos simples do contexto da aula: ${contextoAula.exemplos}.
Forneça a explicação **somente em português**.
Seja positivo e direto, sem introduções longas ou mensagens motivacionais.`;

        try {
            const response = await fetch("https://api.cohere.ai/v1/generate", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer 83dC3LN5b8rnp5nFdVWm8z3osqJeuMg5r8qHfm6J",
                    "Content-Type": "application/json",
                    "Cohere-Version": "2022-12-06"
                },
                body: JSON.stringify({
                    model: "command",
                    prompt: prompt,
                    // max_tokens: 100,
                    temperature: 0.5
                })
            });

            if (!response.ok) throw new Error(`Erro na API: ${response.status}`);

            const data = await response.json();
            return data.generations[0].text.trim();
        } catch (error) {
            console.error("Erro ao chamar a API:", error);

            const explicacoesFallback = {
                1: `A resposta "${respostaCorreta}" está correta porque os números nos ajudam a contar, medir e resolver problemas do dia a dia. "${respostaErrada}" não está certa porque ignora essas utilidades.`,
                2: `A resposta "${respostaCorreta}" está certa! A adição serve para juntar quantidades. "${respostaErrada}" não representa corretamente a operação.`,
                3: `A resposta "${respostaCorreta}" é a correta! Multiplicação é somar várias vezes o mesmo número. "${respostaErrada}" não segue esse princípio.`,
                4: `"${respostaCorreta}" é a resposta certa! Divisão significa repartir em partes iguais. "${respostaErrada}" não representa divisão igualitária.`
            };

            return explicacoesFallback[aulaId] || `A resposta correta é "${respostaCorreta}" e "${respostaErrada}" está errada.`;
        }
    }
});
