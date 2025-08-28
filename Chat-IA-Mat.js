document.addEventListener("DOMContentLoaded", () => {
    const composer = document.getElementById("composer");
    const input = document.getElementById("input");
    const messages = document.getElementById("messages");

    composer.addEventListener("submit", async (event) => {
        event.preventDefault(); // impede recarregar a página

        const question = input.value.trim();
        if (!question) return;

        addMessage("user", question);
        input.value = "";

        // Mensagem de carregando
        const loadingMsg = addMessage("ai", "Digitando...");

        // Gera resposta
        const resposta = await gerarRespostaChat(question);

        // Substitui "Digitando..." pela resposta real
        loadingMsg.querySelector(".text").textContent = resposta;
    });

    function addMessage(sender, text) {
        const li = document.createElement("li");
        li.className = `message ${sender}`; // user ou ai
        li.innerHTML = `<span class="text">${text}</span>`;
        messages.appendChild(li);
        messages.scrollTop = messages.scrollHeight;
        return li;
    }

    async function gerarRespostaChat(pergunta) {
        const prompt = `Você é um professor de matemática altamente qualificado, com domínio completo de todos os tópicos da disciplina. Sua missão é explicar conceitos matemáticos de forma clara, precisa e acessível, sempre em português. Use exemplos práticos e linguagem adequada ao nível de conhecimento do interlocutor. Aqui está a pergunta: ${pergunta}`;

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
                    // max_tokens: 150
                })
            });

            const data = await response.json();
            return data.generations[0].text.trim();
        } catch (error) {
            console.error(error);
            return "Desculpe, não consegui gerar uma resposta no momento.";
        }
    }
});
