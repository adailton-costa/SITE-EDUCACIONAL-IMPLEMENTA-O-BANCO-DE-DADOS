document.addEventListener("DOMContentLoaded", async () => {
    const composer = document.getElementById("composer");
    const input = document.getElementById("input");
    const messages = document.getElementById("messages");

    // 1️⃣ Pega automaticamente o curso do usuário
let nomeCurso = "Curso não especificado";
try {
    // Supondo que você tenha o UID do usuário logado em `userId`
    const matriculaDoc = await db.collection("matriculas")
                                 .where("usuario_id", "==", userId)
                                 .limit(1)
                                 .get();
    if (!matriculaDoc.empty) {
        const cursoId = matriculaDoc.docs[0].data().curso_id;
        const cursoDoc = await db.collection("cursos").doc(cursoId).get();
        if (cursoDoc.exists) {
            nomeCurso = cursoDoc.data().titulo;

            // ✅ DEBUG: verificar se o nome do curso foi carregado
            console.log("Curso do usuário carregado:", nomeCurso);
        } else {
            console.warn("Curso não encontrado para o curso_id:", cursoId);
        }
    } else {
        console.warn("Usuário não possui matrícula ou matrícula não encontrada:", userId);
    }
} catch (err) {
    console.error("Erro ao pegar curso:", err);
}

    composer.addEventListener("submit", async (event) => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question) return;

        addMessage("user", question);
        input.value = "";

        const loadingMsg = addMessage("ai", "Digitando...");

        const resposta = await gerarRespostaChat(question, nomeCurso);
        loadingMsg.querySelector(".text").textContent = resposta;
    });

    function addMessage(sender, text) {
        const li = document.createElement("li");
        li.className = `message ${sender}`;
        li.innerHTML = `<span class="text">${text}</span>`;
        messages.appendChild(li);
        messages.scrollTop = messages.scrollHeight;
        return li;
    }

    function calcularOperacaoSimples(pergunta) {
        try {
            const clean = pergunta.replace(/\s/g, "").replace(",", ".");
            if (/^[0-9+\-*/().]+$/.test(clean)) {
                const resultado = eval(clean);
                return Number.isFinite(resultado) ? resultado.toString() : null;
            }
        } catch {}
        return null;
    }

    async function gerarRespostaChat(pergunta, nomeCurso) {
        const calculo = calcularOperacaoSimples(pergunta);
        if (calculo !== null) return calculo;

        const message = `
Você é um professor do curso "${nomeCurso}".
Responda à pergunta de forma **curta, direta e precisa**, em português.
Pergunta: ${pergunta}
`.trim();

        try {
            const response = await fetch("https://api.cohere.ai/v1/chat", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer 83dC3LN5b8rnp5nFdVWm8z3osqJeuMg5r8qHfm6J",
                    "Content-Type": "application/json",
                    "Cohere-Version": "2022-12-06"
                },
                body: JSON.stringify({
                    model: "command-xlarge-nightly",
                    message: message,
                    max_tokens: 60,
                    temperature: 0.2
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Erro da Cohere:", response.status, errorText);
                return "Desculpe, não consegui gerar uma resposta.";
            }

            const data = await response.json();
            return data.text?.trim() || "Não foi possível gerar uma resposta.";
        } catch (error) {
            console.error("Erro no chat:", error);
            return "Desculpe, não consegui gerar uma resposta no momento.";
        }
    }
});
