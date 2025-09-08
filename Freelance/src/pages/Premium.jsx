import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../Components/Layout.jsx';
import '../styles/Premium.css';

const Premium = () => {
    const features = [
        {
            icon: '🎯',
            title: 'Proyectos Exclusivos',
            description: 'Accede a proyectos de alta calidad con clientes verificados y presupuestos premium.'
        },
        {
            icon: '🔍',
            title: 'Herramientas Avanzadas',
            description: 'Utiliza herramientas de análisis, seguimiento de tiempo y gestión de proyectos profesionales.'
        },
        {
            icon: '💰',
            title: 'Comisiones Reducidas',
            description: 'Paga menos comisiones por cada proyecto completado y mantén más de tus ganancias.'
        },
        {
            icon: '⚡',
            title: 'Soporte Prioritario',
            description: 'Recibe soporte técnico prioritario y respuestas rápidas a todas tus consultas.'
        },
        {
            icon: '📊',
            title: 'Analytics Detallados',
            description: 'Obtén insights detallados sobre tu rendimiento, ingresos y oportunidades de mejora.'
        },
        {
            icon: '🎓',
            title: 'Cursos Exclusivos',
            description: 'Accede a cursos y workshops exclusivos para mejorar tus habilidades profesionales.'
        }
    ];

    const plans = [
        {
            name: 'Premium',
            price: '$19.99',
            period: '/mes',
            features: [
                'Proyectos exclusivos',
                'Herramientas avanzadas',
                'Comisiones reducidas (5%)',
                'Soporte prioritario',
                'Analytics básicos'
            ],
            popular: false
        },
        {
            name: 'Premium Pro',
            price: '$39.99',
            period: '/mes',
            features: [
                'Todo de Premium',
                'Proyectos VIP',
                'Sin comisiones',
                'Soporte 24/7',
                'Analytics avanzados',
                'Cursos exclusivos',
                'Consultor personal'
            ],
            popular: true
        },
        {
            name: 'Enterprise',
            price: '$79.99',
            period: '/mes',
            features: [
                'Todo de Premium Pro',
                'Equipos ilimitados',
                'API personalizada',
                'Integración empresarial',
                'Onboarding dedicado',
                'SLA garantizado'
            ],
            popular: false
        }
    ];

    return (
        <Layout currentPage="premium">
            <div className="premium-page">
                <div className="hero-section">
                    <h1>Potencia tu Carrera Freelance</h1>
                    <p>Únete a miles de freelancers que han transformado su carrera con nuestras herramientas premium</p>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">10,000+</span>
                            <span className="stat-label">Freelancers Premium</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">$2.5M+</span>
                            <span className="stat-label">Pagado a Freelancers</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">98%</span>
                            <span className="stat-label">Satisfacción del Cliente</span>
                        </div>
                    </div>
                </div>

                <div className="features-section">
                    <h2>¿Por qué elegir Premium?</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pricing-section">
                    <h2>Planes que se adaptan a ti</h2>
                    <div className="pricing-grid">
                        {plans.map((plan, index) => (
                            <div key={index} className={`pricing-card ${plan.popular ? 'popular' : ''}`}>
                                {plan.popular && <div className="popular-badge">Más Popular</div>}
                                <h3>{plan.name}</h3>
                                <div className="price">
                                    <span className="price-amount">{plan.price}</span>
                                    <span className="price-period">{plan.period}</span>
                                </div>
                                <ul className="features-list">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex}>
                                            <span className="checkmark">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                                <button className={`plan-button ${plan.popular ? 'primary' : 'secondary'}`}>
                                    Comenzar Ahora
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="testimonials-section">
                    <h2>Lo que dicen nuestros usuarios</h2>
                    <div className="testimonials-grid">
                        <div className="testimonial">
                            <p>"Desde que me uní a Premium, mis ingresos han aumentado un 150%. Los proyectos son de mejor calidad y los clientes más profesionales."</p>
                            <div className="testimonial-author">
                                <strong>María González</strong>
                                <span>Diseñadora UX/UI</span>
                            </div>
                        </div>
                        <div className="testimonial">
                            <p>"Las herramientas de analytics me han ayudado a entender mejor mi negocio y optimizar mi tiempo. Altamente recomendado."</p>
                            <div className="testimonial-author">
                                <strong>Carlos Mendoza</strong>
                                <span>Desarrollador Full Stack</span>
                            </div>
                        </div>
                        <div className="testimonial">
                            <p>"El soporte prioritario es increíble. Siempre recibo respuestas rápidas y soluciones efectivas a mis problemas."</p>
                            <div className="testimonial-author">
                                <strong>Ana Rodríguez</strong>
                                <span>Consultora Marketing Digital</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="cta-section">
                    <h2>¿Listo para transformar tu carrera?</h2>
                    <p>Únete a la comunidad premium de freelancers más exitosa</p>
                    <div className="cta-buttons">
                        <button className="cta-primary">Comenzar Prueba Gratuita</button>
                        <button className="cta-secondary">Ver Demo</button>
                    </div>
                    <div className="back-link">
                        <Link to="/home">← Volver al Home</Link>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Premium;
