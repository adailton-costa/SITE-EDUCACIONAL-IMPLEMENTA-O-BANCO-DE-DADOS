// Função para desativar o placeholder
function disablePlaceholder() {
    const placeholder = document.getElementById('placeholder');
    if (placeholder) {
        placeholder.classList.add('disabled');
    } else {
        console.error("Elemento 'placeholder' não encontrado!");
    }
}

// Adiciona o evento de clique ao placeholder
document.addEventListener('DOMContentLoaded', function () {
    const placeholder = document.getElementById('placeholder');
    if (placeholder) {
        placeholder.addEventListener('click', disablePlaceholder);
    } else {
        console.error("Elemento 'placeholder' não encontrado!");
    }
});