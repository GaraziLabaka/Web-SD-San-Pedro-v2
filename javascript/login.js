// javascript/login.js
document.addEventListener("DOMContentLoaded", () => {
    const boton = document.querySelector(".boton-admin");

    boton.addEventListener("click", async () => {
        const email = document.getElementById("usuario").value;
        const password = document.getElementById("password").value;

        if (!window.supabaseClient) {
            alert("Akatsa: Ezin izan dugu segurtasun zerbitzariarekin konektatu / Error: No se pudo conectar con el servidor de seguridad.");
            return;
        }

        try {
            const { data, error } = await window.supabaseClient.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                alert("Akatsa sarreran / Error de acceso: " + error.message);
            } else {
                console.log("Saioa hasten... / Sesión iniciada con éxito");
                window.location.href = "admin.html"; 
            }
        } catch (err) {
            console.error(err);
            alert(" Akatsa konexioan / Error crítico al intentar conectar.");
        }
    });
});