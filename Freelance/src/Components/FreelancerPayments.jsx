import { useState, useEffect } from 'react';
import paymentService from '../services/payment.api';
import '../styles/FreelancerPayments.css';

const FreelancerPayments = () => {
    const [payments, setPayments] = useState([]);
    const [summary, setSummary] = useState({
        total_earnings: 0,
        total_payments: 0,
        showing: 0
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    // Cargar historial de pagos
    const loadPaymentHistory = async () => {
        try {
            setLoading(true);
            setError('');
            
            const params = {};
            if (filter !== 'all') {
                params.status = filter;
            }

            const response = await paymentService.getFreelancerPaymentHistory(params);
            setPayments(response.data || []);
            setSummary(response.summary || {});
        } catch (err) {
            setError(err.message || 'Error al cargar historial de pagos');
        } finally {
            setLoading(false);
        }
    };

    // Cargar al montar el componente
    useEffect(() => {
        loadPaymentHistory();
    }, [filter]);

    // Formatear fecha
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-GT', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="freelancer-payments">
            <div className="payments-header">
                <h2>Historial de Pagos</h2>
                <button 
                    className="btn-primary"
                    onClick={loadPaymentHistory}
                    disabled={loading}
                >
                    <i className="ri-refresh-line"></i>
                    {loading ? 'Cargando...' : 'Actualizar'}
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="ri-error-warning-line"></i>
                    {error}
                </div>
            )}

            {/* Resumen de Ganancias */}
            <div className="earnings-summary">
                <div className="summary-card">
                    <div className="summary-icon">
                        <i className="ri-money-dollar-circle-line"></i>
                    </div>
                    <div className="summary-content">
                        <h3>{paymentService.formatCurrency(summary.total_earnings)}</h3>
                        <p>Total Ganado</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon">
                        <i className="ri-file-list-line"></i>
                    </div>
                    <div className="summary-content">
                        <h3>{summary.total_payments}</h3>
                        <p>Pagos Recibidos</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon">
                        <i className="ri-bar-chart-line"></i>
                    </div>
                    <div className="summary-content">
                        <h3>
                            {summary.total_payments > 0 
                                ? paymentService.formatCurrency(summary.total_earnings / summary.total_payments)
                                : paymentService.formatCurrency(0)
                            }
                        </h3>
                        <p>Promedio por Proyecto</p>
                    </div>
                </div>
            </div>

            {/* Filtros */}
            <div className="payments-filters">
                <label>Filtrar por estado:</label>
                <div className="filter-buttons">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        Todos
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completados
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pendientes
                    </button>
                </div>
            </div>

            {/* Lista de Pagos */}
            <div className="payments-list">
                {loading && payments.length === 0 ? (
                    <div className="loading-spinner">
                        <i className="ri-loader-4-line"></i>
                        Cargando pagos...
                    </div>
                ) : payments.length === 0 ? (
                    <div className="empty-state">
                        <i className="ri-inbox-line"></i>
                        <h3>No hay pagos registrados</h3>
                        <p>Completa proyectos para recibir pagos</p>
                    </div>
                ) : (
                    <div className="payments-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Proyecto</th>
                                    <th>Cliente</th>
                                    <th>Monto</th>
                                    <th>Estado</th>
                                    <th>Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>
                                            <div className="payment-date">
                                                {formatDate(payment.transaction_date)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="payment-project">
                                                <strong>{payment.project?.title || 'N/A'}</strong>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="payment-client">
                                                {payment.project?.client?.username || 'N/A'}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="payment-amount">
                                                {paymentService.formatCurrency(parseFloat(payment.amount))}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${payment.status}`}>
                                                {payment.status === 'completed' ? 'Completado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                className="btn-link"
                                                onClick={() => {
                                                    alert(`Detalles del pago:\n\nID: ${payment.id}\nDescripción: ${payment.description || 'N/A'}\nMonto Original: ${payment.metadata?.original_amount ? paymentService.formatCurrency(payment.metadata.original_amount) : 'N/A'}\nComisión: ${payment.metadata?.commission_amount ? paymentService.formatCurrency(payment.metadata.commission_amount) : 'N/A'}`);
                                                }}
                                            >
                                                <i className="ri-eye-line"></i>
                                                Ver
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Información sobre comisiones */}
            <div className="info-box">
                <i className="ri-information-line"></i>
                <p>
                    <strong>Nota:</strong> La plataforma retiene una comisión del 10% sobre cada pago. 
                    El monto mostrado es lo que recibes después de la comisión.
                </p>
            </div>
        </div>
    );
};

export default FreelancerPayments;
