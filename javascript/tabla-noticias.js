document.addEventListener("DOMContentLoaded", async function () {
    const wrapper = document.getElementById("wrapper");
    const boton = document.getElementById("publicar-noticia");
    if (!wrapper) return;


    console.log("Solicitando datos a Supabase antes de crear la tabla...");
    const { data, error } = await window.supabaseClient
        .from('Noticia')
        .select('*');

    if (error) {
        console.error("Error al obtener datos:", error);
        wrapper.innerHTML = `<div class="alert alert-danger">Error al cargar datos: ${error.message}</div>`;
        return;
    }


    const datosFormateados = data.map(n => [
        n.id,
        typeof n.imagen === 'object' ? 'Sin imagen' : (n.imagen || ''),
        n.titulo || 'Sin título',
        n.fecha || '',
        n.contenido || '',
        ''
    ]);

    console.log("Datos listos para Grid.js:", datosFormateados);


    new gridjs.Grid({
        columns: [
            { name: "ID", hidden: true },
            {
                name: "Irudia / Imagen",
                formatter: (cell) => {
                    if (!cell || cell === 'Sin imagen' || cell.includes('fakepath')) {
                        return gridjs.html(`<span style="color:red; font-size:10px;">URL ez baliogarria / URL inválida</span>`);
                    }

                    return gridjs.html(`
            <div style="text-align:center;">
                <img src="${cell}" 
                     style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"
                     onload="console.log('Imagen cargada ok')"
                     onerror="this.parentElement.innerHTML='<small style=color:orange>Error 403/404</small>'">
            </div>
        `);
                }
            },
            "Izenburua / Título",
            "Data / Fecha",
            {
                name: "Edukia / Contenido",
                formatter: (cell) => {
                    return gridjs.html(`<div style="max-height: 50px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">${cell}</div>`);
                }
            },
            {
                name: 'Ekintzak / Acciones',
                formatter: (cell, row) => {
                    const id = row.cells[0].data;
                    const titulo = row ? row.cells[1]?.data || "Sin-Titulo" : "Sin-Titulo";
                    return gridjs.html(`
                        <div class="d-flex gap-2">
                            <button class="btn boton-editar btn-sm" data-bs-toggle="modal" data-bs-target="#modal" onclick="editarNoticia('${id}')">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button class="btn boton-borrar btn-sm" onclick="borrarNoticia('${id}')">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    `);
                }
            }
        ],
        data: datosFormateados,
        search: true,
        pagination: { limit: 5 },
        resizable: true,
        className: { table: 'table table-hover' },
        language: {
            'search': { 'placeholder': 'Berria bilatu / Buscar noticia' },
            'noRecordsFound': '...'
        }
    }).render(wrapper);

    // lógica para el botón de publicar
    boton.addEventListener("click", async () => {
       const fotoInput = document.getElementById("imagen-noticia");
    const fotoArchivo = fotoInput.files[0];
    const titulo = document.getElementById("titulo-noticia").value;
    const fecha = document.getElementById("fecha-noticia").value;
    let contenido = document.getElementById("trix-editor-noticia").value;
    const inputOculto = document.getElementById("trix-editor-noticia");
    const editorCrear = document.querySelector("#trix-editor-noticia");

    if (editorCrear && editorCrear.editor) {
        contenido = editorCrear.editor.getHTML();
    } else if (inputOculto) {
        contenido = inputOculto.value;
    }

    if (!fotoArchivo) return alert("Aukeratu argazki bat / Selecciona una imagen primero");
    if (!titulo) return alert("Izenburua derrigorrezkoa da / El título es obligatorio");

    try {
        const nombreArchivo = `${Date.now()}_${fotoArchivo.name.replace(/\s+/g, '_')}`;
        
        // subir al Storage
        const { error: uploadError } = await window.supabaseClient
            .storage
            .from('imagenes-noticias')
            .upload(nombreArchivo, fotoArchivo);

        if (uploadError) throw uploadError;

        // obtener la URL pública 
        const { data: urlData } = window.supabaseClient
            .storage
            .from('imagenes-noticias')
            .getPublicUrl(nombreArchivo);

        const urlFinal = urlData.publicUrl;

        // insertar en Supabase
        const { error: insertError } = await window.supabaseClient
            .from('Noticia')
            .insert([{
                titulo: titulo,
                fecha: fecha,
                contenido: contenido,
                imagen: urlFinal
            }]);

        if (insertError) throw insertError;

        alert("Berria argitaratu da! / ¡Noticia publicada con éxito!");
        location.reload();

    } catch (err) {
        console.error("ERROR AL PUBLICAR:", err);
        alert("Arazo bat egon da berria argitaratzerakoan / Error al publicar noticia: " + err.message);
    }
});

window.borrarNoticia = async (id) => {

    if (!confirm(`${id}-dun berria ezabatu nahi al duzu? / ¿Confirma que desea eliminar la noticia con ID "${id}"?`)) return;

    try {
        const { error } = await window.supabaseClient
            .from('Noticia')
            .delete()
            .eq('id', id);

        if (error) throw error;

        alert("Berriaren ezabaketa attakastatsua / Noticia eliminada con éxito");
        location.reload();

    } catch (err) {
        console.error("Error al eliminar:", err);
        alert("Arazo bat egon da berria eguneratzekoan / Error al eliminar noticia: " + err.message);
    }
};


window.editarNoticia = async (id) => {
    try {
        // 1. Obtener los datos de Supabase
        const { data, error } = await window.supabaseClient
            .from('Noticia')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // 2. Rellenar campos normales
        document.getElementById("titulo-noticia-editar").value = data.titulo || "";
        document.getElementById("fecha-noticia-editar").value = data.fecha || "";

        const contenidoNoticia = data.contenido || "";

        // 3. RE-CREACIÓN DINÁMICA DE TRIX (A prueba de errores de renderizado)
        const contenedor = document.getElementById("contenedor-trix-editar");
        
        if (contenedor) {
            // Vaciamos el contenedor por completo para eliminar cualquier rastro del editor viejo/vacío
            contenedor.innerHTML = "";

            // Creamos el input oculto nuevo y le asignamos el valor de Supabase
            const nuevoInput = document.createElement("input");
            nuevoInput.id = "trix-noticia-editar";
            nuevoInput.type = "hidden";
            nuevoInput.name = "contenido_editar";
            nuevoInput.value = contenidoNoticia;

            // Creamos el elemento del editor Trix desde cero
            const nuevoEditor = document.createElement("trix-editor");
            nuevoEditor.setAttribute("input", "trix-noticia-editar");
            nuevoEditor.className = "editor-modal-noticia";
            
            // Truco maestro: Le inyectamos el HTML directamente en su atributo de nacimiento
            nuevoEditor.setAttribute("value", contenidoNoticia);

            // Los metemos al DOM. Al renderizarse juntos desde cero, Trix se ve obligado 
            // a leer el 'value' del input de forma nativa e inmediata durante su arranque.
            contenedor.appendChild(nuevoInput);
            contenedor.appendChild(nuevoEditor);
        }

        // 4. Lógica para guardar cambios
        document.getElementById("guardar-cambios").onclick = async function () {
            const nuevoTitulo = document.getElementById("titulo-noticia-editar").value;
            const nuevaFecha = document.getElementById("fecha-noticia-editar").value;
            
            // Leemos del input recién creado
            const nuevoContenido = document.getElementById("trix-noticia-editar").value;
            
            const fotoInput = document.getElementById("imagen-noticia-editar");
            const nuevaFotoArchivo = fotoInput.files[0];

            if (!nuevoTitulo) return alert("Izenburua derrigorrezkoa da / El título es obligatorio");

            try {
                let datosActualizados = {
                    titulo: nuevoTitulo,
                    fecha: nuevaFecha,
                    contenido: nuevoContenido
                };

                if (nuevaFotoArchivo) {
                    const nombreArchivo = `${Date.now()}_${nuevaFotoArchivo.name.replace(/\s+/g, '_')}`;
                    const { error: storageError } = await window.supabaseClient.storage
                        .from('imagenes-noticias')
                        .upload(nombreArchivo, nuevaFotoArchivo);

                    if (storageError) throw storageError;

                    const { data: urlData } = window.supabaseClient.storage
                        .from('imagenes-noticias')
                        .getPublicUrl(nombreArchivo);

                    datosActualizados.imagen = urlData.publicUrl;
                }

                const { error: updateError } = await window.supabaseClient
                    .from('Noticia')
                    .update(datosActualizados)
                    .eq('id', id);

                if (updateError) throw updateError;

                alert("Eguneraketa arrakastatsua! / Noticia actualizada con éxito");
                location.reload();

            } catch (err) {
                alert("Arazo bat egon da aldaketak gordetzerakoan / Error al guardar cambios: " + err.message);
            }
        };
    } catch (err) {
        console.error("Error al cargar noticia:", err);
        alert("Arazo bat egon da berria kargatzerakoan / Error al cargar noticia: " + err.message);
    }
}});