import { useState } from 'react';
import { X, Send, Bot } from 'lucide-react';
import { products } from '../data/products';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: '¡Hola! Soy tu asesor virtual de tecnología en JeroTech. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, userMessage]);
    setInputMessage('');

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputMessage);
      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages((prev) => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Find products in catalog based on keywords
    const findProducts = (keywords: string[]) => {
      return products.filter(p =>
        keywords.some(keyword =>
          p.name.toLowerCase().includes(keyword) ||
          p.category.toLowerCase().includes(keyword)
        )
      );
    };

    // Gaming
    if (input.includes('gaming') || input.includes('juego') || input.includes('jugar') || input.includes('gamer')) {
      const gpus = findProducts(['rtx', 'gpu', 'gráfic']);
      const processors = findProducts(['ryzen', 'procesador']);
      if (gpus.length > 0) {
        const gpu = gpus[0];
        return `Para gaming te recomiendo la ${gpu.name}. Es una de las más potentes del catálogo. También tenemos procesadores como el ${processors.length > 0 ? processors[0].name : 'Ryzen 9 7950X3D'} que va perfecto.`;
      }
      return '¿Buscas algo para gaming? Tenemos GPUs potentes y componentes PC. ¿Qué presupuesto manejas?';
    }

    // Phone/Celular
    if (input.includes('celular') || input.includes('teléfono') || input.includes('telefono') || input.includes('móvil') || input.includes('movil') || input.includes('iphone')) {
      const phones = findProducts(['iphone', 'phone']);
      if (phones.length > 0) {
        const phone = phones[0];
        return `Te recomiendo el ${phone.name}. Excelente rendimiento, cámara y durabilidad. Precio: $${phone.price.toLocaleString('es-CO')}.`;
      }
      return 'Tenemos iPhones disponibles. ¿Buscas algo específico?';
    }

    // Laptop/Portátil
    if (input.includes('laptop') || input.includes('portátil') || input.includes('portatil') || input.includes('macbook') || input.includes('computador')) {
      const laptops = findProducts(['macbook', 'laptop', 'pro', 'air']);
      if (laptops.length > 0) {
        const laptop = laptops[0];
        return `La ${laptop.name} es perfecta para trabajo profesional y creativo. Precio: $${laptop.price.toLocaleString('es-CO')}.`;
      }
      return '¿Buscas laptop para trabajo o uso personal? Tenemos MacBooks disponibles.';
    }

    // Audio/Audífonos
    if (input.includes('audífono') || input.includes('audifono') || input.includes('audio') || input.includes('música') || input.includes('musica') || input.includes('sony')) {
      const headphones = findProducts(['sony', 'wh', 'audífono', 'audio']);
      if (headphones.length > 0) {
        const hp = headphones[0];
        return `Los ${hp.name} son los mejores en cancelación de ruido. Perfectos para trabajar o viajar. Precio: $${hp.price.toLocaleString('es-CO')}.`;
      }
      return 'Tenemos audífonos Sony con cancelación de ruido. ¿Te interesan?';
    }

    // General help
    if (input.includes('no sé') || input.includes('no se') || input.includes('ayuda') || input.includes('qué comprar') || input.includes('que comprar') || input.includes('recomienda')) {
      return '¿Qué uso le quieres dar? Gaming, trabajo, uso diario... Con eso te recomiendo algo del catálogo.';
    }

    // Price
    if (input.includes('precio') || input.includes('costo') || input.includes('valor') || input.includes('cuánto') || input.includes('cuanto')) {
      return '¿De qué producto específico necesitas el precio? Dime el nombre o categoría.';
    }

    // Shipping
    if (input.includes('envío') || input.includes('envio') || input.includes('entrega')) {
      return 'Envío gratis a nivel nacional en 2-3 días. También recogida en tienda sin costo.';
    }

    // Warranty
    if (input.includes('garantía') || input.includes('garantia')) {
      return 'Todos los productos: 12 meses de garantía nacional. Apple tiene garantía directa.';
    }

    // Payment
    if (input.includes('pago') || input.includes('pagar')) {
      return 'Aceptamos PSE, NEQUI, tarjetas de crédito (VISA, Mastercard, AMEX) y efectivo al recibir.';
    }

    // Stock
    if (input.includes('stock') || input.includes('disponible') || input.includes('hay')) {
      return '¿Qué producto quieres verificar? El stock se muestra en la página de cada producto.';
    }

    // Greetings
    if (input.includes('hola') || input.includes('holi') || input.includes('buenas')) {
      return '¡Hola! ¿Buscas algo específico? Gaming, celular, laptop, audio...';
    }

    // Thanks
    if (input.includes('gracias')) {
      return '¡Con gusto! Pregunta lo que necesites.';
    }

    // Default
    return '¿Qué tipo de producto buscas? Tenemos: celulares, laptops, componentes PC, audio, accesorios.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-50"
        >
          <Bot className="w-8 h-8" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">Asesor Virtual</h3>
                <p className="text-xs text-white/80">En línea</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-[#9146FF] text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="px-4 py-3 bg-[#9146FF] text-white rounded-xl hover:bg-[#772CE8] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}