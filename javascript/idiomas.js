// Cargar idioma guardado o por defecto es español
let idiomaActual = localStorage.getItem('idioma_preferido') || 'es';
let traducciones = {};

// Cargar las traducciones
async function cargarIdiomas() {
    try {
        const response = await fetch('idiomas.json');
        return await response.json();
    } catch (error) {
        console.error('Error cargando traducciones:', error);
        return { es: {}, eu: {} };
    }
}

// Aplicar traducciones a los elementos con data-i18n
function aplicarIdioma(idioma) {
    idiomaActual = idioma;
    localStorage.setItem('idioma_preferido', idioma);
    document.documentElement.lang = idioma === 'eu' ? 'eu' : 'es';

    // Traducir elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(elemento => {
        const clave = elemento.getAttribute('data-i18n');
        if (traducciones[idioma] && traducciones[idioma][clave]) {
            if (elemento.placeholder !== undefined) {
                elemento.placeholder = traducciones[idioma][clave];
            } else if (elemento.tagName === 'TITLE') {
                elemento.textContent = traducciones[idioma][clave];
            } else {
                elemento.textContent = traducciones[idioma][clave];
            }
        }
    });

    // Actualizar atributos title si existen
    document.querySelectorAll('[data-i18n-title]').forEach(elemento => {
        const clave = elemento.getAttribute('data-i18n-title');
        if (traducciones[idioma] && traducciones[idioma][clave]) {
            elemento.title = traducciones[idioma][clave];
        }
    });
}

// Función para cambiar idioma
function cambiarIdioma(nuevoIdioma) {
    aplicarIdioma(nuevoIdioma);
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    traducciones = await cargarIdiomas();
    aplicarIdioma(idiomaActual);
});
