import { IntelligentAgent } from "../services/agent-intelligent.js";

// Crear una instancia global del agente
const agent = new IntelligentAgent();

/*
 * Controlador principal del chat
 * Recibe mensajes del usuario y los procesa con el agente inteligente
 */
export async function chatController(req, res) {
  try {
    // Extraer datos del request
    const { message, conversationId } = req.body;

    // validacion 1: Mensaje vacío
    if (!message || typeof message !== "string" || message.length === 0) {
      return res.status(400).json({
        error: "El mensaje no puede estar vacío",
        status: 400
      });
    }

    // validacion 2: Mensaje muy largo
    if (message.length > 1000) {
      return res.status(400).json({
        error: "El mensaje es demasiado largo (máximo 1000 caracteres)",
        status: 400
      });
    }

    // GENERAR ID DE CONVERSACIÓN SI NO EXISTE
    // El ID se usa para mantener la memoria entre mensajes
    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // PROCESAR MENSAJE CON EL AGENTE
    // Esta línea es donde ocurre TODA la magia
    const response = await agent.processMessage(message, convId);

    // RETORNAR RESPUESTA AL FRONTEND
    return res.json({
      conversationId: convId,        // Importante: el frontend lo guarda
      tipo: response.tipo,            // "chat", "pregunta", "producto", etc
      respuesta: response.respuesta,  // La respuesta del agente
      productos: response.productos || [],  // Productos encontrados (si aplica)
      contexto: response.contexto,    // Info de la conversación
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error en chatController:", error);
    
    return res.status(500).json({
      error: "Error procesando tu mensaje",
      message: error.message,
      status: 500
    });
  }
}
