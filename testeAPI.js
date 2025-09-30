const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_KEY = "83dC3LN5b8rnp5nFdVWm8z3osqJeuMg5r8qHfm6J";

const body = {
  model: "command-xlarge-nightly",
  chat_history: [], // obrigatório mesmo que vazio
  message: "Explique o ciclo da água de forma simples." // campo correto para o prompt
};

fetch("https://api.cohere.ai/v1/chat", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(body)
})
.then(res => res.json())
.then(data => {
  const resposta = data.text || data.message || (data.generations && data.generations[0]?.text);
  console.log("Resposta da IA:");
  console.log(resposta || "Não foi possível obter a resposta.");
})
.catch(err => {
  console.error("Erro na chamada:", err);
});