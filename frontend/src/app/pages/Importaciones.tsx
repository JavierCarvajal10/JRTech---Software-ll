import { useState } from 'react';
import { Package, MessageCircle, CheckCircle, DollarSign, Shield, Clock, Loader2 } from 'lucide-react';
import { submitImport } from '../api/imports';
import { friendlyErrorMessage } from '../api/client';
import { FIELD_LIMITS, PATTERNS, MESSAGES, NUMERIC_LIMITS, blockInvalidNumberKeys } from '../lib/validation';

export function Importaciones() {
  const [formData, setFormData] = useState({
    productName: '',
    referenceLink: '',
    price: '',
    quantity: 1,
    specifications: '',
    fullName: '',
    whatsapp: '',
    city: '',
    howDidYouKnow: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedId, setConfirmedId] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};

    if (!formData.productName.trim()) e.productName = MESSAGES.required;
    else if (formData.productName.length > FIELD_LIMITS.productName)
      e.productName = MESSAGES.maxLength(FIELD_LIMITS.productName);

    if (!formData.referenceLink.trim()) e.referenceLink = MESSAGES.required;
    else if (!PATTERNS.url.test(formData.referenceLink)) e.referenceLink = MESSAGES.url;
    else if (formData.referenceLink.length > FIELD_LIMITS.url)
      e.referenceLink = MESSAGES.maxLength(FIELD_LIMITS.url);

    const price = Number(formData.price);
    if (!formData.price.trim()) e.price = MESSAGES.required;
    else if (Number.isNaN(price) || price <= 0) e.price = MESSAGES.positive;
    else if (price > NUMERIC_LIMITS.priceUSD.max)
      e.price = MESSAGES.max(NUMERIC_LIMITS.priceUSD.max);

    const qty = Number(formData.quantity);
    if (!formData.quantity || Number.isNaN(qty) || qty < NUMERIC_LIMITS.importQuantity.min)
      e.quantity = MESSAGES.positive;
    else if (!Number.isInteger(qty)) e.quantity = MESSAGES.integer;
    else if (qty > NUMERIC_LIMITS.importQuantity.max)
      e.quantity = MESSAGES.max(NUMERIC_LIMITS.importQuantity.max);

    if (formData.specifications.length > FIELD_LIMITS.description)
      e.specifications = MESSAGES.maxLength(FIELD_LIMITS.description);

    if (!formData.fullName.trim()) e.fullName = MESSAGES.required;
    else if (formData.fullName.length > FIELD_LIMITS.fullName)
      e.fullName = MESSAGES.maxLength(FIELD_LIMITS.fullName);

    if (!formData.whatsapp.trim()) e.whatsapp = MESSAGES.required;
    else if (!PATTERNS.phone.test(formData.whatsapp)) e.whatsapp = MESSAGES.phone;
    else if (formData.whatsapp.length > FIELD_LIMITS.phone)
      e.whatsapp = MESSAGES.maxLength(FIELD_LIMITS.phone);

    if (!formData.city.trim()) e.city = MESSAGES.required;
    else if (formData.city.length > FIELD_LIMITS.city)
      e.city = MESSAGES.maxLength(FIELD_LIMITS.city);

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const result = await submitImport({
        nombre: formData.fullName.trim(),
        telefono: formData.whatsapp.trim(),
        producto: formData.productName.trim(),
        enlaceReferencia: formData.referenceLink.trim() || undefined,
        descripcion: formData.specifications.trim() || undefined,
        cantidad: Number(formData.quantity) || undefined,
        presupuesto: formData.price ? Number(formData.price) : undefined,
        ciudad: formData.city.trim() || undefined,
        comoNosConocio: formData.howDidYouKnow || undefined,
      });
      setConfirmedId(result.id);
      setFormData({
        productName: '',
        referenceLink: '',
        price: '',
        quantity: 1,
        specifications: '',
        fullName: '',
        whatsapp: '',
        city: '',
        howDidYouKnow: '',
      });
    } catch (err) {
      setSubmitError(friendlyErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const closeSuccessModal = () => setConfirmedId(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0FF] to-white dark:from-gray-950 dark:to-gray-900 py-8 sm:py-12 px-4 sm:px-6">
      {confirmedId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                ¡Solicitud recibida!
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                Número de referencia: <span className="font-bold text-gray-900">#{confirmedId}</span>
              </p>
              <p className="text-gray-600 mb-8 text-lg">
                Te contactaremos por WhatsApp en menos de 24 horas con la cotización.
              </p>
              <button
                onClick={closeSuccessModal}
                className="w-full bg-[#9146FF] text-white px-6 py-4 rounded-xl font-bold hover:bg-[#772CE8] transition-all shadow-lg hover:shadow-xl"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#9146FF] rounded-full mb-4 sm:mb-6 max-w-full">
            <CheckCircle className="w-4 h-4 text-white flex-shrink-0" />
            <span className="text-xs sm:text-sm font-semibold text-white">
              Importación directa desde cualquier parte del mundo
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4">
            ¿No lo encuentras en Colombia?
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#9146FF] mb-4 sm:mb-6">
            Nosotros lo traemos.
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Diligencia el formulario y en menos de 24 horas te enviamos la cotización por WhatsApp.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
          <div className="flex items-start gap-4 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#9146FF] transition-all">
            <div className="flex-shrink-0 w-12 h-12 bg-[#9146FF] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">1</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Diligencia el formulario</h3>
              <p className="text-sm text-gray-600">
                Datos del producto y contacto
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#9146FF] transition-all">
            <div className="flex-shrink-0 w-12 h-12 bg-[#9146FF] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">2</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Recibe tu cotización</h3>
              <p className="text-sm text-gray-600">
                Por WhatsApp en menos de 24h
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-[#9146FF] transition-all">
            <div className="flex-shrink-0 w-12 h-12 bg-[#9146FF] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">3</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Confirma y listo</h3>
              <p className="text-sm text-gray-600">
                Realiza el pago y seguimiento
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Process Info */}
          <div className="space-y-6 lg:space-y-8">
            <div className="bg-white rounded-2xl p-5 sm:p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                ¿Cómo funciona el proceso?
              </h3>
              <p className="text-gray-600 mb-8">
                Solicitar una importación con JeroTech es simple. Sigue estos 3 pasos:
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#9146FF] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Diligencia el formulario</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Cuéntanos qué producto quieres importar, el enlace de referencia, el precio estimado y tus datos de contacto. Entre más detalles nos des, más precisa será la cotización.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-lg">
                      <Clock className="w-4 h-4 text-[#9146FF]" />
                      <span className="text-xs font-semibold text-[#9146FF]">
                        Tarda menos de 3 minutos
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-gray-900 font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Recibe tu cotización por WhatsApp</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Nuestro equipo revisa tu solicitud y te envía la cotización con el precio final, el tiempo estimado de entrega y las condiciones de pago directamente a tu WhatsApp.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-lg">
                      <MessageCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs font-semibold text-yellow-700">
                        Respuesta en menos de 24 horas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Confirma y realizamos el pedido</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Si aceptas la cotización, realizas el pago y nosotros nos encargamos de todo — desde el pedido hasta la entrega en tu ciudad. Te mantendremos informado en cada paso.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 rounded-lg">
                      <Package className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">
                        Seguimiento en tiempo real
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Import Section */}
            <div className="bg-white rounded-2xl p-5 sm:p-8 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                ¿Por qué importar con JeroTech?
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Precios directos sin intermediarios</h4>
                    <p className="text-sm text-gray-600">
                      Importamos directo desde el fabricante o tienda oficial, sin otros adicionales innecesarios.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Proceso seguro y transparente</h4>
                    <p className="text-sm text-gray-600">
                      Te mantenemos informado en cada etapa del proceso, desde la compra hasta la entrega.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Garantía y soporte</h4>
                    <p className="text-sm text-gray-600">
                      Todos nuestros productos importados cuentan con garantía y soporte técnico.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="bg-white rounded-2xl p-5 sm:p-8 border-2 border-gray-200 h-fit lg:sticky lg:top-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Solicitud de importación
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Todos los campos marcados con <span className="text-red-500">*</span> son obligatorios
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Section */}
              <div className="pb-6 border-b border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-[#9146FF]" />
                  <h4 className="font-bold text-gray-900">PRODUCTO A IMPORTAR</h4>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nombre del producto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="productName"
                      value={formData.productName}
                      onChange={handleInputChange}
                      maxLength={FIELD_LIMITS.productName}
                      placeholder="iPhone 16 Pro Max 256GB Negro"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all ${
                        errors.productName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.productName && (
                      <p className="text-red-600 text-xs mt-1">{errors.productName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Enlace de referencia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      name="referenceLink"
                      value={formData.referenceLink}
                      onChange={handleInputChange}
                      maxLength={FIELD_LIMITS.url}
                      placeholder="https://amazon.com/..."
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all ${
                        errors.referenceLink ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.referenceLink ? (
                      <p className="text-red-600 text-xs mt-1">{errors.referenceLink}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Pega el link de Amazon, eBay, BestBuy u otra tienda
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Precio estimado (USD) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          onKeyDown={blockInvalidNumberKeys(true)}
                          onWheel={(e) => e.currentTarget.blur()}
                          min={NUMERIC_LIMITS.priceUSD.min}
                          max={NUMERIC_LIMITS.priceUSD.max}
                          step="any"
                          placeholder="999"
                          className={`w-full pl-8 pr-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all ${
                            errors.price ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          }`}
                          required
                        />
                      </div>
                      {errors.price && (
                        <p className="text-red-600 text-xs mt-1">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Cantidad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        onKeyDown={blockInvalidNumberKeys()}
                        onWheel={(e) => e.currentTarget.blur()}
                        step="1"
                        min={NUMERIC_LIMITS.importQuantity.min}
                        max={NUMERIC_LIMITS.importQuantity.max}
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all ${
                          errors.quantity ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.quantity && (
                        <p className="text-red-600 text-xs mt-1">{errors.quantity}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Especificaciones adicionales
                    </label>
                    <textarea
                      name="specifications"
                      value={formData.specifications}
                      onChange={handleInputChange}
                      maxLength={FIELD_LIMITS.description}
                      placeholder="Color, versión, almacenamiento, accesorios incluidos, etc."
                      rows={3}
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all resize-none ${
                        errors.specifications ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                    />
                    {errors.specifications && (
                      <p className="text-red-600 text-xs mt-1">{errors.specifications}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-[#9146FF]" />
                  <h4 className="font-bold text-gray-900">TUS DATOS DE CONTACTO</h4>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      maxLength={FIELD_LIMITS.fullName}
                      placeholder="Tu nombre"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all ${
                        errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.fullName && (
                      <p className="text-red-600 text-xs mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      maxLength={FIELD_LIMITS.phone}
                      placeholder="+57 300 000 0000"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all ${
                        errors.whatsapp ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.whatsapp && (
                      <p className="text-red-600 text-xs mt-1">{errors.whatsapp}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Ciudad de entrega <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        maxLength={FIELD_LIMITS.city}
                        placeholder="Ibagué, Bogotá..."
                        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all ${
                          errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.city && (
                        <p className="text-red-600 text-xs mt-1">{errors.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        ¿Cómo nos conociste?
                      </label>
                      <select
                        name="howDidYouKnow"
                        value={formData.howDidYouKnow}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9146FF] focus:border-[#9146FF] transition-all cursor-pointer"
                      >
                        <option value="">Selecciona</option>
                        <option value="redes">Redes sociales</option>
                        <option value="google">Google</option>
                        <option value="recomendacion">Recomendación</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {submitError && (
                <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#9146FF] text-white rounded-xl font-bold text-lg hover:bg-[#772CE8] transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Package className="w-6 h-6" />
                    Enviar solicitud de importación
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                Al enviar este formulario aceptas nuestros{' '}
                <a href="#" className="text-[#9146FF] hover:underline">términos y condiciones</a> y la{' '}
                <a href="#" className="text-[#9146FF] hover:underline">política de privacidad</a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
