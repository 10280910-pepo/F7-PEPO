
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "Método no permitido."
    });
  }

  try {
    const { nombre, correo, mensaje } = req.body || {};

    if (
      typeof nombre !== "string" ||
      typeof correo !== "string" ||
      typeof mensaje !== "string"
    ) {
      return res.status(400).json({
        error: "Completá todos los campos."
      });
    }

    const n = nombre.trim();
    const c = correo.trim();
    const m = mensaje.trim();

    if (
      !n || n.length > 80 ||
      !c || c.length > 150 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c) ||
      !m || m.length > 1500
    ) {
      return res.status(400).json({
        error: "Revisá los datos del formulario."
      });
    }

    const webhook = process.env.DISCORD_WEBHOOK_URL;

    if (!webhook) {
      return res.status(500).json({
        error: "Falta configurar el servidor."
      });
    }

    const respuesta = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        allowed_mentions: { parse: [] },
        embeds: [{
          title: "Nuevo mensaje | VELOCITY PEPO",
          color: 15151410,
          fields: [
            { name: "Nombre", value: n },
            { name: "Correo", value: c },
            { name: "Mensaje", value: m }
          ],
          timestamp: new Date().toISOString()
        }]
      })
    });

    if (!respuesta.ok) {
      console.error("Error de Discord:", respuesta.status);
      return res.status(502).json({
        error: "Discord no pudo recibir el mensaje."
      });
    }

    return res.status(200).json({
      ok: true,
      message: "Mensaje enviado correctamente."
    });

  } catch (error) {
    console.error("Error de contacto:", error);
    return res.status(500).json({
      error: "Ocurrió un error al enviar el mensaje."
    });
  }
};
