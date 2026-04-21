import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Truck, Package, CheckCircle, MessageCircle } from 'lucide-react';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function Cart() {
  const { items, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const [isCheckout, setIsCheckout] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    country: 'Colombia',
    postalCode: '',
    additionalDetails: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('es-CO')}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Este campo es obligatorio';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Este campo es obligatorio';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Este campo es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Ingresa un correo válido';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Este campo es obligatorio';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Este campo es obligatorio';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'Este campo es obligatorio';
    }
    if (!formData.department.trim()) {
      newErrors.department = 'Este campo es obligatorio';
    }
    if (!formData.country.trim()) {
      newErrors.country = 'Este campo es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowSuccessModal(true);
  };

  const handleWhatsAppContact = () => {
    const message = `¡Hola! Acabo de realizar una compra en JeroTech.\n\nDatos del pedido:\n${items.map(item => `- ${item.name} (x${item.quantity})`).join('\n')}\n\nTotal: $${getTotalPrice().toLocaleString('es-CO')}\n\nDatos de contacto:\nNombre: ${formData.firstName} ${formData.lastName}\nEmail: ${formData.email}\nTeléfono: ${formData.phone}\nDirección: ${formData.address}, ${formData.city}, ${formData.department}`;

    const phoneNumber = '573001234567'; // Reemplazar con número real
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');

    clearCart();
    setShowSuccessModal(false);
    setIsCheckout(false);
  };

  const handleWaitContact = () => {
    clearCart();
    setShowSuccessModal(false);
    setIsCheckout(false);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-16">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-8">¡Agrega algunos productos para comenzar!</p>
            <Link
              to="/catalogo"
              className="inline-flex items-center gap-2 bg-[#9146FF] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#772CE8] transition-all shadow-lg hover:shadow-xl"
            >
              Explorar catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isCheckout) {
    return (
      <>
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  ¡Compra realizada correctamente!
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Te contactaremos en breve para confirmar disponibilidad, pago y entrega.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={handleWhatsAppContact}
                    className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#20BA5A] transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Continuar por WhatsApp
                  </button>
                  <button
                    onClick={handleWaitContact}
                    className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    Prefiero esperar contacto
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setIsCheckout(false)}
              className="flex items-center gap-2 text-[#9146FF] hover:text-[#772CE8] font-semibold mb-6 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al carrito
            </button>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar compra</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulario */}
            <div className="lg:col-span-2">
              <form onSubmit={handleCheckout} className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border-2 border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#9146FF]" />
                    Información de entrega
                  </h2>
                  <div className="space-y-4">
                    {/* Nombres */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Primer nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all ${
                            errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {errors.firstName && (
                          <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Primer apellido <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all ${
                            errors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {errors.lastName && (
                          <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Email y Teléfono */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all ${
                            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Teléfono <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all ${
                            errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                      </div>
                    </div>

                    {/* Dirección */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Dirección completa <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Calle, número, piso, apartamento..."
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all ${
                          errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                      />
                      {errors.address && (
                        <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                      )}
                    </div>

                    {/* Ciudad, Departamento */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Ciudad <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all ${
                            errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Departamento <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all ${
                            errors.department ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {errors.department && (
                          <p className="text-red-500 text-xs mt-1">{errors.department}</p>
                        )}
                      </div>
                    </div>

                    {/* País y Código Postal */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          País <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all ${
                            errors.country ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                        />
                        {errors.country && (
                          <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Código postal <span className="text-gray-400">(opcional)</span>
                        </label>
                        <input
                          type="text"
                          name="postalCode"
                          value={formData.postalCode}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all"
                        />
                      </div>
                    </div>

                    {/* Detalles adicionales */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Detalles adicionales <span className="text-gray-400">(opcional)</span>
                      </label>
                      <textarea
                        name="additionalDetails"
                        value={formData.additionalDetails}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Instrucciones especiales de entrega, puntos de referencia, etc."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#9146FF] to-[#772CE8] text-white px-8 py-4 rounded-xl font-bold hover:from-[#772CE8] hover:to-[#9146FF] transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] text-lg"
                >
                  Finalizar compra
                </button>
              </form>
            </div>

            {/* Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del pedido</h2>
                <div className="space-y-3 mb-4">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.selectedColor}`} className="flex gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-600">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-bold text-[#9146FF]">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>Gratis</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-[#9146FF]">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Carrito de compras</h1>
          <Link
            to="/catalogo"
            className="text-[#9146FF] hover:text-[#772CE8] font-semibold transition-colors"
          >
            Seguir comprando
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items del carrito */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.selectedColor}`}
                className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-[#9146FF] transition-all"
              >
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{item.name}</h3>
                    {item.selectedColor && (
                      <p className="text-sm text-gray-600 mb-2">Color: {item.selectedColor}</p>
                    )}
                    <p className="text-2xl font-bold text-[#9146FF] mb-4">
                      {formatPrice(item.price)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all"
                        >
                          <Minus className="w-4 h-4 text-gray-700" />
                        </button>
                        <span className="w-12 text-center font-bold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-all"
                        >
                          <Plus className="w-4 h-4 text-gray-700" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-green-600 font-semibold">Gratis</span>
                </div>
                <div className="border-t-2 border-gray-200 pt-3">
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-[#9146FF]">{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsCheckout(true)}
                className="w-full bg-[#9146FF] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#772CE8] transition-all shadow-lg hover:shadow-xl mb-4"
              >
                Proceder al pago
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
