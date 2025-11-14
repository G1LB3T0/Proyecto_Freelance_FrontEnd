import { useState, useEffect } from 'react';
import paymentService from '../services/payment.api';
import PaymentGateway from './PaymentGateway';
import '../styles/PaymentManagement.css';

const PaymentManagement = () => {
    const [pendingPayments, setPendingPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showPaymentGateway, setShowPaymentGateway] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

    // Cargar pagos pendientes
    const loadPendingPayments = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await paymentService.getClientPendingPayments();
            setPendingPayments(response.data || []);
        } catch (err) {
            setError(err.message || 'Error al cargar pagos pendientes');
        } finally {
            setLoading(false);
        }
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        loadPendingPayments();
    }, []);

    // Abrir modal de depósito
    const openDepositModal = (project) => {
        setSelectedProject(project);
        // Si hay depósito parcial, sugerir el monto restante, sino el monto total
        const suggestedAmount = project.remaining_amount > 0 ? project.remaining_amount : project.amount;
        setDepositAmount(suggestedAmount.toString());
        setShowDepositModal(false); // No usar el modal antiguo
        setShowPaymentGateway(true); // Abrir pasarela directamente
        setError('');
        setSuccess('');
    };

    // Manejar éxito del pago desde la pasarela
    const handlePaymentSuccess = async (paymentResult) => {
        try {
            setLoading(true);
            setShowPaymentGateway(false);
            
            // Enviar el depósito al backend
            await paymentService.depositToEscrow(
                selectedProject.project_id,
                parseFloat(depositAmount),
                paymentResult.test_mode ? 'test_payment' : 'credit_card'
            );

            setSuccess(`Pago procesado exitosamente! Transacción: ${paymentResult.transaction_id}`);
            setSelectedProject(null);
            setDepositAmount('');
            
            // Recargar pagos pendientes
            loadPendingPayments();
        } catch (err) {
            setError(err.message || 'Error al registrar el pago');
        } finally {
            setLoading(false);
        }
    };

    // Depositar fondos en escrow
    const handleDeposit = async (e) => {
        e.preventDefault();
        
        if (!selectedProject || !depositAmount) {
            setError('Datos incompletos');
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            await paymentService.depositToEscrow(
                selectedProject.project_id,
                parseFloat(depositAmount),
                paymentMethod
            );

            setSuccess('Fondos depositados exitosamente en escrow');
            setShowDepositModal(false);
            setSelectedProject(null);
            setDepositAmount('');
            
            // Recargar pagos pendientes
            loadPendingPayments();
        } catch (err) {
            setError(err.message || 'Error al depositar fondos');
        } finally {
            setLoading(false);
        }
    };

    // Liberar pago al freelancer
    const handleReleasePayment = async (project) => {
        if (!confirm(`¿Estás seguro de liberar el pago de ${paymentService.formatCurrency(project.amount)} al freelancer ${project.freelancer.username}?`)) {
            return;
        }

        try {
            setLoading(true);
            setError('');
            
            const response = await paymentService.releasePayment(project.project_id);
            
            setSuccess(`Pago liberado exitosamente. El freelancer recibirá ${paymentService.formatCurrency(response.data.summary.freelancer_receives)}`);
            
            // Recargar pagos pendientes
            loadPendingPayments();
        } catch (err) {
            setError(err.message || 'Error al liberar pago');
        } finally {
            setLoading(false);
        }
    };

    // Ver detalles del pago
    const [projectDetails, setProjectDetails] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const viewPaymentDetails = async (projectId) => {
        try {
            setLoading(true);
            const response = await paymentService.getProjectPaymentStatus(projectId);
            setProjectDetails(response.data);
            setShowDetailsModal(true);
        } catch (err) {
            setError(err.message || 'Error al obtener detalles');
        } finally {
            setLoading(false);
        }
    };

    // Funciones helper para renderizar estados y botones
    const getStatusText = (status) => {
        const statusTexts = {
            'pending_deposit': 'Pendiente de Depósito',
            'partial_deposit': 'Depósito Parcial',
            'escrowed': 'Fondos en Custodia',
            'ready_to_release': 'Listo para Liberar',
            'released': 'Pago Liberado'
        };
        return statusTexts[status] || status;
    };

    const renderActionButton = (payment) => {
        switch (payment.action_required) {
            case 'deposit':
            case 'deposit_remaining':
                return (
                    <button 
                        className="btn-primary"
                        onClick={() => openDepositModal(payment)}
                    >
                        <i className="ri-wallet-3-line"></i>
                        Depositar Fondos
                    </button>
                );
            case 'release':
                return (
                    <button 
                        className="btn-success"
                        onClick={() => handleReleasePayment(payment)}
                    >
                        <i className="ri-check-line"></i>
                        Liberar Pago
                    </button>
                );
            case 'wait':
                return (
                    <button className="btn-disabled" disabled>
                        <i className="ri-time-line"></i>
                        Esperando Completar Proyecto
                    </button>
                );
            default:
                return null;
        }
    };

    return (
        <div className="payment-management">
            <div className="payment-header">
                <h2>Gestión de Pagos</h2>
                <button 
                    className="btn-primary"
                    onClick={loadPendingPayments}
                    disabled={loading}
                >
                    {loading ? 'Cargando...' : 'Actualizar'}
                </button>
            </div>

            {error && (
                <div className="alert alert-error">
                    <i className="ri-error-warning-line"></i>
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <i className="ri-checkbox-circle-line"></i>
                    {success}
                </div>
            )}

            <div className="pending-payments-section">
                <h3>Gestión de Pagos de Proyectos</h3>
                <p className="section-description">
                    Proyectos activos y completados que requieren acción de pago
                </p>

                {loading && pendingPayments.length === 0 ? (
                    <div className="loading-spinner">Cargando...</div>
                ) : pendingPayments.length === 0 ? (
                    <div className="empty-state">
                        <i className="ri-money-dollar-circle-line"></i>
                        <p>No hay pagos pendientes</p>
                        <small>Los proyectos contratados aparecerán aquí</small>
                    </div>
                ) : (
                    <div className="payments-grid">
                        {pendingPayments.map((payment) => (
                            <div key={payment.project_id} className="payment-card">
                                <div className="payment-card-header">
                                    <h4>{payment.project_title}</h4>
                                    <span className={`status-badge ${payment.payment_status}`}>
                                        {getStatusText(payment.payment_status)}
                                    </span>
                                </div>

                                <div className="payment-card-body">
                                    <div className="payment-info">
                                        <div className="info-row">
                                            <span className="label">Freelancer:</span>
                                            <span className="value">{payment.freelancer.username}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Estado del Proyecto:</span>
                                            <span className="value badge-project">{payment.project_status}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="label">Monto Total:</span>
                                            <span className="value amount-total">
                                                {paymentService.formatCurrency(payment.amount)}
                                            </span>
                                        </div>
                                        {payment.deposited_amount > 0 && (
                                            <div className="info-row">
                                                <span className="label">Ya Depositado:</span>
                                                <span className="value amount-deposited">
                                                    {paymentService.formatCurrency(payment.deposited_amount)}
                                                </span>
                                            </div>
                                        )}
                                        {payment.remaining_amount > 0 && (
                                            <div className="info-row">
                                                <span className="label">Restante:</span>
                                                <span className="value amount-remaining">
                                                    {paymentService.formatCurrency(payment.remaining_amount)}
                                                </span>
                                            </div>
                                        )}
                                        {payment.days_since_completion !== null && (
                                            <div className="info-row">
                                                <span className="label">Completado hace:</span>
                                                <span className="value">
                                                    {payment.days_since_completion} días
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="payment-card-actions">
                                    <button 
                                        className="btn-secondary"
                                        onClick={() => viewPaymentDetails(payment.project_id)}
                                    >
                                        Ver Detalles
                                    </button>
                                    {renderActionButton(payment)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Depósito */}
            {showDepositModal && (
                <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Depositar Fondos en Escrow</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowDepositModal(false)}
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <form onSubmit={handleDeposit} className="modal-body">
                            <div className="form-group">
                                <label>Proyecto</label>
                                <input 
                                    type="text" 
                                    value={selectedProject?.project_title || ''} 
                                    disabled 
                                />
                            </div>

                            {selectedProject && (
                                <div className="payment-summary">
                                    <div className="summary-row">
                                        <span>Monto Total del Proyecto:</span>
                                        <strong>{paymentService.formatCurrency(selectedProject.amount)}</strong>
                                    </div>
                                    {selectedProject.deposited_amount > 0 && (
                                        <>
                                            <div className="summary-row">
                                                <span>Ya Depositado:</span>
                                                <strong className="text-success">
                                                    {paymentService.formatCurrency(selectedProject.deposited_amount)}
                                                </strong>
                                            </div>
                                            <div className="summary-row">
                                                <span>Monto Restante:</span>
                                                <strong className="text-warning">
                                                    {paymentService.formatCurrency(selectedProject.remaining_amount)}
                                                </strong>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                            <div className="form-group">
                                <label>Monto a Depositar *</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    required
                                    min="0"
                                />
                            </div>

                            <div className="form-group">
                                <label>Método de Pago *</label>
                                <select 
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    required
                                >
                                    <option value="bank_transfer">Transferencia Bancaria</option>
                                    <option value="credit_card">Tarjeta de Crédito</option>
                                    <option value="debit_card">Tarjeta de Débito</option>
                                    <option value="paypal">PayPal</option>
                                    <option value="wire_transfer">Transferencia Internacional</option>
                                </select>
                            </div>

                            <div className="info-box">
                                <i className="ri-information-line"></i>
                                <p>Los fondos se mantendrán en custodia (escrow) hasta que el proyecto sea completado y liberado.</p>
                            </div>

                            <div className="modal-actions">
                                <button 
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowDepositModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Procesando...' : 'Depositar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Detalles */}
            {showDetailsModal && projectDetails && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Detalles del Pago</h3>
                            <button 
                                className="modal-close"
                                onClick={() => setShowDetailsModal(false)}
                            >
                                <i className="ri-close-line"></i>
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="payment-details">
                                <div className="detail-row">
                                    <span className="label">Estado del Proyecto:</span>
                                    <span className="value badge">{projectDetails.project_status}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Monto Esperado:</span>
                                    <span className="value">
                                        {paymentService.formatCurrency(projectDetails.expected_payment)}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Fondos en Escrow:</span>
                                    <span className="value">
                                        {paymentService.formatCurrency(projectDetails.escrow_amount)}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Monto Liberado:</span>
                                    <span className="value">
                                        {paymentService.formatCurrency(projectDetails.released_amount)}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="label">Estado del Pago:</span>
                                    <span className={`value badge ${paymentService.getPaymentStatusClass(projectDetails.payment_status)}`}>
                                        {paymentService.getPaymentStatusText(projectDetails.payment_status)}
                                    </span>
                                </div>
                            </div>

                            {projectDetails.transactions && projectDetails.transactions.length > 0 && (
                                <div className="transactions-list">
                                    <h4>Transacciones</h4>
                                    {projectDetails.transactions.map((tx) => (
                                        <div key={tx.id} className="transaction-item">
                                            <div className="tx-title">{tx.title}</div>
                                            <div className="tx-details">
                                                <span className="tx-amount">{paymentService.formatCurrency(parseFloat(tx.amount))}</span>
                                                <span className={`tx-status badge ${tx.status}`}>{tx.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button 
                                className="btn-primary"
                                onClick={() => setShowDetailsModal(false)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Pasarela de Pago */}
            <PaymentGateway
                isOpen={showPaymentGateway}
                onClose={() => {
                    setShowPaymentGateway(false);
                    setSelectedProject(null);
                }}
                projectData={{
                    project_title: selectedProject?.project_title,
                    freelancer: selectedProject?.freelancer,
                    amount: parseFloat(depositAmount) || 0
                }}
                onSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default PaymentManagement;
