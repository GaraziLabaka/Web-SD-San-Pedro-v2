// configuración global
const noticiasPorPagina = 5;
let paginaActual = 1;
let totalPaginas = 0;

document.addEventListener('DOMContentLoaded', () => {
    // primera carga
    cargarPagina(1);
});


async function cargarPagina(numeroPagina) {
    if (numeroPagina < 1) return; 
    
    paginaActual = numeroPagina;
    
    // Obtener los datos de Supabase y renderizar noticias
    const noticias = await obtenerNoticias(paginaActual);
    renderizarNoticias(noticias);
    await actualizarPaginacion();
}

async function obtenerNoticias(pagina) {
    const desde = (pagina - 1) * noticiasPorPagina;
    const hasta = desde + noticiasPorPagina - 1;

    const { data, error } = await window.supabaseClient
        .from('Noticia')
        .select('*')
        .order('fecha', { ascending: false })
        .range(desde, hasta);

    if (error) {
        console.error("Error al traer noticias:", error);
        return [];
    }
    return data;
}

// renderizar noticias
function renderizarNoticias(noticias) {
    const contenedor = document.getElementById("contenedor-noticias");
    contenedor.innerHTML = ""; // Limpiamos lo anterior

    if (noticias.length === 0) {
        contenedor.innerHTML = "<p>Ez dago berririk / No hay más noticias.</p>";
        return;
    }

    noticias.forEach(noticia => {
        contenedor.innerHTML += `
            <div class="col-12 col-sm-6 col-md-4 mb-4 d-flex">
            <div class="card w-100 shadow-sm d-flex flex-column" style="overflow: hidden;">
                <img src="${noticia.imagen}" style="width: 100%; height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column flex-grow-1">
                    <h5 class="fw-bold">${noticia.titulo}</h5>
                    <p class="text-muted small">${noticia.fecha}</p>
                    <div style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; height: 4.5em; line-height: 1.5em;">
                        ${noticia.contenido}
                    </div>
                </div>
                <button class="btn boton-admin m-3" onclick="location.href='detalle-noticia.html?id=${noticia.id}'">
                    Berria irakurri / Leer más
                </button>
            </div>
        </div>
`})
    }
// función que renderiza los botones 
async function actualizarPaginacion() {
    const paginacion = document.querySelector(".paginacion-noticias");
    
    // calcular total de páginas
    const { count } = await window.supabaseClient
        .from('Noticia')
        .select('*', { count: 'exact', head: true });

    totalPaginas = Math.ceil(count / noticiasPorPagina);
    paginacion.innerHTML = "";

    // Botón Anterior
    paginacion.innerHTML += `
        <li class="page-item ${paginaActual === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="cargarPagina(${paginaActual - 1})">&laquo;</a>
        </li>`;

    // Botones numéricos
    for (let i = 1; i <= totalPaginas; i++) {
        paginacion.innerHTML += `
            <li class="page-item ${i === paginaActual ? 'active' : ''}">
                <a class="page-link" href="javascript:void(0)" onclick="cargarPagina(${i})">${i}</a>
            </li>`;
    }

    // Botón Siguiente
    paginacion.innerHTML += `
        <li class="page-item ${paginaActual === totalPaginas ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0)" onclick="cargarPagina(${paginaActual + 1})">&raquo;</a>
        </li>`;
}