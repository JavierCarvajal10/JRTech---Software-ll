import db from "../config/database.js";
import { embedText, vectorToSqlLiteral } from "./embedding.service.js";
import { chat as llmChat } from "./llm-provider.js";
import { isRagEnabled } from "./rag.config.js";

const CATEGORY_CACHE_TTL_MS = 60 * 1000;

const CONTACT = {
  whatsapp: {
    url: "https://api.whatsapp.com/send?phone=573153554193",
    display: "+57 315 355 4193",
  },
  instagram: {
    url: "https://www.instagram.com/Jerotech_Col",
    display: "@Jerotech_Col",
  },
};

const STOPWORDS = new Set([
  "para", "con", "sin", "del", "los", "las", "una", "uno", "unos", "unas",
  "que", "muy", "este", "esta", "estos", "estas", "ese", "esa", "eso",
  "por", "como", "pero", "más", "menos", "yo", "tu", "vos", "el", "la",
  "le", "se", "de", "en", "un", "y", "o", "ya", "lo", "te", "me"
]);

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text) {
  return normalize(text).split(" ").filter((t) => t.length > 1);
}

function singularize(token) {
  if (token.length <= 3) return token;
  if (token.endsWith("es") && token.length > 4) return token.slice(0, -2);
  if (token.endsWith("s")) return token.slice(0, -1);
  return token;
}

function tokenSetSingular(text) {
  return new Set(tokenize(text).map(singularize).filter((t) => !STOPWORDS.has(t)));
}

export class ConversationMemory {
  constructor(conversationId) {
    this.id = conversationId;
    this.messages = [];
    this.context = {
      categoria: null,
      categoriaId: null,
      subcategoriaId: null,
      subcategoriaNombre: null,
      precio_max: null,
      precio_min: null,
      uso: null,
      tipo_pc: null,
      marca: null
    };
    this.stage = "greeting";
    this.lastQuestion = null;
  }

  //Este método agrega un nuevo mensaje a la conversación, ya sea del usuario o del asistente (agente).
  addMessage(role, content) {
    this.messages.push({
      role,
      content,
      timestamp: new Date()
    });
    if (role === "user") {
      this.lastUserMessage = content;
    }
  }

  // Este método devuelve los últimos n mensajes de la conversación.
  getLastMessages(n = 5) {
    return this.messages.slice(-n);
  }

  // Este método actualiza el contexto de la conversación con nuevos datos.
  updateContext(data) {
    this.context = { ...this.context, ...data };
  }

  // Este método reinicia el contexto de la conversación, borrando toda la información guardada.
  resetContext() {
    this.context = {
      categoria: null,
      categoriaId: null,
      subcategoriaId: null,
      subcategoriaNombre: null,
      precio_max: null,
      precio_min: null,
      uso: null,
      tipo_pc: null,
      marca: null
    };
    this.lastQuestion = null;
  }

  // Este método convierte el contexto de la conversación en una cadena de texto.
  getContextString() { //Este método convierte el contexto de la conversación en una cadena de texto.
    const filled = Object.entries(this.context)
      .filter(([, v]) => v !== null)
      .map(([k, v]) => `${k}: ${v}`)
      .join(", ");

    return filled || "Sin información específica aún";

  }


  // Este método verifica si el contexto de la conversación tiene suficiente información para
  hasEnoughInfo() {
    return !!(
      this.context.categoria ||
      this.context.categoriaId ||
      this.context.subcategoriaId
    );
      // Este método se utiliza para saber si el asistente ha recopilado la información mínima necesaria
    // (por ejemplo, la categoría del producto) para continuar con la recomendación de productos. Si falta esta información,
    //  el asistente puede pedir más detalles al usuario antes de hacer una recomendación.
  }
}

export class IntelligentAgent {
  constructor() {
    this.conversations = new Map();
    this.categoryCache = { categories: null, expiresAt: 0 };
  }

  getConversation(conversationId) {
    if (!this.conversations.has(conversationId)) {
      this.conversations.set(conversationId, new ConversationMemory(conversationId));
    }
    return this.conversations.get(conversationId);
  }

  async ensureCategoriesLoaded() {
    const now = Date.now();
    if (this.categoryCache.categories && now < this.categoryCache.expiresAt) {
      return this.categoryCache.categories;
    }

    const categories = await db.categoria.findMany({
      include: { categoriaPadre: true },
    });

    this.categoryCache = {
      categories,
      expiresAt: now + CATEGORY_CACHE_TTL_MS,
    };
    return categories;
  }

  // Este método invalida el cache de categorías, es decir, lo borra.
  invalidateCategoryCache() {
    this.categoryCache = { categories: null, expiresAt: 0 };
  }

  // Este método extrae información sobre la categoría de producto mencionada en el mensaje del usuario.
  extractFromCatalog(message) {
    const cats = this.categoryCache.categories || [];
    if (cats.length === 0) return null;

    const tokens = tokenSetSingular(message);
    if (tokens.size === 0) return null;

    let best = null;
    let bestScore = 0;

    for (const cat of cats) {
      const catTokens = tokenSetSingular(cat.nombre);
      if (catTokens.size === 0) continue;

      let matched = 0;
      for (const t of catTokens) {
        if (tokens.has(t)) matched++;
      }
      if (matched === 0) continue;

      const score = matched / catTokens.size;
      if (score > bestScore || (score === bestScore && best && cat.categoriaPadreId !== null && best.categoriaPadreId === null)) {
        bestScore = score;
        best = cat;
      }
    }

    if (!best || bestScore < 0.5) return null;

    return {
      id: best.id,
      nombre: best.nombre,
      isSubcategory: best.categoriaPadreId !== null,
      parentId: best.categoriaPadreId,
      parentName: best.categoriaPadre?.nombre ?? null,
    };
  }

  // Este es el método principal que procesa los mensajes del usuario y decide cómo debe responder el asistente.
  async processMessage(userMessage, conversationId) {
    const memory = this.getConversation(conversationId);

    await this.ensureCategoriesLoaded();

    memory.addMessage("user", userMessage);

    let response;

    const isShortAnswer = userMessage.trim().split(/\s+/).length <= 5;

    // looksLikeNewSearch = el usuario menciona una categoría DIFERENTE a la actual.
    // Ojo: "quiero gaming" sin cambiar de categoría es refinamiento, no búsqueda nueva.
    const newCatalog = this.extractFromCatalog(userMessage);
    const newCategoryName = newCatalog ? (newCatalog.parentName ?? newCatalog.nombre) : null;
    const isCategoryChange =
      !!newCategoryName &&
      !!memory.context.categoria &&
      newCategoryName !== memory.context.categoria;
    const looksLikeNewSearch = isCategoryChange;

    if (memory.stage === "completed" && isCategoryChange) {
      memory.resetContext();
      memory.stage = "greeting";
    }

    const inSlotFlow =
      memory.stage === "collecting_info" &&
      memory.lastQuestion &&
      !this.isGreeting(userMessage) &&
      !looksLikeNewSearch;

    const inRefinementFlow =
      memory.stage === "completed" &&
      !this.isGreeting(userMessage) &&
      !looksLikeNewSearch;

    if (inSlotFlow) {
      response = await this.handleSlotAnswer(userMessage, memory);
    } else if (inRefinementFlow) {
      response = await this.handleRefinement(userMessage, memory);
    } else if (this.isGreeting(userMessage)) {
      response = this.respondGreeting(userMessage, memory);
      memory.stage = "greeting";
      memory.lastQuestion = null;
    } else if (this.isContactQuestion(userMessage)) {
      response = this.respondContact();
    } else if (this.isOffTopic(userMessage)) {
      response = this.redirectOffTopic();
    } else if (this.isProductDetailQuestion(userMessage)) {
      const producto = await this.findProductByName(userMessage);
      if (producto) {
        response = this.formatProductDetail(producto);
      } else if (this.isTechnicalQuestion(userMessage)) {
        response = await this.answerTechnicalQuestion(userMessage, memory);
      } else {
        response = await this.respondChat(userMessage, memory);
      }
    } else if (this.isTechnicalQuestion(userMessage)) {
      response = await this.answerTechnicalQuestion(userMessage, memory);
    } else {
      const intent = await this.analyzeIntent(userMessage, memory);

      if (intent.type === "search_product") {
        response = await this.handleProductSearch(userMessage, memory, intent);
      } else {
        response = await this.respondChat(userMessage, memory);
      }
    }

    memory.addMessage("assistant", response.respuesta);

    return response;
  }

  async handleSlotAnswer(userMessage, memory) {
    const slot = memory.lastQuestion;
    const t = userMessage.toLowerCase().trim();
    const extracted = this.parseProductMessage(userMessage);

    if (slot === "categoria") {
      Object.assign(memory.context, extracted);
    } else if (slot === "tipo_pc") {
      if (/port[aá]til|notebook|laptop/.test(t)) memory.context.tipo_pc = "portatil";
      else if (/escritorio|torre|desktop|de\s+mesa|gabinete/.test(t)) memory.context.tipo_pc = "escritorio";
      else if (extracted.tipo_pc) memory.context.tipo_pc = extracted.tipo_pc;
    } else if (slot === "uso") {
      if (extracted.uso) {
        memory.context.uso = extracted.uso;
      } else if (/redes|multimedia|netflix|streaming|video|pel[ií]cula/.test(t)) {
        memory.context.uso = "multimedia";
      } else if (/m[uú]sica|musical|llamada|trabajo|productivid|oficina|fotograf/.test(t)) {
        memory.context.uso = "trabajo";
      } else {
        memory.context.uso = t.slice(0, 50);
      }
    } else if (slot === "precio_max") {
      if (extracted.precio_max) {
        memory.context.precio_max = extracted.precio_max;
      } else {
        const num = parseInt(t.replace(/[^\d]/g, ""), 10);
        if (!Number.isNaN(num) && num > 0) {
          memory.context.precio_max = num >= 50000 ? num : num * 1000000;
        }
      }
    }

    if (extracted.categoria || extracted.subcategoriaId || extracted.categoriaId) {
      Object.assign(memory.context, extracted);
    }

    memory.lastQuestion = null;

    if (!memory.hasEnoughInfo()) {
      return await this.askForMissingInfo(memory);
    }

    return await this.searchAndRecommend(memory);
  }

  async handleRefinement(userMessage, memory) {
    const extracted = this.parseProductMessage(userMessage);

    if (extracted.precio_max) memory.context.precio_max = extracted.precio_max;
    if (extracted.uso) memory.context.uso = extracted.uso;
    if (extracted.marca) memory.context.marca = extracted.marca;
    if (extracted.tipo_pc) memory.context.tipo_pc = extracted.tipo_pc;

    if (
      !extracted.precio_max &&
      !extracted.uso &&
      !extracted.marca &&
      !extracted.tipo_pc
    ) {
      return await this.respondChat(userMessage, memory);
    }

    return await this.searchAndRecommend(memory);
  }

  isGreeting(message) {
    const t = message.toLowerCase().trim();
    const patterns = [
      /^hola\b/,
      /^holi\b/,
      /^buen[oa]s?\s*(d[ií]as|tardes|noches)?\b/,
      /^qu[eé]\s*(tal|hubo|m[aá]s)\b/,
      /^c[oó]mo\s*est[aá]s?\b/,
      /^c[oó]mo\s*va[s]?\b/,
      /^saludos\b/,
      /^hey\b/
    ];
    return patterns.some((p) => p.test(t)) && t.length < 40;
  }

  isOffTopic(message) {
    const t = message.toLowerCase();
    const offTopicPatterns = [
      /\b(hambre|sed|comida|comer|cena|almuerzo|desayuno|restaurante|receta|cocina[r]?|mercado)\b/,
      /\b(novi[oa]s?|esposo?a?|amor|cita|enamorad[oa]|soltero?a?|pareja)\b/,
      /\b(f[uú]tbol|partido|deporte|equipo|gol|jugador|mundial)\b/,
      /\b(clima|tiempo|lluvia|temperatura|sol|calor|fr[ií]o)\b/,
      /\b(pol[ií]tica|gobierno|presidente|elecciones|congreso|partido pol[ií]tico)\b/,
      /\b(chiste|broma|adivinanza)\b/,
      /\b(canci[oó]n|cantante|m[uú]sica|reggaeton|rock|pop|artista)\b/,
      /\b(m[eé]dico|salud|enfermedad|s[ií]ntoma|dolor|medicamento|hospital)\b/,
      /\b(capital de|pa[ií]s de|continente|geografi[ae])\b/,
      /\b(historia de|filosof[ií]a|religi[oó]n|biblia|dios)\b/,
      /\b(qu[eé]\s+hora|qu[eé]\s+d[ií]a|qu[eé]\s+fecha)\b/,
      /\b(pel[ií]cula|serie|netflix|actor|actriz)\b/,
      /\b(viaje|hotel|vuelo|turismo|playa)\b/,
      /\b(libro|libros|novela|leer|lectura|literatura|autor|escritor|cuento|poema|poes[ií]a)\b/,
      /\b(arte|pintura|pintor|escultura|museo|teatro|[oó]pera)\b/,
      /\b(ropa|zapatos|tenis|camiseta|pantal[oó]n|moda|outfit)\b/,
      /\b(carro|moto|bicicleta|veh[ií]culo|conducir|manejar|gasolina)\b/,
      /\b(mascota|perro|gato|animal)\b/
    ];
    return offTopicPatterns.some((p) => p.test(t));
  }

  redirectOffTopic() {
    const respuestas = [
      "Solo te puedo ayudar con productos de tecnología. ¿Buscas alguna laptop, celular o tablet?",
      "Esa no es mi área, soy tu asesor de tecnología. ¿Qué producto te interesa hoy?",
      "Me especializo solo en tecnología y productos de la tienda. ¿Te ayudo a encontrar un equipo?",
      "Para eso no te puedo ayudar, pero sí con tecnología. ¿Qué estás buscando?"
    ];
    return {
      tipo: "off_topic",
      respuesta: respuestas[Math.floor(Math.random() * respuestas.length)],
      productos: [],
      contexto: "Off-topic redirigido"
    };
  }

  isContactQuestion(message) {
    const t = message.toLowerCase();
    return (
      /\b(c[oó]mo\s+(comprar|compro|pago|pagar))\b/.test(t) ||
      /\b(d[oó]nde\s+(compro|comprar|los?\s+ubico|est[aá]n))\b/.test(t) ||
      /\b(quiero\s+(comprar|hacer\s+(la\s+)?compra|pagar))\b/.test(t) ||
      /\b(contacto|contactarl|atenci[oó]n|asesor[ií]a|hablar\s+con)\b/.test(t) ||
      /\b(whatsapp|wsp|whats|wpp|wa)\b/.test(t) ||
      /\b(instagram|insta\b|ig\b)\b/.test(t) ||
      /\b(tel[eé]fono|n[uú]mero|direcci[oó]n|tienda\s+f[ií]sica|local)\b/.test(t)
    );
  }

  respondContact() {
    const respuesta =
      `Para comprar o resolver dudas, escríbenos directo:\n\n` +
      `📱 WhatsApp: ${CONTACT.whatsapp.display}\n` +
      `${CONTACT.whatsapp.url}\n\n` +
      `📸 Instagram: ${CONTACT.instagram.display}\n` +
      `${CONTACT.instagram.url}\n\n` +
      `Te respondemos rápido en horario Lun–Sáb de 9am a 7pm.`;

    return {
      tipo: "contacto",
      respuesta,
      productos: [],
      contexto: "Información de contacto"
    };
  }

  isProductDetailQuestion(message) {
    const t = message.toLowerCase();
    return (
      /\b(cu[eé]ntame|h[aá]blame|info\s|m[aá]s\s+info|m[aá]s\s+detalles?|detalles?|c[oó]mo\s+es|describ|caracter[ií]sticas|specs|especificaciones|res[eñ]a)\b/.test(t) ||
      /\b(qu[eé]\s+tal\s+(es|el|la|son))\b/.test(t) ||
      /\b(qu[eé]\s+(trae|tiene|incluye))\b/.test(t)
    );
  }

  async findProductByName(message) {
    const tokens = tokenSetSingular(message);
    if (tokens.size < 1) return null;

    // Skip-words que no son distintivos del producto
    const SKIP = new Set(["pro", "max", "plus", "mini", "gb", "tb", "hz", "ram", "ddr5", "ddr4"]);

    const productos = await db.producto.findMany({
      where: { stock: { gt: 0 } },
      include: {
        especificaciones: true,
        categoria: { include: { categoriaPadre: true } },
        imagenes: { take: 1 }
      }
    });

    let best = null;
    let bestScore = 0;
    let bestMatched = 0;

    for (const p of productos) {
      const nameTokens = [...tokenSetSingular(p.nombre)].filter(
        (t) => t.length >= 2 && !SKIP.has(t)
      );
      if (nameTokens.length === 0) continue;

      let matched = 0;
      for (const t of nameTokens) {
        if (tokens.has(t)) matched++;
      }

      const score = matched / nameTokens.length;
      // Necesita ≥2 tokens distintivos coincidentes; usa score como tiebreaker
      if (matched >= 2 && (matched > bestMatched || (matched === bestMatched && score > bestScore))) {
        best = p;
        bestScore = score;
        bestMatched = matched;
      }
    }

    return best;
  }

  formatProductDetail(producto) {
    const partes = [];
    partes.push(`**${producto.nombre}**`);
    if (producto.descripcion) partes.push(producto.descripcion);
    partes.push(`\nPrecio: $${Number(producto.precio).toLocaleString("es-CO")}`);
    if (producto.stock > 0) partes.push(`Disponible (${producto.stock} en stock)`);

    const specs = (producto.especificaciones || []).slice(0, 8);
    if (specs.length > 0) {
      partes.push("\nEspecificaciones:");
      for (const e of specs) {
        partes.push(`• ${e.clave}: ${e.valor}`);
      }
    }

    partes.push(
      `\n¿Te interesa? Para comprarlo escríbenos por WhatsApp (${CONTACT.whatsapp.display}) o IG (${CONTACT.instagram.display}).`
    );

    return {
      tipo: "detalle_producto",
      respuesta: partes.join("\n"),
      productos: [this.mapProducto(producto)],
      contexto: `Detalle de ${producto.nombre}`
    };
  }

  async analyzeIntent(message, memory) {
    const extracted = this.parseProductMessage(message);
    const looksLikeProduct =
      extracted.categoria ||
      extracted.uso ||
      extracted.precio_max ||
      extracted.marca ||
      /\b(quiero|busco|necesito|recomi[eé]ndame|muestrame|compr[ae]r)\b/i.test(message);

    if (looksLikeProduct) {
      return { type: "search_product", confidence: 0.9, entities: extracted };
    }

    const systemPrompt = `Clasifica el mensaje del usuario en UNA categoría. Responde SOLO con la palabra exacta: "search_product" si busca/quiere un producto, o "general_chat" si es conversación, pregunta o duda. Sin explicaciones.`;

    let type = "general_chat";
    try {
      const response = await this.callLLM(
        [{ role: "user", content: message }],
        systemPrompt,
        0.1,
        10
      );
      type = response.toLowerCase().includes("search_product")
        ? "search_product"
        : "general_chat";
    } catch {
      type = "general_chat";
    }

    return { type, confidence: 0.7, entities: extracted };
  }

  async handleProductSearch(userMessage, memory, intent) {
    const extracted = this.parseProductMessage(userMessage);

    // Si el usuario cambió de categoría, los slots viejos ya no aplican.
    // Ej: turno 1 "laptop gaming 5M" → turno 2 "muéstrame celulares"
    // No queremos arrastrar precio_max=5M ni uso=gaming al celular.
    const cambioCategoria =
      extracted.categoria &&
      memory.context.categoria &&
      extracted.categoria !== memory.context.categoria;

    if (cambioCategoria) {
      memory.resetContext();
    }

    memory.updateContext(intent.entities);
    memory.updateContext(extracted);

    if (!memory.hasEnoughInfo()) {
      return await this.askForMissingInfo(memory);
    }

    return await this.searchAndRecommend(memory);
  }

  async askForMissingInfo(memory) {
    const ctx = memory.context;
    let pregunta = null;
    let slot = null;

    if (!ctx.categoria && !ctx.categoriaId && !ctx.subcategoriaId) {
      const cats = this.categoryCache.categories || [];
      const padres = cats.filter((c) => c.categoriaPadreId === null).map((c) => c.nombre);
      const lista =
        padres.length > 0
          ? padres.slice(0, 5).join(", ")
          : "laptops, celulares, audio, accesorios";
      pregunta = `¿Qué tipo de producto buscas hoy? Te puedo ayudar con ${lista}.`;
      slot = "categoria";
    } else if (ctx.categoria === "Computadores" && !ctx.tipo_pc) {
      pregunta = "¿Lo prefieres portátil o de escritorio?";
      slot = "tipo_pc";
    } else if (!ctx.uso) {
      const cat = (ctx.categoria || "").toLowerCase();
      if (cat.includes("audio")) {
        pregunta = "¿Lo quieres más para música, gaming, llamadas/trabajo, o uso mixto?";
      } else if (cat.includes("apple") || cat.includes("celular") || cat.includes("tablet")) {
        pregunta =
          "¿Para qué lo vas a usar más? (redes sociales y multimedia, trabajo/productividad, juegos, fotografía)";
      } else {
        pregunta =
          "¿Para qué lo vas a usar principalmente? (gaming, trabajo, estudio, multimedia, uso general)";
      }
      slot = "uso";
    } else if (!ctx.precio_max) {
      pregunta = "¿Cuál es tu presupuesto máximo?";
      slot = "precio_max";
    }

    memory.stage = "collecting_info";
    memory.lastQuestion = slot;

    return {
      tipo: "pregunta",
      respuesta: pregunta || "¿Qué más te gustaría refinar de tu búsqueda?",
      productos: [],
      contexto: memory.getContextString()
    };
  }

  async searchAndRecommend(memory) {
    const productos = await this.searchProducts(memory.context);

    if (productos.length === 0) {
      memory.lastQuestion = null;
      return {
        tipo: "sin_resultados",
        respuesta:
          "Lamentablemente no encontré productos que coincidan con tus criterios. ¿Quieres ajustar la búsqueda?",
        productos: [],
        contexto: memory.getContextString()
      };
    }

    let response;
    try {
      response = await this.generateRecommendation(
        productos,
        memory.getLastMessages(3),
        memory.context,
        memory.lastUserMessage
      );
    } catch (e) {
      response = this.cannedRecommendation(productos, memory.context, e);
    }

    memory.stage = "completed";
    memory.lastQuestion = null;

    const top = this.pickTopFromResponse(response, productos);

    return {
      tipo: "producto",
      respuesta: response,
      productos: top,
      contexto: memory.getContextString()
    };
  }

  pickTopFromResponse(responseText, productos) {
    if (!productos || productos.length === 0) return productos;
    if (!responseText) return productos.slice(0, 3);

    const norm = (s) =>
      s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const text = norm(responseText);

    // Tokens que aparecen en muchos productos y no son distintivos
    const GENERIC = new Set([
      "pc", "para", "con", "del", "los", "las", "una", "uno",
      "ddr5", "ddr4", "ddr3", "ssd", "hdd", "nvme", "gb", "tb",
      "ram", "i3", "i5", "i7", "i9", "rtx", "gtx", "amd", "intel",
      "ghz", "mhz", "ips", "tipo", "wifi", "the", "and", "pro",
    ]);

    const scoreProduct = (p) => {
      const nameNorm = norm(p.nombre);

      // Tokens-palabra (sin specs genéricas, sin números puros con sufijo gb/tb/hz)
      const wordTokens = nameNorm
        .split(/[\s•\-.,()/"\[\]]+/)
        .filter(
          (t) =>
            t.length >= 3 &&
            !GENERIC.has(t) &&
            !/^\d+(gb|tb|hz|mp|ram)?$/.test(t)
        );

      // Números distintivos (modelos como 4050, 5060, 5700, 9600)
      const numberTokens = (nameNorm.match(/\b\d{3,4}\b/g) || []).filter(
        (n) => parseInt(n, 10) >= 100
      );

      const allTokens = [...new Set([...wordTokens, ...numberTokens])];
      if (allTokens.length === 0) return 0;

      let hits = 0;
      for (const tk of allTokens) {
        if (text.includes(tk)) hits++;
      }

      // hits absolutos + bonus por ratio (desempata cuando 2 productos
      // tienen mismos hits pero uno tiene tokens más distintivos)
      const ratio = hits / allTokens.length;
      let score = hits + ratio * 0.1;

      // Productos agotados: el LLM normalmente los descarta, así que
      // aunque los mencione no deberían ser la primera tarjeta.
      if (p.stock === 0) score -= 5;

      return score;
    };

    const ranked = productos
      .map((p) => ({ p, score: scoreProduct(p) }))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p);

    return ranked.slice(0, 3);
  }

  cannedRecommendation(productos, ctx, err) {
    const cat = ctx.subcategoriaNombre || ctx.categoria || "lo que necesitas";

    // Cuando hay subcategoría específica (ej. "iPad / Accesorios"), priorizar
    // productos cuyo nombre contenga el token principal de la subcategoría
    // (ej. "iPad") sobre accesorios genéricos.
    let ranked = [...productos];
    const subcat = ctx.subcategoriaNombre;
    if (subcat) {
      const tokens = subcat
        .toLowerCase()
        .split(/[\s/]+/)
        .filter((t) => t.length >= 3 && !["accesorios", "para"].includes(t));
      if (tokens.length > 0) {
        ranked.sort((a, b) => {
          const aMatch = tokens.some((t) => a.nombre.toLowerCase().includes(t)) ? 1 : 0;
          const bMatch = tokens.some((t) => b.nombre.toLowerCase().includes(t)) ? 1 : 0;
          return bMatch - aMatch;
        });
      }
    }

    const top3 = ranked.slice(0, 3);
    const isQuota = err?.code === "QUOTA_EXCEEDED";

    const lead = isQuota
      ? `El asistente IA tomó un descanso. Mientras, te dejo estas opciones en ${cat}:`
      : `Te dejo estas opciones en ${cat}:`;

    const list = top3.map((p) => `"${p.nombre}"`).join(", ");

    const cierre = isQuota
      ? `\n\n¿Cuál te llama la atención? Si quieres comprar ya, escríbenos por WhatsApp (${CONTACT.whatsapp.display}) o IG (${CONTACT.instagram.display}).`
      : "\n\n¿Cuál te llama la atención?";

    return `${lead} ${list}.${cierre}`;
  }

  isTechnicalQuestion(message) {
    const t = message.toLowerCase();

    if (/\b(quiero|busco|necesito|recomi[eé]ndame|mu[eé]strame|compr[ae]r|consigueme|conseguir|ver)\b/i.test(t)) {
      return false;
    }

    if (this.extractFromCatalog(message)) {
      return false;
    }

    const tokenCount = t.trim().split(/\s+/).length;
    const hasQuestionMark = /[?¿]/.test(message);
    if (tokenCount <= 2 && !hasQuestionMark) {
      return false;
    }

    const patterns = [
      /\bcuello de botella\b/,
      /\bbottleneck\b/,
      /\bcompatib(le|ilidad)\b/,
      /\bdiferencia(s)?\s+entre\b/,
      /\b(cu[aá]l|qu[eé])\s+es\s+mejor\b/,
      /\b(mejor|peor)\s+que\b/,
      /\bvs\.?\b/,
      /\bsoporta\b/,
      /\bpuedo\s+(usar|conectar|poner|meter)\b/,
      /\bsirve\s+para\b/,
      /\bqu[eé]\s+pasa\s+si\b/,
      /\bpara\s+qu[eé]\s+sirve\b/,
      // Componentes y especificaciones
      /\b(rtx|gtx|ryzen|intel\s+i[3579]|ddr[345]|nvme|ssd|hdd|hz|fps|tdp|vram)\b/,
      /\b(ram|memoria|cpu|procesador|gpu|tarjeta\s+gr[aá]fica|disco|almacenamiento|pantalla|resoluci[oó]n|bater[ií]a|c[aá]mara|megapixel|mp|n[uú]cleo|hilo|cache|frecuencia|ghz|mhz|nm|watts?)\b/,
      // Preguntas tipo "es mucho/poco/suficiente/bueno"
      /\bes\s+(mucho|poco|suficiente|necesario|bueno|malo|mejor)\b/,
      /\bson\s+(mucho|poco|suficientes|necesarios|buenos|malos)\b/,
      /\b(alcanza|alcanzan|rinde|rinden)\b/
    ];
    return patterns.some((p) => p.test(t));
  }

  async answerTechnicalQuestion(message, memory) {
    let contextoProductos = "";
    if (await isRagEnabled()) {
      try {
        const relacionados = await this.semanticSearch(message, {
          tipo: null,
          precio_max: null,
          precio_min: null,
          limit: 3
        });

        const relevantes = relacionados.filter((p) => p.similarity > 0.55);

        if (relevantes.length > 0) {
          contextoProductos =
            "\n\nProductos del catálogo que podrían ser relevantes:\n" +
            relevantes
              .map((p) => `- ${p.nombre} (${p.descripcion || "sin descripción"})`)
              .join("\n");
        }
      } catch (err) {
        console.warn("[rag] no se pudo recuperar contexto semántico:", err.message);
      }
    }

    const systemPrompt = `Eres un asesor técnico experto en hardware y tecnología, en una tienda colombiana. Respondes preguntas técnicas de forma clara y honesta, máximo 4 oraciones. Si hablan de cuellos de botella, compatibilidad o comparaciones, explica el porqué brevemente. Hablas español colombiano natural. Si no estás seguro de algo específico, lo dices. Si en el contexto hay productos relevantes del catálogo, los mencionas al final como sugerencia.

REGLA DE IDIOMA CRÍTICA: Responde EXCLUSIVAMENTE en español. NUNCA uses caracteres en chino, japonés, coreano ni ningún otro alfabeto no latino. Tu respuesta debe ser 100% en español, sin mezclas.`;

    const fewShot = [
      {
        role: "user",
        content: "¿Un Ryzen 5 5600 hace cuello de botella con una RTX 4070?"
      },
      {
        role: "assistant",
        content:
          "En 1080p sí podría notarse algo de cuello de botella en juegos muy dependientes de CPU, pero en 1440p o 4K casi no se siente porque la GPU es la que carga. Para una RTX 4070 lo ideal sería un Ryzen 5 7600 o un Ryzen 7 5700X3D si quieres aprovecharla al máximo."
      },
      {
        role: "user",
        content: "¿Qué diferencia hay entre DDR4 y DDR5?"
      },
      {
        role: "assistant",
        content:
          "DDR5 es más rápida (frecuencias más altas) y eficiente energéticamente, pero también más cara y necesita board y CPU compatibles. DDR4 sigue siendo muy buena para gaming y trabajo general; la diferencia real en rendimiento depende del uso, no siempre se nota."
      },
      {
        role: "user",
        content: message + contextoProductos
      }
    ];

    let respuesta;
    try {
      respuesta = (await this.callLLM(fewShot, systemPrompt, 0.4, 250)).trim();
    } catch (e) {
      respuesta = e?.code === "QUOTA_EXCEEDED"
        ? `El asistente IA está descansando un momento. Para resolver tu duda al toque, escríbenos por WhatsApp (${CONTACT.whatsapp.display}) o IG (${CONTACT.instagram.display}). Igual te puedo mostrar productos del catálogo si me dices qué buscas.`
        : "No pude procesar esa pregunta técnica ahora mismo. ¿Te interesa que busquemos un producto específico?";
    }

    return {
      tipo: "tecnica",
      respuesta,
      productos: [],
      contexto: "Pregunta técnica"
    };
  }

  respondGreeting(message, memory) {
    const t = message.toLowerCase();
    const isHowAreYou = /c[oó]mo\s*(est[aá]s?|va[s]?)|qu[eé]\s*tal/.test(t);

    const saludos = isHowAreYou
      ? [
          "¡Muy bien, gracias! ¿En qué puedo ayudarte hoy? ¿Buscas algún producto en particular?",
          "¡Todo bien por aquí! ¿Te ayudo a encontrar una laptop, celular o tablet?",
          "¡De maravilla! Cuéntame, ¿qué tipo de producto estás buscando?"
        ]
      : [
          "¡Hola! 👋 ¿En qué puedo ayudarte hoy?",
          "¡Hola! ¿Buscas algún producto de tecnología en particular?",
          "¡Hola! Soy tu asesor de tecnología. ¿Qué estás buscando?"
        ];

    const respuesta = saludos[Math.floor(Math.random() * saludos.length)];

    return {
      tipo: "chat",
      respuesta,
      productos: [],
      contexto: "Saludo inicial"
    };
  }

  async respondChat(message, memory) {
    const systemPrompt = `Eres un asesor de ventas de una tienda de tecnología en Colombia. SOLO respondes preguntas relacionadas con tecnología (laptops, celulares, tablets, PCs, accesorios, especificaciones técnicas, marcas) o con la tienda (envíos, garantías, formas de pago, stock). Si la pregunta NO es sobre eso, respondes amablemente que solo ayudas con tecnología y rediriges. Hablas español colombiano natural, máximo 2 oraciones. Nunca explicas lo que vas a decir.

REGLA DE IDIOMA CRÍTICA: Responde EXCLUSIVAMENTE en español. NUNCA uses caracteres en chino, japonés, coreano, árabe ni ningún otro alfabeto no latino. Si te confundes, escribe en español natural.`;

    const fewShot = [
      { role: "user", content: "¿Qué diferencia hay entre SSD y HDD?" },
      { role: "assistant", content: "El SSD es mucho más rápido y silencioso, ideal para el sistema operativo. El HDD da más almacenamiento por menos plata, bueno para guardar archivos. ¿Buscas un equipo con alguno?" },
      { role: "user", content: "¿Hacen envíos a Medellín?" },
      { role: "assistant", content: "¡Sí! Hacemos envíos a todo Colombia. ¿Quieres que te muestre algún producto?" },
      { role: "user", content: "¿Cuál es la capital de Francia?" },
      { role: "assistant", content: "Esa no es mi área, yo solo te puedo ayudar con tecnología 😊. ¿Estás buscando alguna laptop, celular o tablet?" },
      { role: "user", content: "Cuéntame un chiste" },
      { role: "assistant", content: "Para chistes mejor busca un comediante 😅. Yo te ayudo con tecnología, ¿qué producto necesitas?" },
      { role: "user", content: message }
    ];

    let response;
    try {
      response = (await this.callLLM(fewShot, systemPrompt, 0.3, 120)).trim();
    } catch (e) {
      response = e?.code === "QUOTA_EXCEEDED"
        ? `El asistente IA está descansando. Para atención al toque, escríbenos por WhatsApp (${CONTACT.whatsapp.display}) o IG (${CONTACT.instagram.display}). También puedo mostrarte productos del catálogo si me dices qué buscas.`
        : "Cuéntame qué producto te interesa y te ayudo a encontrarlo.";
    }

    return {
      tipo: "chat",
      respuesta: response,
      productos: [],
      contexto: "Chat general"
    };
  }

  async callLLM(messages, systemPrompt, temperature = 0.1, maxTokens = 150) {
    try {
      const raw = await llmChat(messages, systemPrompt, { temperature, maxTokens });
      if (!raw || raw.trim().length === 0) {
        console.warn("[LLM] respuesta vacía. Provider:", process.env.LLM_PROVIDER);
        const err = new Error("EMPTY_RESPONSE");
        err.code = "EMPTY_RESPONSE";
        throw err;
      }
      return this.cleanLLMOutput(raw);
    } catch (error) {
      const status = error.status ?? error.response?.status;
      const isQuota = status === 429 || /quota|rate limit|too many requests/i.test(error.message ?? "");
      console.error("[LLM ERROR]", {
        provider: process.env.LLM_PROVIDER,
        status,
        kind: isQuota ? "QUOTA_EXCEEDED" : (error.code ?? "UNKNOWN"),
        message: (error.message ?? "").slice(0, 300),
      });
      const err = new Error(error.message);
      err.code = isQuota ? "QUOTA_EXCEEDED" : (error.code ?? "LLM_ERROR");
      err.status = status;
      throw err;
    }
  }

  cleanLLMOutput(text) {
    return text
      .split(/<\|im_start\|>|<\|im_end\|>|<\|endoftext\|>/)[0]
      .replace(/<\|[^|]*\|>/g, "")
      .trim();
  }

  parseProductMessage(text) {
    const t = text.toLowerCase();
    const extracted = {};

    const precio = this.parsePriceColombian(t);
    if (precio !== null) {
      extracted.precio_max = precio;
    }

    const fromCatalog = this.extractFromCatalog(text);
    if (fromCatalog) {
      if (fromCatalog.isSubcategory) {
        extracted.subcategoriaId = fromCatalog.id;
        extracted.subcategoriaNombre = fromCatalog.nombre;
        extracted.categoria = fromCatalog.parentName ?? fromCatalog.nombre;
      } else {
        extracted.categoriaId = fromCatalog.id;
        extracted.categoria = fromCatalog.nombre;
      }
    }

    if (!extracted.categoria) {
      const syn = this.matchSynonymToSubcategory(t);
      if (syn) {
        if (syn.subcat) {
          extracted.subcategoriaId = syn.subcat.id;
          extracted.subcategoriaNombre = syn.subcat.nombre;
          extracted.categoria = syn.subcat.categoriaPadre?.nombre ?? syn.subcat.nombre;
        } else if (syn.categoria) {
          extracted.categoria = syn.categoria;
        }
        if (syn.tipo) extracted.tipo_pc = syn.tipo;
      }
    }

    if (extracted.categoria === "Computadores" && !extracted.tipo_pc) {
      if (/port[aá]til|notebook|laptop/.test(t)) extracted.tipo_pc = "portatil";
      else if (/escritorio|torre|desktop|de\s+mesa/.test(t)) extracted.tipo_pc = "escritorio";
    }

    if (t.includes("gaming") || t.includes("juego") || t.includes("jugar")) {
      extracted.uso = "gaming";
    } else if (t.includes("trabajo") || t.includes("oficina") || t.includes("trabajar")) {
      extracted.uso = "trabajo";
    } else if (t.includes("estudio") || t.includes("estudiar") || t.includes("universidad")) {
      extracted.uso = "estudio";
    } else if (/multimedia|netflix|streaming|videos?|peliculas?/.test(t)) {
      extracted.uso = "multimedia";
    }

    const brands = ["apple", "dell", "samsung", "lenovo", "asus", "hp", "sony", "logitech", "razer", "corsair", "nvidia", "amd", "intel"];
    for (const brand of brands) {
      if (t.includes(brand)) {
        extracted.marca = brand;
        break;
      }
    }

    return extracted;
  }

  matchSynonymToSubcategory(t) {
    const cats = this.categoryCache.categories || [];
    const findSubcat = (nombre) =>
      cats.find((c) => c.categoriaPadreId !== null && c.nombre === nombre);

    // Orden importa: subcategorías específicas primero, padre como último recurso.
    const SYNONYMS = [
      { kws: [/port[aá]til/, /\blaptop\b/, /\bnotebook\b/], subcat: findSubcat("Laptops"), tipo: "portatil" },
      { kws: [/\bipad\b/, /\btablet\b/], subcat: findSubcat("iPad / Accesorios") },
      { kws: [/\biphone\b/], subcat: findSubcat("iPhone") },
      { kws: [/\bcelular(es)?\b/, /tel[eé]fono\s+m[oó]vil/, /smartphone/, /m[oó]vil/], subcat: findSubcat("iPhone") },
      { kws: [/audi[fí]ono/, /auricular/, /headphone/], subcat: findSubcat("Audífonos") },
      { kws: [/\bmonitor(es)?\b/, /\bpantalla(s)?\b/], subcat: findSubcat("Monitores") },
      { kws: [/\bteclado(s)?\b/], subcat: findSubcat("Teclados") },
      { kws: [/\bmouse\b/, /\brat[oó]n\b/], subcat: findSubcat("Mouse") },
      { kws: [/\bmicr[oó]fono(s)?\b/], subcat: findSubcat("Micrófonos") },
      { kws: [/\bparlante(s)?\b/, /\baltavoz/, /\baltavoces\b/], subcat: findSubcat("Parlantes") },
      { kws: [/\bc[aá]mara(s)?\b/, /\bwebcam(s)?\b/], subcat: findSubcat("Cámaras") },
      { kws: [/\bgpu\b/, /\btarjeta gr[aá]fica\b/, /\brtx\b/, /\bgtx\b/], subcat: findSubcat("GPU Gráficas") },
      { kws: [/\bprocesador(es)?\b/, /\bcpu\b/, /\bryzen\b/, /\bcore i[3579]\b/], subcat: findSubcat("Procesadores") },
      { kws: [/\bboard(s)?\b/, /\bmotherboard\b/, /\bplaca madre\b/], subcat: findSubcat("Boards") },
      { kws: [/\bram\b/, /\bmemoria ram\b/, /\bddr[345]\b/], subcat: findSubcat("RAM") },
      { kws: [/\bssd\b/, /\bnvme\b/, /\bdisco duro\b/, /\bhdd\b/, /\balmacenamiento\b/], subcat: findSubcat("Almacenamiento") },
      { kws: [/\bfuente(s)?\s+de\s+poder\b/, /\bpsu\b/], subcat: findSubcat("Fuentes de poder") },
      { kws: [/\brefrigeraci[oó]n\b/, /\bdisipador\b/, /\bventilador\b/], subcat: findSubcat("Refri. líquida y aire") },
      // Genéricos al final (categoría padre, no subcategoría específica)
      { kws: [/escritorio/, /\btorre\b/, /\bdesktop\b/, /de\s+mesa/], categoria: "Computadores", tipo: "escritorio" },
      { kws: [/\bcomputador/], categoria: "Computadores" },
      { kws: [/\bpc\b/], categoria: "Computadores" },
    ];

    for (const syn of SYNONYMS) {
      if (syn.kws.some((rx) => rx.test(t))) {
        if (syn.subcat || syn.categoria) return syn;
      }
    }
    return null;
  }

  parsePriceColombian(t) {
    // 1) Numérico con separadores: "3.500.000", "3'500.000", "3,500,000", "3'500'000"
    const numericMatch = t.match(/(\d{1,3}(?:[.,'’]\d{3})+)/);
    if (numericMatch) {
      const n = parseInt(numericMatch[1].replace(/[.,'’]/g, ""), 10);
      if (!Number.isNaN(n) && n >= 50000) return n;
    }

    // 2) "3 millones", "tres millones quinientos", "3 palos y medio"
    const NUMS = { un: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10 };
    const millonesRx = /(\d+|un|uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez)\s*(millones?|millón|palos?)/;
    const m = t.match(millonesRx);
    if (m) {
      const w = m[1];
      const base = (NUMS[w] ?? parseInt(w, 10)) * 1_000_000;
      let extra = 0;
      if (/y\s+medio/.test(t)) extra = 500_000;
      else if (/quinientos/.test(t)) extra = 500_000;
      else if (/setecientos/.test(t)) extra = 700_000;
      else if (/ochocientos/.test(t)) extra = 800_000;
      else if (/novecientos/.test(t)) extra = 900_000;
      return base + extra;
    }

    // 3) "500 mil", "500k", "500 lukas"
    const milMatch = t.match(/(\d+)\s*(mil|k|lukas?)\b/);
    if (milMatch) return parseInt(milMatch[1], 10) * 1000;

    // 4) Número grande suelto: "3500000"
    const lone = t.match(/\b(\d{6,})\b/);
    if (lone) {
      const n = parseInt(lone[1], 10);
      if (!Number.isNaN(n)) return n;
    }

    return null;
  }

  async searchProducts(filters) {
    if (await isRagEnabled()) {
      // Si la subcategoría es precisa (ej. "Laptops"), no filtramos por tipo
      // porque puede excluir productos sin tipo poblado.
      const tipoFiltro = filters.tipo_pc && !filters.subcategoriaId ? filters.tipo_pc : null;
      const queryText = this.buildSearchQuery(filters);
      const categoriaIds = await this.resolveCategoryFilterIds(filters);

      try {
        const ranked = await this.semanticSearch(queryText, {
          tipo: tipoFiltro,
          precio_max: filters.precio_max || null,
          precio_min: filters.precio_min || null,
          categoriaIds,
          limit: 15
        });

        if (ranked.length > 0) {
          return ranked;
        }

        if (filters.precio_max || filters.precio_min) {
          const relaxed = await this.semanticSearch(queryText, {
            tipo: tipoFiltro,
            precio_max: null,
            precio_min: null,
            categoriaIds,
            limit: 15
          });
          if (relaxed.length > 0) return relaxed;
        }
      } catch (err) {
        console.warn("[rag] semantic search falló, usando fallback keyword:", err.message);
      }
    }

    return await this.searchProductsKeyword(filters);
  }

  async resolveCategoryFilterIds(filters) {
    if (filters.subcategoriaId) {
      return [filters.subcategoriaId];
    }
    if (filters.categoriaId) {
      const subIds = await this.getSubcategoryIds(filters.categoriaId);
      return [filters.categoriaId, ...subIds];
    }
    if (filters.categoria) {
      const cats = this.categoryCache.categories || [];
      const target = normalize(filters.categoria);
      const matched = cats.filter(
        (c) =>
          normalize(c.nombre) === target ||
          (c.categoriaPadre && normalize(c.categoriaPadre.nombre) === target)
      );
      if (matched.length > 0) return matched.map((c) => c.id);
    }
    return null;
  }

  buildSearchQuery(filters) {
    const partes = [];
    if (filters.subcategoriaNombre) partes.push(filters.subcategoriaNombre);
    else if (filters.categoria) partes.push(filters.categoria);
    if (filters.uso) partes.push(`para ${filters.uso}`);
    if (filters.marca) partes.push(filters.marca);
    if (filters.precio_max) {
      partes.push(`hasta ${filters.precio_max.toLocaleString()}`);
    }
    return partes.length > 0 ? partes.join(" ") : "producto de tecnología";
  }

  async semanticSearch(queryText, { tipo, precio_max, precio_min, categoriaIds, limit }) {
    const vector = await embedText(queryText);
    const literal = vectorToSqlLiteral(vector);

    const conds = [`p.embedding IS NOT NULL`, `p.stock > 0`];
    const params = [literal];

    if (categoriaIds && categoriaIds.length > 0) {
      const startIdx = params.length;
      categoriaIds.forEach((id) => params.push(id));
      const placeholders = categoriaIds
        .map((_, i) => `$${startIdx + i + 1}`)
        .join(", ");
      conds.push(`p."categoriaId" IN (${placeholders})`);
    }
    if (tipo) {
      params.push(tipo);
      conds.push(`p.tipo = $${params.length}`);
    }
    if (precio_max) {
      params.push(precio_max);
      conds.push(`p.precio <= $${params.length}`);
    }
    if (precio_min) {
      params.push(precio_min);
      conds.push(`p.precio >= $${params.length}`);
    }
    params.push(limit);

    const sql = `
      SELECT p.id, 1 - (p.embedding <=> $1::vector) AS similarity
      FROM "Producto" p
      WHERE ${conds.join(" AND ")}
      ORDER BY p.embedding <=> $1::vector
      LIMIT $${params.length}
    `;

    const rows = await db.$queryRawUnsafe(sql, ...params);
    if (rows.length === 0) return [];

    const ids = rows.map((r) => r.id);
    const productos = await db.producto.findMany({
      where: { id: { in: ids } },
      include: { imagenes: { take: 1 }, especificaciones: true }
    });

    const orden = new Map(rows.map((r, i) => [r.id, i]));
    productos.sort((a, b) => orden.get(a.id) - orden.get(b.id));

    const similitudes = new Map(rows.map((r) => [r.id, Number(r.similarity)]));

    return productos.map((p) => ({
      ...this.mapProducto(p),
      similarity: similitudes.get(p.id)
    }));
  }

  async searchProductsKeyword(filters) {
    const where = { stock: { gt: 0 } };

    if (filters.subcategoriaId) {
      where.categoriaId = filters.subcategoriaId;
    } else if (filters.categoriaId) {
      const subIds = await this.getSubcategoryIds(filters.categoriaId);
      where.categoriaId = { in: [filters.categoriaId, ...subIds] };
    } else if (filters.categoria) {
      const cats = this.categoryCache.categories || [];
      const target = normalize(filters.categoria);
      const matched = cats.filter(
        (c) =>
          normalize(c.nombre) === target ||
          (c.categoriaPadre && normalize(c.categoriaPadre.nombre) === target)
      );
      if (matched.length > 0) {
        where.categoriaId = { in: matched.map((c) => c.id) };
      }
    }

    if (filters.precio_max || filters.precio_min) {
      where.precio = {};
      if (filters.precio_max) where.precio.lte = filters.precio_max;
      if (filters.precio_min) where.precio.gte = filters.precio_min;
    }

    // Solo filtrar por tipo cuando NO hay subcategoría específica.
    // Si ya tenemos subcategoría exacta, la categoría es la fuente de precisión;
    // agregar tipo encima puede excluir productos que no lo tengan poblado.
    if (filters.tipo_pc && !filters.subcategoriaId) {
      where.tipo = filters.tipo_pc;
    }

    if (filters.marca) {
      where.AND = [
        {
          OR: [
            { nombre: { contains: filters.marca, mode: "insensitive" } },
            { descripcion: { contains: filters.marca, mode: "insensitive" } }
          ]
        }
      ];
    }

    const productos = await db.producto.findMany({
      where,
      take: 15,
      orderBy: [{ stock: "desc" }, { precio: "asc" }],
      include: {
        imagenes: { take: 1 },
        especificaciones: true,
        categoria: { include: { categoriaPadre: true } }
      }
    });

    if (productos.length === 0 && filters.marca) {
      const relaxed = { ...where };
      delete relaxed.AND;
      const fallbackResults = await db.producto.findMany({
        where: relaxed,
        take: 15,
        orderBy: [{ stock: "desc" }, { precio: "asc" }],
        include: {
          imagenes: { take: 1 },
          especificaciones: true,
          categoria: { include: { categoriaPadre: true } }
        }
      });
      return fallbackResults.map((p) => this.mapProducto(p));
    }

    return productos.map((p) => this.mapProducto(p));
  }

  async getSubcategoryIds(parentId) {
    const cats = this.categoryCache.categories || [];
    return cats.filter((c) => c.categoriaPadreId === parentId).map((c) => c.id);
  }

  mapProducto(p) {
    return {
      id: p.id,
      nombre: p.nombre,
      precio: Number(p.precio),
      descripcion: p.descripcion,
      stock: p.stock,
      imagen: p.imagenes?.[0]?.url || null,
      especificaciones: (p.especificaciones || []).reduce((acc, e) => {
        acc[e.clave] = e.valor;
        return acc;
      }, {})
    };
  }

  async generateRecommendation(productos, recentMessages, context, originalMessage) {
    const productsText = productos
      .map((p, i) => {
        const specs =
          p.especificaciones && Object.keys(p.especificaciones).length > 0
            ? Object.entries(p.especificaciones)
                .map(([k, v]) => `${k}: ${v}`)
                .join(", ")
            : "";
        const partes = [
          `[${i + 1}] ${p.nombre}`,
          `precio: $${p.precio.toLocaleString("es-CO")}`,
          `stock: ${p.stock}`,
        ];
        if (p.descripcion) partes.push(`descripción: ${p.descripcion}`);
        if (specs) partes.push(`specs: ${specs}`);
        return partes.join(" | ");
      })
      .join("\n");

    const userIntent = originalMessage
      ? `Mensaje del usuario: "${originalMessage}".`
      : "";
    const ctxParts = [];
    if (context.categoria) ctxParts.push(`categoría: ${context.categoria}`);
    if (context.subcategoriaNombre) ctxParts.push(`subcategoría: ${context.subcategoriaNombre}`);
    if (context.uso) ctxParts.push(`uso declarado: ${context.uso}`);
    if (context.precio_max) ctxParts.push(`presupuesto máx: $${context.precio_max.toLocaleString()}`);
    if (context.tipo_pc) ctxParts.push(`tipo: ${context.tipo_pc}`);
    const contextoSlots = ctxParts.length > 0 ? `Contexto recolectado: ${ctxParts.join(", ")}.` : "";

    const systemPrompt = `Eres un vendedor experto en tecnología en Colombia. Recibes el mensaje real del usuario y una lista de productos disponibles con sus especificaciones técnicas. Tu tarea:

1. ENTIENDE qué necesita el usuario más allá de las palabras literales. Razona sobre el caso de uso real:
   - Si menciona un juego específico (Call of Duty, Cyberpunk, Valorant, FIFA, Minecraft, etc.), infiere si es AAA exigente o casual y deduce los requisitos (GPU dedicada, RAM, almacenamiento).
   - Si menciona un programa específico (Photoshop, Premiere, AutoCAD, Excel pesado, programación, etc.), infiere requisitos (RAM, CPU multinúcleo, GPU).
   - Si menciona "edición de video", "renderizar", "stream", infiere las specs que importan.

2. DE LA LISTA, elige UN solo producto como recomendación principal. Tiene que ser uno con stock > 0. Si ningún producto con stock encaja perfecto, di la verdad y recomienda el más cercano disponible.

3. ESTRUCTURA OBLIGATORIA de la respuesta:
   - Frase 1: "Te recomiendo el <nombre exacto del producto principal>" + razón concreta citando una spec del listado.
   - Frase 2 (opcional): "También tienes el <otro producto disponible> como alternativa si <criterio>".
   - NO menciones productos agotados como recomendados. Si quieres referirte a uno agotado, dilo brevemente al final.

4. REGLAS ANTI-ALUCINACIÓN:
   - Las specs que cites deben aparecer LITERALMENTE en el listado (en el nombre, descripción o specs estructuradas). NO inventes RAM, GPU, almacenamiento, ni mezcles specs entre productos.
   - Si una spec no está clara en el listado, no la afirmes; di "según los datos que tengo".
   - El nombre del producto que recomiendas debe coincidir con el del listado, no lo abrevies de forma ambigua.

5. Máximo 4 oraciones. Habla español colombiano natural. NO repitas precios. NO listes todos los productos. NO uses caracteres no latinos.

6. Termina con UNA pregunta corta de seguimiento contextual al caso del usuario.`;

    const userQuery = `${userIntent}
${contextoSlots}

Productos disponibles:
${productsText}

¿Cuál le recomiendas y por qué?`;

    const fewShot = [
      {
        role: "user",
        content: `Mensaje del usuario: "para jugar call of duty warzone".
Contexto recolectado: categoría: Computadores, tipo: portatil, uso declarado: gaming.

Productos disponibles:
[1] Laptop Acer Aspire 3 | precio: $2,200,000 | stock: 5 | specs: cpu: Intel i3-1115G4, ram: 8GB, gpu: integrada, almacenamiento: 256GB SSD
[2] Laptop ASUS TUF F15 | precio: $4,500,000 | stock: 3 | specs: cpu: Intel i5-12500H, ram: 16GB, gpu: RTX 3050, almacenamiento: 512GB SSD
[3] MacBook Air M2 | precio: $5,800,000 | stock: 2 | specs: cpu: Apple M2, ram: 8GB, gpu: integrada, almacenamiento: 256GB SSD

¿Cuál le recomiendas y por qué?`
      },
      {
        role: "assistant",
        content: "Para Call of Duty Warzone te recomiendo la ASUS TUF F15. La RTX 3050 con 16GB de RAM te aguanta el juego en gráficos medio-altos a 60fps tranquilo, que es lo que pide Warzone. Las otras dos no te servirían: la Acer y la MacBook tienen gráficos integrados, no corren juegos AAA decentes.\n\n¿En qué resolución sueles jugar, 1080p o más alta?"
      },
      { role: "user", content: userQuery }
    ];

    return await this.callLLM(fewShot, systemPrompt, 0.4, 280);
  }
}
