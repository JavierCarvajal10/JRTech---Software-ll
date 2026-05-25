import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, ShoppingCart, ExternalLink, Plus, Star } from 'lucide-react';
import { Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { apiRequest } from '../api/client';
import { FIELD_LIMITS } from '../lib/validation';

interface Producto {
  id: number | string;
  nombre: string;
  precio: number;
  descripcion?: string;
  rating?: number;
  stock?: number;
  imagen?: string;
  especificaciones?: Record<string, string>;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  productos?: Producto[];
  tipo?: string;
  timestamp: Date;
}

const WELCOME_MESSAGE: Message = {
  id: 0,
  text: '¡Hola! 👋 Soy tu asesor virtual. ¿Qué producto de tecnología estás buscando hoy?',
  sender: 'bot',
  timestamp: new Date()
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const { addToCart } = useCart();
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const data = await apiRequest<{
        respuesta?: string;
        productos?: Producto[];
        tipo?: string;
        conversationId?: string;
      }>('/api/chat', {
        method: 'POST',
        body: { message: userMessage.text, conversationId },
      });

      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      const botMessage: Message = {
        id: Date.now() + 1,
        text: data.respuesta || 'No entendí bien 😕',
        sender: 'bot',
        productos: data.productos || [],
        tipo: data.tipo,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: 'Error conectando con el servidor 😕. Intenta de nuevo.',
          sender: 'bot',
          timestamp: new Date()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const iniciarNuevaConversacion = () => {
    setConversationId(null);
    setMessages([WELCOME_MESSAGE]);
    setInputMessage('');
  };

  const handleAddToCart = (p: Producto) => {
    const numericId = typeof p.id === 'number' ? p.id : parseInt(String(p.id).replace(/\D/g, ''), 10) || Date.now();
    addToCart({
      id: numericId,
      name: p.nombre,
      price: p.precio,
      image: p.imagen || ''
    });
    showToast(p.nombre);
  };

  const formatPrice = (price: number) => `$${Number(price).toLocaleString('es-CO')}`;

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white rounded-full shadow-lg hover:scale-110 flex items-center justify-center z-50 transition-transform"
          aria-label="Abrir chat"
        >
          <Bot className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[400px] sm:h-[600px] bg-white sm:rounded-2xl shadow-2xl flex flex-col z-50 sm:border overflow-hidden">
          {/* HEADER */}
          <div className="bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white px-5 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold leading-tight">Asesor Virtual</h3>
                <p className="text-xs text-white/80">En línea</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/20 p-1 rounded-full transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* MENSAJES */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((m) => (
              <div key={m.id} className="space-y-2">
                {/* BURBUJA */}
                <div className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.sender === 'bot' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-[#9146FF] to-[#772CE8] rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`px-4 py-2.5 rounded-2xl max-w-[75%] shadow-sm ${
                      m.sender === 'user'
                        ? 'bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white rounded-br-sm'
                        : 'bg-white text-gray-900 border border-gray-100 rounded-bl-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.text}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        m.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                      }`}
                    >
                      {formatTime(m.timestamp)}
                    </p>
                  </div>
                </div>

                {/* PRODUCTOS */}
                {m.productos && m.productos.length > 0 && (
                  <div className="ml-10 space-y-2">
                    {m.productos.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        className="bg-white rounded-xl border border-gray-200 hover:border-[#9146FF] hover:shadow-md transition-all overflow-hidden"
                      >
                        <div className="flex gap-3 p-3">
                          {/* Imagen */}
                          <Link
                            to={`/producto/${p.id}`}
                            onClick={() => setIsOpen(false)}
                            className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center"
                          >
                            {p.imagen ? (
                              <ImageWithFallback
                                src={p.imagen}
                                alt={p.nombre}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingCart className="w-8 h-8 text-gray-400" />
                            )}
                          </Link>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/producto/${p.id}`}
                              onClick={() => setIsOpen(false)}
                              className="block hover:text-[#9146FF] transition-colors"
                            >
                              <h4 className="font-bold text-sm line-clamp-2 text-gray-900">
                                {p.nombre}
                              </h4>
                            </Link>
                            {p.descripcion && (
                              <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                                {p.descripcion}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-base font-bold text-[#9146FF]">
                                {formatPrice(p.precio)}
                              </p>
                              {p.rating !== undefined && (
                                <div className="flex items-center gap-0.5 text-xs text-yellow-600">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span>{p.rating}</span>
                                </div>
                              )}
                            </div>
                            {p.stock !== undefined && p.stock > 0 && (
                              <p className="text-[10px] text-green-600 font-medium mt-0.5">
                                ● {p.stock} en stock
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex border-t border-gray-100">
                          <Link
                            to={`/producto/${p.id}`}
                            onClick={() => setIsOpen(false)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver producto
                          </Link>
                          <button
                            onClick={() => handleAddToCart(p)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#9146FF] to-[#772CE8] hover:opacity-90 transition-opacity"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            Agregar
                          </button>
                        </div>
                      </div>
                    ))}

                    {m.productos.length > 3 && (
                      <Link
                        to="/catalogo"
                        onClick={() => setIsOpen(false)}
                        className="block text-center text-xs font-semibold text-[#9146FF] hover:text-[#772CE8] py-2 hover:bg-white rounded-lg transition-colors"
                      >
                        Ver {m.productos.length - 3} productos más en el catálogo →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-[#9146FF] to-[#772CE8] rounded-full flex items-center justify-center mr-2">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-3 border-t bg-white flex flex-col gap-2">
            {conversationId && (
              <button
                onClick={iniciarNuevaConversacion}
                className="text-xs text-[#9146FF] hover:text-[#772CE8] font-medium text-left flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Nueva conversación
              </button>
            )}

            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={loading}
                maxLength={FIELD_LIMITS.chatMessage}
                className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-transparent disabled:bg-gray-50"
                placeholder={loading ? 'Esperando respuesta...' : 'Escribe tu mensaje...'}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white p-2 rounded-full hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                aria-label="Enviar mensaje"
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
