// Chat.jsx
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import chatService from '../services/chatService';
import { authenticatedFetch } from '../services/authService';
import '../styles/Chat.css';

const Chat = () => {
    const { user, token } = useAuth();
    const [conversaciones, setConversaciones] = useState([]);
    const [conversacionActiva, setConversacionActiva] = useState(null);
    const [mensajes, setMensajes] = useState([]);
    const [nuevoMensaje, setNuevoMensaje] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [cargandoConversaciones, setCargandoConversaciones] = useState(true);
    const [cargandoMensajes, setCargandoMensajes] = useState(false);
    const [mostrarChat, setMostrarChat] = useState(false); // Para mobile
    const mensajesEndRef = useRef(null);
    const chatFetchedRef = useRef(false);

    // Scroll automático al último mensaje
    const scrollToBottom = () => {
        mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [mensajes]);

    // Conectar WebSocket
    useEffect(() => {
        if (user && token) {
            chatService.connect(user.id, token);

            // Listener para mensajes entrantes
            const unsubscribeMessage = chatService.onMessage((data) => {
                if (data.type === 'new_message') {
                    // Si el mensaje es de la conversación activa, agregarlo
                    if (conversacionActiva && data.message.conversacion_id === conversacionActiva.id) {
                        setMensajes(prev => [...prev, data.message]);
                    }

                    // Actualizar lista de conversaciones para mover la nueva al tope
                    setConversaciones(prev => {
                        const index = prev.findIndex(c => c.id === data.message.conversacion_id);
                        if (index > -1) {
                            const updated = [...prev];
                            updated[index] = {
                                ...updated[index],
                                ultimo_mensaje: data.message.contenido,
                                ultimo_mensaje_fecha: data.message.fecha,
                                no_leidos: conversacionActiva?.id === data.message.conversacion_id ? 0 : (updated[index].no_leidos || 0) + 1
                            };
                            // Mover al principio
                            const [item] = updated.splice(index, 1);
                            updated.unshift(item);
                            return updated;
                        }
                        return prev;
                    });
                } else if (data.type === 'typing') {
                    // Manejar indicador de "escribiendo..."
                    console.log(`${data.userName} está escribiendo...`);
                }
            });

            // Listener para cambios de estado de conexión
            const unsubscribeStatus = chatService.onStatusChange((status) => {
                setConnectionStatus(status);
            });

            return () => {
                unsubscribeMessage();
                unsubscribeStatus();
                chatService.disconnect();
            };
        }
    }, [user, token, conversacionActiva]);

    // Cargar lista de conversaciones
    useEffect(() => {
        if (!user || chatFetchedRef.current) return;
        chatFetchedRef.current = true;

        const cargarConversaciones = async () => {
            try {
                const response = await authenticatedFetch(
                    `http://localhost:3000/api/chat/conversaciones/${user.id}`,
                    { method: 'GET' }
                );

                if (response.ok) {
                    const data = await response.json();
                    setConversaciones(data.conversaciones || []);
                } else if (response.status === 500 || response.status === 404) {
                    // Backend no implementado - usar datos de ejemplo
                    console.warn('⚠️ Backend de chat no disponible - usando datos de ejemplo');
                    setConversaciones([
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
                    ]);
                }
            } catch (error) {
                console.error('Error al cargar conversaciones:', error);
                setConversaciones([]);
            } finally {
                setCargandoConversaciones(false);
            }
        };

        cargarConversaciones();
    }, [user]);

    // Cargar mensajes de una conversación
    const cargarMensajes = async (conversacion) => {
        setConversacionActiva(conversacion);
        setNuevoMensaje(''); // 🔥 LIMPIAR INPUT AL CAMBIAR DE CONVERSACIÓN
        setMostrarChat(true); // Para mobile
        setCargandoMensajes(true);

        try {
            const response = await authenticatedFetch(
                `http://localhost:3000/api/chat/mensajes/${conversacion.id}`,
                { method: 'GET' }
            );

            if (response.ok) {
                const data = await response.json();
                setMensajes(data.mensajes || []);

                // Marcar mensajes como leído
                marcarComoLeido(conversacion.id);
            } else if (response.status === 500 || response.status === 404) {
                // Backend no implementado - usar datos de ejemplo
                console.warn('⚠️ Backend de mensajes no disponible - usando datos de ejemplo');
                setMensajes([
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
                        emisor_nombre: user.nombre,
                        contenido: '¡Hola! Todo bien, ¿y tú?',
                        fecha: new Date(Date.now() - 3600000).toISOString(),
                        leido: true
                    },
                    {
                        id: 3,
                        conversacion_id: conversacion.id,
                        emisor_id: conversacion.participante_id,
                        emisor_nombre: conversacion.participante_nombre,
                        contenido: conversacion.ultimo_mensaje,
                        fecha: conversacion.ultimo_mensaje_fecha,
                        leido: false
                    }
                ]);
            }
        } catch (error) {
            console.error('Error al cargar mensajes:', error);
            setMensajes([]);
        } finally {
            setCargandoMensajes(false);
        }
    };

    // Marcar conversación como leída
    const marcarComoLeido = async (conversacionId) => {
        try {
            await authenticatedFetch(
                `http://localhost:3000/api/chat/marcar-leido/${conversacionId}`,
                { method: 'PUT' }
            );

            // Actualizar UI
            setConversaciones(prev =>
                prev.map(c => c.id === conversacionId ? { ...c, no_leidos: 0 } : c)
            );
        } catch (error) {
            console.error('Error al marcar como leído:', error);
        }
    };

    // Enviar mensaje
    const enviarMensaje = async (e) => {
        e.preventDefault();

        if (!nuevoMensaje.trim() || !conversacionActiva) return;

        const mensaje = {
            type: 'send_message',
            conversacion_id: conversacionActiva.id,
            emisor_id: user.id,
            receptor_id: conversacionActiva.participante_id,
            contenido: nuevoMensaje.trim(),
            fecha: new Date().toISOString()
        };

        // Enviar por WebSocket si está conectado
        if (chatService.isConnected()) {
            const enviado = chatService.sendMessage(mensaje);

            if (enviado) {
                // Agregar mensaje optimistamente a la UI
                const mensajeOptimista = {
                    id: Date.now(),
                    conversacion_id: conversacionActiva.id,
                    emisor_id: user.id,
                    emisor_nombre: user.nombre,
                    contenido: nuevoMensaje.trim(),
                    fecha: new Date().toISOString(),
                    leido: false,
                    temporal: true // Marcar como temporal hasta confirmación del servidor
                };

                setMensajes(prev => [...prev, mensajeOptimista]);
                setNuevoMensaje(''); // 🔥 LIMPIAR INMEDIATAMENTE
            }
        } else {
            // Fallback: enviar por HTTP si WebSocket no está disponible
            try {
                const response = await authenticatedFetch(
                    'http://localhost:3000/api/chat/enviar',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(mensaje)
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    setMensajes(prev => [...prev, data.mensaje]);
                    setNuevoMensaje(''); // 🔥 LIMPIAR DESPUÉS DE ENVIAR
                }
            } catch (error) {
                console.error('Error al enviar mensaje:', error);
                alert('No se pudo enviar el mensaje. Verifica tu conexión.');
            }
        }
    };

    // Volver a lista de conversaciones (mobile)
    const volverALista = () => {
        setMostrarChat(false);
        setConversacionActiva(null);
        setNuevoMensaje(''); // 🔥 LIMPIAR AL VOLVER
    };

    // Formatear fecha/hora
    const formatearFecha = (fecha) => {
        const date = new Date(fecha);
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);

        if (date.toDateString() === hoy.toDateString()) {
            return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
        } else if (date.toDateString() === ayer.toDateString()) {
            return 'Ayer';
        } else {
            return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        }
    };

    // Obtener iniciales para avatar
    const getIniciales = (nombre) => {
        if (!nombre) return '?';
        const partes = nombre.split(' ');
        if (partes.length >= 2) {
            return (partes[0][0] + partes[1][0]).toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    };

    return (
        <div className="chat-container">
            {/* Sidebar: Lista de conversaciones */}
            <div className={`chat-sidebar ${mostrarChat ? 'oculto-mobile' : ''}`}>
                <div className="chat-header">
                    <h2>Mensajes</h2>
                    <div className={`connection-status ${connectionStatus}`}>
                        {connectionStatus === 'connected' && '🟢'}
                        {connectionStatus === 'disconnected' && '🔴'}
                        {connectionStatus === 'error' && '⚠️'}
                    </div>
                </div>

                <div className="conversaciones-lista">
                    {cargandoConversaciones ? (
                        <div className="loading">Cargando conversaciones...</div>
                    ) : conversaciones.length === 0 ? (
                        <div className="empty-state">No hay conversaciones</div>
                    ) : (
                        conversaciones.map(conv => (
                            <div
                                key={conv.id}
                                className={`conversacion-item ${conversacionActiva?.id === conv.id ? 'active' : ''}`}
                                onClick={() => cargarMensajes(conv)}
                            >
                                <div className="avatar">
                                    {conv.participante_avatar ? (
                                        <img src={conv.participante_avatar} alt={conv.participante_nombre} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {getIniciales(conv.participante_nombre)}
                                        </div>
                                    )}
                                </div>
                                <div className="conversacion-info">
                                    <div className="conversacion-top">
                                        <h4>{conv.participante_nombre}</h4>
                                        <span className="fecha">{formatearFecha(conv.ultimo_mensaje_fecha)}</span>
                                    </div>
                                    <div className="conversacion-bottom">
                                        <p className="ultimo-mensaje">{conv.ultimo_mensaje}</p>
                                        {conv.no_leidos > 0 && (
                                            <span className="badge-no-leidos">{conv.no_leidos}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main: Chat activo */}
            <div className={`chat-main ${mostrarChat ? 'visible-mobile' : ''}`}>
                {!conversacionActiva ? (
                    <div className="chat-empty">
                        <div className="empty-icon">💬</div>
                        <h3>Selecciona una conversación</h3>
                        <p>Elige un contacto de la lista para comenzar a chatear</p>
                    </div>
                ) : (
                    <>
                        <div className="chat-header-main">
                            <button className="btn-volver" onClick={volverALista}>
                                ← Volver
                            </button>
                            <div className="chat-participant">
                                <div className="avatar">
                                    {conversacionActiva.participante_avatar ? (
                                        <img src={conversacionActiva.participante_avatar} alt={conversacionActiva.participante_nombre} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {getIniciales(conversacionActiva.participante_nombre)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3>{conversacionActiva.participante_nombre}</h3>
                                    <span className="rol-badge">{conversacionActiva.participante_rol}</span>
                                </div>
                            </div>
                        </div>

                        <div className="chat-mensajes">
                            {cargandoMensajes ? (
                                <div className="loading">Cargando mensajes...</div>
                            ) : (
                                <>
                                    {mensajes.map(mensaje => (
                                        <div
                                            key={mensaje.id}
                                            className={`mensaje ${mensaje.emisor_id === user.id ? 'enviado' : 'recibido'} ${mensaje.temporal ? 'temporal' : ''}`}
                                        >
                                            <div className="mensaje-contenido">
                                                <p>{mensaje.contenido}</p>
                                                <span className="mensaje-fecha">{formatearFecha(mensaje.fecha)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={mensajesEndRef} />
                                </>
                            )}
                        </div>

                        <form className="chat-input-container" onSubmit={enviarMensaje}>
                            <input
                                type="text"
                                value={nuevoMensaje}
                                onChange={(e) => setNuevoMensaje(e.target.value)}
                                placeholder="Escribe un mensaje..."
                                className="chat-input"
                            />
                            <button
                                type="submit"
                                className="send-button"
                                disabled={!nuevoMensaje.trim() || connectionStatus !== 'connected'}
                            >
                                ➤
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default Chat;