import { useState } from 'react';
import '../styles/PaymentGateway.css';

const PaymentGateway = ({ isOpen, onClose, projectData, onSuccess }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    // Formatear número de tarjeta (agregar espacios cada 4 dígitos)
    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\s/g, '');
        const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
        return formatted.substring(0, 19); // Máximo 16 dígitos + 3 espacios
    };

    // Formatear fecha de expiración (MM/YY)
    const formatExpiryDate = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
        }
        return cleaned;
    };

    // Validar formulario
    const validateForm = () => {
        const cleanCard = cardNumber.replace(/\s/g, '');
        
        if (cleanCard.length !== 16) {
            setError('Número de tarjeta inválido (debe tener 16 dígitos)');
            return false;
        }

        if (!cardName.trim()) {
            setError('Ingresa el nombre del titular');
            return false;
        }

        const [month, year] = expiryDate.split('/');
        if (!month || !year || parseInt(month) < 1 || parseInt(month) > 12) {
            setError('Fecha de expiración inválida');
            return false;
        }

        if (cvv.length !== 3 && cvv.length !== 4) {
            setError('CVV inválido');
            return false;
        }

        return true;
    };

    // Procesar pago real
    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        try {
            setProcessing(true);

            // Simular procesamiento de pago (2 segundos)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Aquí iría la integración real con Stripe, PayPal, etc.
            // Por ahora, simulamos un pago exitoso
            const paymentResult = {
                success: true,
                transaction_id: 'TXN-' + Date.now(),
                amount: projectData.amount,
                card_last4: cardNumber.slice(-4),
                timestamp: new Date().toISOString()
            };

            onSuccess(paymentResult);
        } catch (err) {
            setError('Error al procesar el pago. Intenta nuevamente.');
        } finally {
            setProcessing(false);
        }
    };

    // Pago de prueba (sin validación)
    const handleTestPayment = async () => {
        try {
            setProcessing(true);
            setError('');

            // Simular procesamiento
            await new Promise(resolve => setTimeout(resolve, 1000));

            const paymentResult = {
                success: true,
                transaction_id: 'TEST-' + Date.now(),
                amount: projectData.amount,
                card_last4: '4242',
                timestamp: new Date().toISOString(),
                test_mode: true
            };

            onSuccess(paymentResult);
        } catch (err) {
            setError('Error en pago de prueba');
        } finally {
            setProcessing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="gateway-overlay" onClick={onClose}>
            <div className="gateway-container" onClick={(e) => e.stopPropagation()}>
                <div className="gateway-header">
                    <h2>Pasarela de Pago</h2>
                    <button className="gateway-close" onClick={onClose}>
                        <i className="ri-close-line"></i>
                    </button>
                </div>

                <div className="gateway-body">
                    {/* Resumen del pago */}
                    <div className="payment-summary-box">
                        <h3>Resumen del Pago</h3>
                        <div className="summary-item">
                            <span>Proyecto:</span>
                            <strong>{projectData.project_title}</strong>
                        </div>
                        <div className="summary-item">
                            <span>Freelancer:</span>
                            <strong>{projectData.freelancer?.username}</strong>
                        </div>
                        <div className="summary-item total">
                            <span>Monto a pagar:</span>
                            <strong className="amount">Q {projectData.amount?.toFixed(2)}</strong>
                        </div>
                        <p className="info-text">
                            <i className="ri-shield-check-line"></i>
                            Los fondos se mantendrán en custodia hasta completar el proyecto
                        </p>
                    </div>

                    {error && (
                        <div className="gateway-error">
                            <i className="ri-error-warning-line"></i>
                            {error}
                        </div>
                    )}

                    {/* Formulario de tarjeta */}
                    <form onSubmit={handlePayment} className="payment-form">
                        <div className="form-group">
                            <label>Número de Tarjeta</label>
                            <div className="input-with-icon">
                                <i className="ri-bank-card-line"></i>
                                <input
                                    type="text"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardNumber}
                                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                    disabled={processing}
                                    maxLength="19"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Nombre del Titular</label>
                            <div className="input-with-icon">
                                <i className="ri-user-line"></i>
                                <input
                                    type="text"
                                    placeholder="NOMBRE APELLIDO"
                                    value={cardName}
                                    onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                    disabled={processing}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Fecha de Expiración</label>
                                <div className="input-with-icon">
                                    <i className="ri-calendar-line"></i>
                                    <input
                                        type="text"
                                        placeholder="MM/YY"
                                        value={expiryDate}
                                        onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                                        disabled={processing}
                                        maxLength="5"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>CVV</label>
                                <div className="input-with-icon">
                                    <i className="ri-lock-line"></i>
                                    <input
                                        type="text"
                                        placeholder="123"
                                        value={cvv}
                                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                                        disabled={processing}
                                        maxLength="4"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="gateway-actions">
                            <button
                                type="button"
                                className="btn-test"
                                onClick={handleTestPayment}
                                disabled={processing}
                            >
                                <i className="ri-flask-line"></i>
                                Pago de Prueba
                            </button>

                            <button
                                type="submit"
                                className="btn-pay"
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <i className="ri-loader-4-line rotating"></i>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <i className="ri-secure-payment-line"></i>
                                        Pagar Q {projectData.amount?.toFixed(2)}
                                    </>
                                )}
                            </button>
                        </div>

                        <div className="security-badges">
                            <div className="badge">
                                <i className="ri-shield-check-fill"></i>
                                <span>Pago Seguro</span>
                            </div>
                            <div className="badge">
                                <i className="ri-lock-fill"></i>
                                <span>Cifrado SSL</span>
                            </div>
                            <div className="badge">
                                <i className="ri-verified-badge-fill"></i>
                                <span>Verificado</span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentGateway;
