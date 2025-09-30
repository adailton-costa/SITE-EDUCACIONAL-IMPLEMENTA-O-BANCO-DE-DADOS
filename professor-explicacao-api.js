window.gerarExplicacaoIA = async (pergunta, errada, correta, tituloAula) => {
  const message = `
Você é um professor paciente do curso "${tituloAula}".
Um aluno respondeu incorretamente à seguinte pergunta:

Pergunta: "${pergunta}"
Resposta do aluno: "${errada}"
Resposta correta: "${correta}"

Explique de forma clara, simples e encorajadora por que a resposta correta é "${correta}" 
e por que "${errada}" está errada. Use linguagem acessível para iniciantes.
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
        model: "command-xlarge-nightly",       // ✅ modelo ativo
        message: message,       // ✅ usa "message", não "prompt"
        max_tokens: 250,
        temperature: 0.4
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da Cohere:", response.status, errorText);
      throw new Error("Falha na API");
    }

    const data = await response.json();
    return data.text?.trim() || "Não foi possível gerar uma explicação.";
  } catch (error) {
    console.error("Erro na explicação da IA:", error);
    return "Desculpe, não consegui explicar agora. Tente novamente mais tarde.";
  }
};