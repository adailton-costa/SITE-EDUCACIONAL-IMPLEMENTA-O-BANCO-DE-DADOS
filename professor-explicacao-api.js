window.gerarExplicacaoIA = async (pergunta, errada, correta, tituloAula) => {
  const message = `
Você é um professor do curso "${tituloAula}".
Um aluno respondeu incorretamente à pergunta abaixo.

Pergunta: "${pergunta}"
Resposta errada: "${errada}"
Resposta correta: "${correta}"

Explique em 2-3 frases COMPLETAS por que "${correta}" está correto e por que "${errada}" está errado.
Inclua o raciocínio por trás da resposta correta.
Seja claro e educativo, mas mantenha o foco.
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
        max_tokens: 150,
        temperature: 0.3,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro da Cohere:", response.status, errorText);
      throw new Error("Falha na API");
    }

    const data = await response.json();
    let resposta = data.text?.trim() || "Não foi possível gerar uma explicação.";
    
    // remove possíveis asteriscos que a IA colocou
    resposta = resposta.replace(/\*\*/g, "");

    return resposta;
    
  } catch (error) {
    console.error("Erro na explicação da IA:", error);
    return "Desculpe, não consegui explicar agora.";
  }
};
