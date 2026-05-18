const form = document.getElementById('form');
const submitBtn = form.querySelector('button[type="submit"]');

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.append("access_key", "fbe4526e-216c-4812-a1d5-994beb6c6247");

    const originalText = submitBtn.textContent;

    submitBtn.textContent = " Mezua bidaltzen... / Enviando mensaje...";
    submitBtn.disabled = true;

    try {
        const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            alert("Mezua bidali dugu. Eskerrik asko gurekin harremanetan jartzeagatik! / Mensaje enviado con éxito. ¡Gracias por contactar con nosotros!");
            form.reset();
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        alert("Zerbait gaizki dabil. Mesedez, saiatu berriro. / Algo salió mal. Por favor, inténtalo de nuevo.");
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
});