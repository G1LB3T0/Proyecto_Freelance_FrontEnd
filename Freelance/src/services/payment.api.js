const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Servicio para gestión de pagos
 */
class PaymentService {
    constructor() {
        this.baseURL = `${API_BASE}/api/payments`;
    }

    /**
     * Obtener headers con autenticación
     */
    getHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Obtener estado del pago de un proyecto
     * @param {number} projectId - ID del proyecto
     */
    async getProjectPaymentStatus(projectId) {
        try {
            const response = await fetch(`${this.baseURL}/project/${projectId}`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener estado de pago');
            }

            return data;
        } catch (error) {
            console.error('Error en getProjectPaymentStatus:', error);
            throw error;
        }
    }

    /**
     * Depositar fondos en escrow (Cliente)
     * @param {number} projectId - ID del proyecto
     * @param {number} amount - Monto a depositar
     * @param {string} paymentMethod - Método de pago
     */
    async depositToEscrow(projectId, amount, paymentMethod = 'bank_transfer') {
        try {
            const response = await fetch(`${this.baseURL}/escrow/deposit`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    project_id: projectId,
                    amount: parseFloat(amount),
                    payment_method: paymentMethod
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al depositar fondos');
            }

            return data;
        } catch (error) {
            console.error('Error en depositToEscrow:', error);
            throw error;
        }
    }

    /**
     * Liberar pago al freelancer (Cliente)
     * @param {number} projectId - ID del proyecto
     */
    async releasePayment(projectId) {
        try {
            const response = await fetch(`${this.baseURL}/release`, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify({
                    project_id: projectId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al liberar pago');
            }

            return data;
        } catch (error) {
            console.error('Error en releasePayment:', error);
            throw error;
        }
    }

    /**
     * Obtener historial de pagos recibidos (Freelancer)
     * @param {Object} params - Parámetros de filtrado
     */
    async getFreelancerPaymentHistory(params = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.status) queryParams.append('status', params.status);
            if (params.limit) queryParams.append('limit', params.limit);
            if (params.offset) queryParams.append('offset', params.offset);

            const url = `${this.baseURL}/freelancer/history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener historial de pagos');
            }

            return data;
        } catch (error) {
            console.error('Error en getFreelancerPaymentHistory:', error);
            throw error;
        }
    }

    /**
     * Obtener pagos pendientes de liberar (Cliente)
     */
    async getClientPendingPayments() {
        try {
            const response = await fetch(`${this.baseURL}/client/pending`, {
                method: 'GET',
                headers: this.getHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al obtener pagos pendientes');
            }

            return data;
        } catch (error) {
            console.error('Error en getClientPendingPayments:', error);
            throw error;
        }
    }

    /**
     * Formatear monto con moneda
     * @param {number} amount - Monto a formatear
     * @param {string} currency - Código de moneda
     */
    formatCurrency(amount, currency = 'GTQ') {
        return new Intl.NumberFormat('es-GT', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Obtener texto del estado de pago
     * @param {string} status - Estado del pago
     */
    getPaymentStatusText(status) {
        const statusMap = {
            'pending_deposit': 'Pendiente de Depósito',
            'partial_escrow': 'Depósito Parcial',
            'escrowed': 'Fondos en Custodia',
            'payment_released': 'Pago Liberado'
        };

        return statusMap[status] || status;
    }

    /**
     * Obtener clase CSS para el estado de pago
     * @param {string} status - Estado del pago
     */
    getPaymentStatusClass(status) {
        const statusClassMap = {
            'pending_deposit': 'status-pending',
            'partial_escrow': 'status-warning',
            'escrowed': 'status-success',
            'payment_released': 'status-completed'
        };

        return statusClassMap[status] || 'status-default';
    }
}

// Exportar instancia única del servicio
const paymentService = new PaymentService();
export default paymentService;
