import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import chatService from '../services/chatService';
import { authenticatedFetch } from '../services/authService';
import '../styles/ChatWidget.css';

const ChatWidget = () => {
    const { user, token } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [conversaciones, setConversaciones] = useState([]);
    const [conversacionActiva, setConversacionActiva] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [cargandoConversaciones, setCargandoConversaciones] = useState(true);
    const [cargandoMensajes, setCargandoMensajes] = useState(false);
    const mensajesEndRef = useRef(null);
    const chatFetchedRef = useRef(false);

    // Claves para localStorage
    const STORAGE_CONVERSACIONES = `chat_conversaciones_${user?.id || 'guest'}`;
    const STORAGE_MENSAJES = `chat_mensajes_${user?.id || 'guest'}`;

    // Helper: Guardar conversaciones en localStorage
    const guardarConversaciones = (convs) => {
        try {
            localStorage.setItem(STORAGE_CONVERSACIONES, JSON.stringify(convs));
        } catch (error) {
            console.error('Error guardando conversaciones:', error);
        }
    };

    // Helper: Cargar conversaciones desde localStorage
    const cargarConversacionesLocal = () => {
        try {
            const stored = localStorage.getItem(STORAGE_CONVERSACIONES);
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Error cargando conversaciones:', error);
            return null;
        }
    };

    // Helper: Guardar mensajes en localStorage (por conversación)
    const guardarMensajes = (conversacionId, msgs) => {
        try {
            const stored = localStorage.getItem(STORAGE_MENSAJES);
            const allMensajes = stored ? JSON.parse(stored) : {};
            allMensajes[conversacionId] = msgs;
            localStorage.setItem(STORAGE_MENSAJES, JSON.stringify(allMensajes));
        } catch (error) {
            console.error('Error guardando mensajes:', error);
        }
    };

    // Helper: Cargar mensajes desde localStorage (por conversación)
    const cargarMensajesLocal = (conversacionId) => {
        try {
            const stored = localStorage.getItem(STORAGE_MENSAJES);
            if (stored) {
                const allMensajes = JSON.parse(stored);
                return allMensajes[conversacionId] || null;
            }
            return null;
        } catch (error) {
            console.error('Error cargando mensajes:', error);
            return null;
        }
    };

    const scrollToBottom = () => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    // Conectar WebSocket
    useEffect(() => {
        if (user && token && isOpen) {
            chatService.connect(user.id, token);

            const unsubscribeMessage = chatService.onMessage((data) => {
                console.log('📨 Mensaje recibido:', data);

                if (data.type === 'new_message') {
                    const mensaje = data.message;

                    // Agregar mensaje a la conversación activa si corresponde
                    if (conversacionActiva && mensaje.conversacion_id === conversacionActiva.id) {
                        setMensajes(prev => {
                            // Evitar duplicados
                            const existe = prev.some(m => m.id === mensaje.id || (m.temporal && m.contenido === mensaje.contenido));
                            let updated;
                            if (existe) {
                                // Reemplazar mensaje temporal con el real
                                updated = prev.map(m =>
                                    m.temporal && m.contenido === mensaje.contenido ? mensaje : m
                                );
                            } else {
                                updated = [...prev, mensaje];
                            }
                            guardarMensajes(conversacionActiva.id, updated);
                            return updated;
                        });
                    }

                    // Actualizar lista de conversaciones
                    setConversaciones(prev => {
                        const index = prev.findIndex(c => c.id === mensaje.conversacion_id);
                        if (index > -1) {
                            const updated = [...prev];
                            const esConversacionActiva = conversacionActiva?.id === mensaje.conversacion_id;
                            const esMiMensaje = mensaje.emisor_id === user.id;

                            updated[index] = {
                                ...updated[index],
                                ultimo_mensaje: mensaje.contenido,
                                ultimo_mensaje_fecha: mensaje.fecha,
                                // Solo incrementar no_leidos si no es la conversación activa y no es mi mensaje
                                no_leidos: (esConversacionActiva || esMiMensaje) ? 0 : (updated[index].no_leidos || 0) + 1
                            };

                            // Mover conversación al tope
                            const [item] = updated.splice(index, 1);
                            updated.unshift(item);
                            guardarConversaciones(updated); // Guardar en localStorage
                            return updated;
                        }
                        return prev;
                    });
                }
            });

            const unsubscribeStatus = chatService.onStatusChange((status) => {
                setConnectionStatus(status);
            });

            return () => {
                unsubscribeMessage();
                unsubscribeStatus();
            };
        }
    }, [user, token, conversacionActiva, isOpen]);

    // Cargar conversaciones
    useEffect(() => {
        if (!user || !isOpen || chatFetchedRef.current) return;
        chatFetchedRef.current = true;

        const cargarConversaciones = async () => {
            // Primero intentar cargar desde localStorage
            const conversacionesLocal = cargarConversacionesLocal();
            if (conversacionesLocal && conversacionesLocal.length > 0) {
                setConversaciones(conversacionesLocal);
                setCargandoConversaciones(false);
                console.log('💾 Conversaciones cargadas desde localStorage');
            }

            try {
                const response = await authenticatedFetch(
                    `http://localhost:3000/api/chat/conversaciones/${user.id}`,
                    { method: 'GET' }
                );

                if (response.ok) {
                    const data = await response.json();
                    const conversacionesBackend = data.conversaciones || [];
                    setConversaciones(conversacionesBackend);
                    guardarConversaciones(conversacionesBackend);
                } else {
                    // Si no hay en localStorage, usar datos de ejemplo
                    if (!conversacionesLocal) {
                        const conversacionesEjemplo = [
                            {
                                id: 1,
                                participante_id: 101,
                                participante_nombre: 'Juan Pérez',
                                participante_rol: 'freelancer',
                                participante_avatar: null,
                                ultimo_mensaje: '¿Cuándo podemos discutir los detalles del proyecto?',
                                ultimo_mensaje_fecha: new Date().toISOString(),
                                no_leidos: 2
                            },
                            {
                                id: 2,
                                participante_id: 102,
                                participante_nombre: 'María González',
                                participante_rol: 'project_manager',
                                participante_avatar: null,
                                ultimo_mensaje: 'Perfecto, te envío los documentos.',
                                ultimo_mensaje_fecha: new Date(Date.now() - 3600000).toISOString(),
                                no_leidos: 0
                            }
                        ];
                        setConversaciones(conversacionesEjemplo);
                        guardarConversaciones(conversacionesEjemplo);
                    }
                }
            } catch (error) {
                console.error('Error al cargar conversaciones:', error);
            } finally {
                setCargandoConversaciones(false);
            }
        };

        cargarConversaciones();
    }, [user, isOpen]);

    const cargarMensajes = async (conversacion) => {
        setConversacionActiva(conversacion);
        setNuevoMensaje(''); // Limpiar input al cambiar de conversación
        setCargandoMensajes(true);

        // Marcar conversación como leída inmediatamente
        setConversaciones(prev => {
            const updated = prev.map(c => c.id === conversacion.id ? { ...c, no_leidos: 0 } : c);
            guardarConversaciones(updated);
            return updated;
        });

        // Primero cargar mensajes desde localStorage
        const mensajesLocal = cargarMensajesLocal(conversacion.id);
        if (mensajesLocal && mensajesLocal.length > 0) {
            setMensajes(mensajesLocal);
            setCargandoMensajes(false);
            console.log('💾 Mensajes cargados desde localStorage');
        }

        try {
            const response = await authenticatedFetch(
                `http://localhost:3000/api/chat/mensajes/${conversacion.id}`,
                { method: 'GET' }
            );

            if (response.ok) {
                const data = await response.json();
                const mensajesBackend = data.mensajes || [];
                setMensajes(mensajesBackend);
                guardarMensajes(conversacion.id, mensajesBackend);
            } else {
                // Si no hay en localStorage, usar datos de ejemplo
                if (!mensajesLocal) {
                    const mensajesEjemplo = [
                        {
                            id: 1,
                            conversacion_id: conversacion.id,
                            emisor_id: conversacion.participante_id,
                            emisor_nombre: conversacion.participante_nombre,
                            contenido: 'Hola, ¿cómo estás?',
                            fecha: new Date(Date.now() - 7200000).toISOString(),
                            leido: true
                        },
                        {
                            id: 2,
                            conversacion_id: conversacion.id,
                            emisor_id: user.id,
                            emisor_nombre: user.nombre || user.first_name || 'Tú',
                            contenido: '¡Hola! Todo bien, ¿y tú?',
                            fecha: new Date(Date.now() - 3600000).toISOString(),
                            leido: true
                        }
                    ];
                    setMensajes(mensajesEjemplo);
                    guardarMensajes(conversacion.id, mensajesEjemplo);
                }
            }
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
        } finally {
            setCargandoMensajes(false);
        }
    };

    const enviarMensaje = async (e) => {
        e.preventDefault();

        if (!nuevoMensaje.trim() || !conversacionActiva) return;

        const contenidoMensaje = nuevoMensaje.trim();
        const ahora = new Date().toISOString();

        // Crear mensaje para enviar
        const mensaje = {
            type: 'send_message',
            conversacion_id: conversacionActiva.id,
            emisor_id: user.id,
            receptor_id: conversacionActiva.participante_id,
            contenido: contenidoMensaje,
            fecha: ahora
        };

        // Crear mensaje optimista para mostrar inmediatamente
        const mensajeOptimista = {
            id: `temp-${Date.now()}`,
            conversacion_id: conversacionActiva.id,
            emisor_id: user.id,
            emisor_nombre: user.nombre || user.first_name || user.full_name || 'Tú',
            contenido: contenidoMensaje,
            fecha: ahora,
            leido: false,
            temporal: true
        };

        // Agregar mensaje inmediatamente a la UI
        setMensajes(prev => {
            const updated = [...prev, mensajeOptimista];
            guardarMensajes(conversacionActiva.id, updated);
            return updated;
        });

        // Actualizar conversaciones
        setConversaciones(prev => {
            const index = prev.findIndex(c => c.id === conversacionActiva.id);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    ultimo_mensaje: contenidoMensaje,
                    ultimo_mensaje_fecha: ahora,
                    no_leidos: 0
                };
                // Mover al tope
                const [item] = updated.splice(index, 1);
                updated.unshift(item);
                guardarConversaciones(updated);
                return updated;
            }
            return prev;
        });

        // Limpiar input
        setNuevoMensaje('');

        // Intentar enviar por WebSocket
        if (chatService.isConnected()) {
            const enviado = chatService.sendMessage(mensaje);
            if (enviado) {
                console.log('📤 Mensaje enviado vía WebSocket');
                // El mensaje temporal se reemplazará cuando llegue la confirmación del servidor
            } else {
                console.warn('⚠️ No se pudo enviar el mensaje por WebSocket');
                // Convertir mensaje temporal a permanente
                setTimeout(() => {
                    setMensajes(prev => {
                        const updated = prev.map(m =>
                            m.id === mensajeOptimista.id ? { ...m, temporal: false, id: Date.now() } : m
                        );
                        guardarMensajes(conversacionActiva.id, updated);
                        return updated;
                    });
                }, 500);
            }
        } else {
            // Modo simulación: Sin backend, los mensajes se quedan localmente
            console.log('📱 Modo simulación: mensaje guardado localmente');

            // Convertir mensaje temporal a permanente después de un pequeño delay
            setTimeout(() => {
                setMensajes(prev => {
                    const updated = prev.map(m =>
                        m.id === mensajeOptimista.id ? { ...m, temporal: false, id: Date.now() } : m
                    );
                    guardarMensajes(conversacionActiva.id, updated);
                    return updated;
                });
            }, 500);

            // Simular respuesta automática del bot después de 2 segundos (solo para demo)
            if (contenidoMensaje.toLowerCase().includes('hola')) {
                setTimeout(() => {
                    const respuestaBot = {
                        id: Date.now(),
                        conversacion_id: conversacionActiva.id,
                        emisor_id: conversacionActiva.participante_id,
                        emisor_nombre: conversacionActiva.participante_nombre,
                        contenido: '¡Hola! ¿En qué puedo ayudarte?',
                        fecha: new Date().toISOString(),
                        leido: false
                    };
                    setMensajes(prev => {
                        const updated = [...prev, respuestaBot];
                        guardarMensajes(conversacionActiva.id, updated);
                        return updated;
                    });

                    // Actualizar conversaciones
                    setConversaciones(prev => {
                        const index = prev.findIndex(c => c.id === conversacionActiva.id);
                        if (index > -1) {
                            const updated = [...prev];
                            updated[index] = {
                                ...updated[index],
                                ultimo_mensaje: respuestaBot.contenido,
                                ultimo_mensaje_fecha: respuestaBot.fecha
                            };
                            return updated;
                        }
                        return prev;
                    });
                }, 2000);
            }
        }
    };

    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        const hoy = new Date();

        if (date.toDateString() === hoy.toDateString()) {
            return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
    };

    const getIniciales = (nombre) => {
        if (!nombre) return '?';
        const partes = nombre.split(' ');
        if (partes.length >= 2) {
            return (partes[0][0] + partes[1][0]).toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    };

    const totalNoLeidos = conversaciones.reduce((sum, c) => sum + (c.no_leidos || 0), 0);

    if (!isOpen) {
        return (
            <div className="chat-widget-trigger" onClick={() => setIsOpen(true)}>
                <i className="ri-message-3-fill"></i>
                {totalNoLeidos > 0 && (
                    <span className="chat-badge">{totalNoLeidos > 9 ? '9+' : totalNoLeidos}</span>
                )}
            </div>
        );
    }

    return (
        <div className={`chat-widget ${isExpanded ? 'expanded' : ''}`}>
            <div className="chat-widget-header">
                <div className="chat-widget-title">
                    <i className="ri-message-3-line"></i>
                    <span>{conversacionActiva ? conversacionActiva.participante_nombre : 'Mensajes'}</span>
                    {connectionStatus === 'connected' && <span className="status-dot online"></span>}
                </div>
                <div className="chat-widget-actions">
                    {conversacionActiva && (
                        <button
                            className="chat-action-btn"
                            onClick={() => {
                                setConversacionActiva(null);
                                setNuevoMensaje('');
                            }}
                            title="Volver a conversaciones"
                        >
                            <i className="ri-arrow-left-line"></i>
                        </button>
                    )}
                    <button
                        className="chat-action-btn"
                        onClick={() => setIsExpanded(!isExpanded)}
                        title={isExpanded ? 'Minimizar' : 'Expandir'}
                    >
                        <i className={isExpanded ? 'ri-contract-left-right-line' : 'ri-expand-left-right-line'}></i>
                    </button>
                    <button
                        className="chat-action-btn"
                        onClick={() => {
                            setIsOpen(false);
                            setConversacionActiva(null);
                            setIsExpanded(false);
                        }}
                        title="Cerrar"
                    >
                        <i className="ri-close-line"></i>
                    </button>
                </div>
            </div>

            <div className="chat-widget-body">
                {!conversacionActiva ? (
                    <div className="chat-conversations-list">
                        {cargandoConversaciones ? (
                            <div className="chat-loading">Cargando...</div>
                        ) : conversaciones.length === 0 ? (
                            <div className="chat-empty">
                                <i className="ri-message-2-line"></i>
                                <p>No hay conversaciones</p>
                            </div>
                        ) : (
                            conversaciones.map(conv => (
                                <div
                                    key={conv.id}
                                    className="chat-conversation-item"
                                    onClick={() => cargarMensajes(conv)}
                                >
                                    <div className="chat-avatar">
                                        {conv.participante_avatar ? (
                                            <img src={conv.participante_avatar} alt={conv.participante_nombre} />
                                        ) : (
                                            <div className="chat-avatar-placeholder">
                                                {getIniciales(conv.participante_nombre)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="chat-conversation-info">
                                        <div className="chat-conversation-name">{conv.participante_nombre}</div>
                                        <div className="chat-conversation-preview">{conv.ultimo_mensaje}</div>
                                    </div>
                                    {conv.no_leidos > 0 && (
                                        <span className="chat-unread-badge">{conv.no_leidos}</span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <>
                        <div className="chat-messages-area">
                            {cargandoMensajes ? (
                                <div className="chat-loading">Cargando mensajes...</div>
                            ) : (
                                <>
                                    {mensajes.map(mensaje => (
                                        <div
                                            key={mensaje.id}
                                            className={`chat-message ${mensaje.emisor_id === user.id ? 'sent' : 'received'}`}
                                        >
                                            <div className={`chat-message-bubble ${mensaje.temporal ? 'temporal' : ''}`}>
                                                {mensaje.contenido}
                                                <span className="chat-message-time">{formatearFecha(mensaje.fecha)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={mensajesEndRef} />
                                </>
                            )}
                        </div>
                        <form className="chat-input-area" onSubmit={enviarMensaje}>
                            <input
                                type="text"
                                value={nuevoMensaje}
                                onChange={(e) => setNuevoMensaje(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="chat-input-field"
                            />
                            <button
                                type="submit"
                                className="chat-send-btn"
                                disabled={!nuevoMensaje.trim()}
                            >
                                <i className="ri-send-plane-fill"></i>
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatWidget;
