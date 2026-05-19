
let timeoutBuscador = null;

document.addEventListener('DOMContentLoaded', () => {
    const buscador = document.getElementById('buscador');
    const contenedor = document.querySelector("#contenedor-noticias");

    if (buscador && !buscador.dataset.hasListener) {
        buscador.addEventListener('input', () => {
            clearTimeout(timeoutBuscador);
            timeoutBuscador = setTimeout(() => {
                buscarNoticias();
            }, 300); 
        });
        buscador.dataset.hasListener = "true"; 
    }

    buscarNoticias();

    async function buscarNoticias() {
        // Verificación de elementos
        if (!contenedor || !window.supabaseClient) return;

        const busqueda = buscador ? buscador.value.trim() : "";

        let query = window.supabaseClient
            .from('Noticia')
            .select('*')
            .order('fecha', { ascending: false });

        if (busqueda !== "") {
            query = query.ilike('titulo', `%${busqueda}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error:", error.message);
            return;
        }

        let htmlFinal = "";

        if (!data || data.length === 0) {
            htmlFinal = '<p class="text-center w-100 mt-5">Ez dago berririk / No se encontraron noticias.</p>';
        } else {
            htmlFinal = data.map(noticia => `
                <div class="col-12 col-sm-6 col-md-4 mb-4 d-flex">
                    <div class="card w-100 shadow-sm border-0 d-flex flex-column" style="border-radius: 8px; overflow: hidden;">
                        <img src="${noticia.imagen || 'recursos/imagenes/escudo.png'}" 
                             class="card-img-top" 
                             style="height: 200px; object-fit: cover;"
                             onerror="this.src='recursos/imagenes/escudo.png'">
                        <div class="card-body d-flex flex-column">
                            <h5 class="fw-bold card-title">${noticia.titulo}</h5>
                            <p class="text-muted small">${noticia.fecha}</p>
                            <div style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; height: 4.5em; line-height: 1.5em; margin-bottom: 15px;">
                                ${noticia.contenido}
                            </div>
                            <button class="btn boton-admin w-100 mt-auto" onclick="location.href='detalle-noticia.html?id=${noticia.id}'">
                                Berria irakurri / Leer más
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
// Cargar tarjetas en el DOM
        contenedor.innerHTML = htmlFinal;
    }
});