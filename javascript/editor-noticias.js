

async function publicarNoticia() {
    const titulo = document.getElementById("titulo-noticia").value;
    const fecha = document.getElementById("fecha-noticia").value;
    const contenido = document.getElementById("contenido-noticia").value;
    const imagen = document.getElementById("imagen-noticia").value;


    if (!titulo || !fecha || !contenido || !imagen) {
        alert("Mesedez, bete hutsune guztiak berria argitaratu aurretik. / Por favor, completa todos los campos antes de publicar la noticia.");
        return;
    }

    try {
        const { data, error } = await window.supabaseClient
            .from('Noticia')
            .insert([
                {
                    titulo: titulo,
                    fecha: fecha,
                    contenido: contenido,
                    imagen: imagen
                }
            ]);

        if (error) throw error;

        alert("Berria argitaratu egin da! / ¡Noticia publicada con éxito!");
        location.reload(); 

    } catch (error) {
        alert("Supabaseren akatsa / Error de Supabase: " + error.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const boton = document.getElementById("publicar-noticia");

    if (boton) {
        boton.addEventListener("click", publicarNoticia);
    } else {
        console.error("ERROR: No se encontró ningún elemento con ID 'publicar-noticia'");
    }
});