import React from 'react';

interface AgentCharacterAvatarProps {
  agentId: string;
  size?: number;
  className?: string;
  showAura?: boolean;
  status?: string;
}

/**
 * Ilustraciones vectoriales personalizadas y estilizadas para los 20 agentes
 * de Ecuadorian Architecture. Estética arquitectónica, minimalista, contemporánea.
 */
export const AgentCharacterAvatar: React.FC<AgentCharacterAvatarProps> = ({
  agentId,
  size = 64,
  className = '',
  showAura = true,
  status = 'disponible'
}) => {
  // Configuración de colores de aura según estado
  const getStatusColor = () => {
    switch (status) {
      case 'trabajando':
        return '#f59e0b'; // amber
      case 'revisando':
        return '#06b6d4'; // cyan
      case 'esperando_aprobacion':
        return '#a855f7'; // purple
      case 'completado':
        return '#10b981'; // emerald
      case 'bloqueado':
        return '#f43f5e'; // rose
      case 'error':
        return '#ef4444'; // red
      case 'pausado':
        return '#6b7280'; // gray
      default:
        return '#10b981'; // disponible
    }
  };

  const statusColor = getStatusColor();

  // Renderizado temático específico de cada personaje según su rol
  const renderAgentCharacter = () => {
    switch (agentId) {
      // 01. Chief Editor: Cuello de tortuga negro, gafas redondas intelectuales, lápiz de corrección rojo
      case 'ea-01-chief-editor':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#f5d0b5" />
            <path d="M30 32 Q50 14 70 32 Q66 18 50 18 Q34 18 30 32 Z" fill="#2d251e" />
            {/* Gafas redondas de diseñador */}
            <circle cx="43" cy="36" r="5" fill="none" stroke="#1c1917" strokeWidth="1.5" />
            <circle cx="57" cy="36" r="5" fill="none" stroke="#1c1917" strokeWidth="1.5" />
            <line x1="48" y1="36" x2="52" y2="36" stroke="#1c1917" strokeWidth="1.5" />
            {/* Cuello de tortuga negro arquitectónico */}
            <path d="M42 50 L58 50 L60 58 L40 58 Z" fill="#18181b" />
            <path d="M32 58 L68 58 L76 96 L24 96 Z" fill="#27272a" />
            {/* Lápiz rojo de edición en mano */}
            <line x1="68" y1="65" x2="80" y2="52" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            <polygon points="80,52 82,49 84,54" fill="#facc15" />
          </g>
        );

      // 02. Managing Editor: Blazer carbón estructurado, cronómetro/reloj de pulsera, carpeta
      case 'ea-02-managing-editor':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fcd9b8" />
            <path d="M32 30 Q50 16 68 28 Q56 16 38 18 Z" fill="#451a03" />
            {/* Ojos y cejas concentradas */}
            <line x1="40" y1="34" x2="46" y2="35" stroke="#292524" strokeWidth="1.5" />
            <line x1="54" y1="35" x2="60" y2="34" stroke="#292524" strokeWidth="1.5" />
            <circle cx="43" cy="39" r="1.5" fill="#292524" />
            <circle cx="57" cy="39" r="1.5" fill="#292524" />
            {/* Camisa y Blazer carbón */}
            <polygon points="50,52 44,60 56,60" fill="#ffffff" />
            <path d="M30 60 L70 60 L78 96 L22 96 Z" fill="#3f3f46" />
            <polygon points="44,60 50,78 56,60 70,60 62,96 38,96 30,60" fill="#27272a" />
            {/* Portapapeles con checklist */}
            <rect x="22" y="68" width="14" height="20" rx="1.5" fill="#d97706" />
            <rect x="24" y="71" width="10" height="14" fill="#fef3c7" />
            <line x1="26" y1="74" x2="32" y2="74" stroke="#451a03" strokeWidth="1" />
            <line x1="26" y1="78" x2="32" y2="78" stroke="#451a03" strokeWidth="1" />
          </g>
        );

      // 03. Architecture Editor: Camisa de lino, pluma estilográfica, cuaderno amarillo de notas
      case 'ea-03-architecture-editor':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fde047" opacity="0.3" />
            <circle cx="50" cy="36" r="18" fill="#f5d0b5" />
            <path d="M32 32 Q50 18 68 32 C68 20 48 18 32 32 Z" fill="#1e293b" />
            <circle cx="43" cy="37" r="1.5" fill="#0f172a" />
            <circle cx="57" cy="37" r="1.5" fill="#0f172a" />
            {/* Camisa de lino claro */}
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#e2e8f0" />
            <polygon points="50,56 46,68 54,68" fill="#cbd5e1" />
            {/* Cuaderno de notas amarillo */}
            <rect x="62" y="66" width="18" height="24" rx="2" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
            <line x1="66" y1="72" x2="76" y2="72" stroke="#854d0e" strokeWidth="1" />
            <line x1="66" y1="76" x2="76" y2="76" stroke="#854d0e" strokeWidth="1" />
            <line x1="66" y1="80" x2="74" y2="80" stroke="#854d0e" strokeWidth="1" />
          </g>
        );

      // 04. Architecture Critic: Estética monocromática radical, monografía en mano, mirada incisiva
      case 'ea-04-architecture-critic':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fad2b6" />
            {/* Cabello corto plateado/oscuro contemporáneo */}
            <path d="M30 32 Q50 12 70 30 Q65 16 48 18 Q35 18 30 32 Z" fill="#52525b" />
            {/* Gafas rectangulares negras */}
            <rect x="38" y="32" width="10" height="6" rx="1" fill="none" stroke="#09090b" strokeWidth="1.5" />
            <rect x="52" y="32" width="10" height="6" rx="1" fill="none" stroke="#09090b" strokeWidth="1.5" />
            <line x1="48" y1="35" x2="52" y2="35" stroke="#09090b" strokeWidth="1.5" />
            {/* Atuendo negro absoluto */}
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#09090b" />
            {/* Monografía gruesa de arquitectura */}
            <rect x="20" y="66" width="16" height="24" rx="1.5" fill="#f43f5e" />
            <rect x="21" y="68" width="14" height="20" fill="#18181b" />
            <text x="24" y="80" fill="#ffffff" fontSize="6" fontFamily="sans-serif" fontWeight="bold">EA</text>
          </g>
        );

      // 05. Research Editor: Chaleco de campo, mapas y carpeta de expedientes
      case 'ea-05-research-editor':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fcd9b8" />
            <path d="M30 34 Q50 16 70 34 Q60 18 42 20 Z" fill="#78350f" />
            <circle cx="43" cy="38" r="1.5" fill="#292524" />
            <circle cx="57" cy="38" r="1.5" fill="#292524" />
            {/* Camisa y chaleco caqui de expedición */}
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#f5f5f4" />
            <path d="M26 62 L42 62 L40 96 L24 96 Z" fill="#a8a29e" />
            <path d="M58 62 L74 62 L76 96 L60 96 Z" fill="#a8a29e" />
            {/* Bolsillos de chaleco con lápices */}
            <rect x="28" y="72" width="8" height="10" rx="1" fill="#78716c" />
            {/* Mapa enrollado o brújula */}
            <rect x="64" y="64" width="8" height="26" rx="2" fill="#fed7aa" stroke="#ea580c" strokeWidth="1" />
          </g>
        );

      // 06. Fact Checker: Suéter azul marino, medalla de verificación e insignia check
      case 'ea-06-fact-checker':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#f5d0b5" />
            <path d="M32 30 Q50 18 68 30 Q58 18 40 18 Z" fill="#0f172a" />
            {/* Gafas redondas finas */}
            <circle cx="43" cy="37" r="4.5" fill="none" stroke="#2563eb" strokeWidth="1.2" />
            <circle cx="57" cy="37" r="4.5" fill="none" stroke="#2563eb" strokeWidth="1.2" />
            <line x1="47.5" y1="37" x2="52.5" y2="37" stroke="#2563eb" strokeWidth="1.2" />
            {/* Suéter azul marino */}
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#1e3a8a" />
            {/* Medalla/Escudo con checkmark verificado */}
            <circle cx="50" cy="74" r="8" fill="#10b981" />
            <path d="M46 74 L49 77 L55 71" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      // 07. Instagram Editor: Look moderno urbano, smartphone con preview de feed y swatches
      case 'ea-07-instagram-editor':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fad2b6" />
            {/* Peinado estilizado con volumen lateral */}
            <path d="M28 36 Q38 12 68 24 Q72 16 50 16 Q30 20 28 36 Z" fill="#3b0764" />
            <circle cx="43" cy="38" r="1.5" fill="#1f2937" />
            <circle cx="57" cy="38" r="1.5" fill="#1f2937" />
            {/* Camiseta con gradiente sutil y blazer informal */}
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#18181b" />
            <polygon points="50,56 42,70 58,70" fill="#e11d48" />
            {/* Smartphone vertical en mano */}
            <rect x="62" y="60" width="16" height="28" rx="2" fill="#09090b" stroke="#e11d48" strokeWidth="1" />
            <rect x="64" y="63" width="12" height="20" fill="#f43f5e" opacity="0.8" />
            <circle cx="70" cy="85" r="1" fill="#ffffff" />
          </g>
        );

      // 08. Newsletter Editor: Taza de café humeante, estilo editorial artesanal, pliego impreso
      case 'ea-08-newsletter-editor':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fcd9b8" />
            <path d="M32 32 Q50 16 68 32 Q62 18 45 18 Z" fill="#1c1917" />
            <circle cx="43" cy="38" r="1.5" fill="#292524" />
            <circle cx="57" cy="38" r="1.5" fill="#292524" />
            {/* Cárdigan verde oliva / bosque */}
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#14532d" />
            {/* Taza de café humeante */}
            <rect x="20" y="74" width="12" height="14" rx="2" fill="#f5f5f4" />
            <path d="M32 78 Q36 81 32 84" fill="none" stroke="#f5f5f4" strokeWidth="1.5" />
            <path d="M23 70 Q24 67 23 64" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            <path d="M27 70 Q28 67 27 64" fill="none" stroke="#e2e8f0" strokeWidth="1" />
          </g>
        );

      // 09. WebOps Engineer: Sudadera con capucha negra, terminal de código verde fosforescente
      case 'ea-09-webops-engineer':
        return (
          <g>
            {/* Capucha negra envolvente */}
            <path d="M26 38 Q50 10 74 38 Q78 64 68 64 L32 64 Q22 64 26 38 Z" fill="#09090b" />
            <ellipse cx="50" cy="38" rx="14" ry="16" fill="#f5d0b5" />
            {/* Gafas oscuras o reflejo de pantalla terminal */}
            <rect x="40" y="34" width="8" height="5" rx="1" fill="#10b981" opacity="0.8" />
            <rect x="52" y="34" width="8" height="5" rx="1" fill="#10b981" opacity="0.8" />
            <path d="M28 62 L72 62 L78 96 L22 96 Z" fill="#18181b" />
            {/* Mini terminal con líneas verdes */}
            <rect x="36" y="74" width="28" height="18" rx="2" fill="#022c22" stroke="#10b981" strokeWidth="1" />
            <line x1="39" y1="78" x2="52" y2="78" stroke="#10b981" strokeWidth="1" />
            <line x1="39" y1="82" x2="60" y2="82" stroke="#10b981" strokeWidth="1" />
            <line x1="39" y1="86" x2="48" y2="86" stroke="#34d399" strokeWidth="1" />
          </g>
        );

      // 10. Community Manager: Actitud abierta, bocadillo de chat / diálogo en mano
      case 'ea-10-community-manager':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fad2b6" />
            <path d="M30 32 Q50 14 70 32 Q58 18 40 18 Z" fill="#9a3412" />
            {/* Sonrisa acogedora y ojos amables */}
            <circle cx="43" cy="37" r="1.5" fill="#1f2937" />
            <circle cx="57" cy="37" r="1.5" fill="#1f2937" />
            <path d="M45 44 Q50 48 55 44" fill="none" stroke="#1f2937" strokeWidth="1.5" strokeLinecap="round" />
            {/* Camisa ámbar / cálida */}
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#f59e0b" />
            {/* Bocadillo de diálogo flotante */}
            <path d="M20 62 L34 62 Q38 62 38 66 L38 74 Q38 78 34 78 L26 78 L22 82 L22 78 L20 78 Q16 78 16 74 L16 66 Q16 62 20 62 Z" fill="#ffffff" stroke="#d97706" strokeWidth="1" />
            <circle cx="23" cy="70" r="1" fill="#f59e0b" />
            <circle cx="27" cy="70" r="1" fill="#f59e0b" />
            <circle cx="31" cy="70" r="1" fill="#f59e0b" />
          </g>
        );

      // 11. Product Manager: Look smart-casual, tablero kanban interactivo
      case 'ea-11-product-manager':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fcd9b8" />
            <path d="M30 32 Q50 18 70 32 Q65 18 48 18 Z" fill="#1e1b4b" />
            <circle cx="43" cy="38" r="1.5" fill="#1e1b4b" />
            <circle cx="57" cy="38" r="1.5" fill="#1e1b4b" />
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#4338ca" />
            {/* Post-its / roadmap en la mano */}
            <rect x="22" y="68" width="10" height="10" rx="1" fill="#fef08a" />
            <rect x="66" y="70" width="10" height="10" rx="1" fill="#67e8f9" />
          </g>
        );

      // 12. Multimedia Producer: Audífonos de monitoreo profesionales, micrófono de condensador
      case 'ea-12-multimedia-producer':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#f5d0b5" />
            <path d="M32 30 Q50 18 68 30 Q58 18 40 18 Z" fill="#18181b" />
            {/* Audífonos grandes de estudio */}
            <path d="M26 36 Q26 14 50 14 Q74 14 74 36" fill="none" stroke="#f97316" strokeWidth="4" />
            <rect x="24" y="30" width="6" height="14" rx="2" fill="#ea580c" />
            <rect x="70" y="30" width="6" height="14" rx="2" fill="#ea580c" />
            <circle cx="43" cy="38" r="1.5" fill="#18181b" />
            <circle cx="57" cy="38" r="1.5" fill="#18181b" />
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#292524" />
            {/* Micrófono de estudio */}
            <ellipse cx="50" cy="74" rx="4" ry="7" fill="#a8a29e" stroke="#57534e" strokeWidth="1" />
            <line x1="50" y1="81" x2="50" y2="88" stroke="#57534e" strokeWidth="2" />
          </g>
        );

      // 13. Data Analyst: Gráficos de barras y dispersión, visualización de datos
      case 'ea-13-data-analyst':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fad2b6" />
            <path d="M32 30 Q50 18 68 30 Q58 18 40 18 Z" fill="#064e3b" />
            {/* Gafas inteligentes */}
            <rect x="39" y="34" width="9" height="5" rx="1" fill="none" stroke="#047857" strokeWidth="1.5" />
            <rect x="52" y="34" width="9" height="5" rx="1" fill="none" stroke="#047857" strokeWidth="1.5" />
            <line x1="48" y1="36" x2="52" y2="36" stroke="#047857" strokeWidth="1.5" />
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#065f46" />
            {/* Gráfico de barras ascendente en mano */}
            <rect x="62" y="76" width="3" height="10" fill="#34d399" />
            <rect x="67" y="72" width="3" height="14" fill="#34d399" />
            <rect x="72" y="66" width="3" height="20" fill="#10b981" />
          </g>
        );

      // 14. Opportunities Director: Abrigo ejecutivo, brújula estratégica dorada, portafolio
      case 'ea-opp-01-director':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fcd9b8" />
            <path d="M30 32 Q50 14 70 32 Q60 16 42 18 Z" fill="#172554" />
            <circle cx="43" cy="37" r="1.5" fill="#0f172a" />
            <circle cx="57" cy="37" r="1.5" fill="#0f172a" />
            {/* Gabardina / Abrigo ejecutivo azul marino profundo */}
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#1e3a8a" />
            <polygon points="50,56 42,72 58,72" fill="#f59e0b" />
            {/* Brújula dorada / emblema estratégico */}
            <circle cx="50" cy="78" r="7" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <polygon points="50,73 52,78 50,83 48,78" fill="#b45309" />
          </g>
        );

      // 15. Calls & Competitions Researcher: Chaqueta de expedición, catalejo / prismáticos, mini trofeo
      case 'ea-opp-02-competitions':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#f5d0b5" />
            <path d="M30 32 Q50 16 70 32 Q60 18 40 18 Z" fill="#422006" />
            <circle cx="43" cy="38" r="1.5" fill="#1c1917" />
            <circle cx="57" cy="38" r="1.5" fill="#1c1917" />
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#78350f" />
            {/* Prismáticos / catalejo al cuello */}
            <ellipse cx="44" cy="70" rx="3.5" ry="5" fill="#0284c7" />
            <ellipse cx="56" cy="70" rx="3.5" ry="5" fill="#0284c7" />
            <line x1="47.5" y1="70" x2="52.5" y2="70" stroke="#0369a1" strokeWidth="2" />
            {/* Mini trofeo BAQ */}
            <path d="M68 76 L74 76 L73 82 Q71 85 71 88 L75 88" fill="none" stroke="#facc15" strokeWidth="1.5" />
          </g>
        );

      // 16. Grants & Funding Researcher: Cardigan terroso, sello de aprobación, checklist de fondos
      case 'ea-opp-03-grants':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fad2b6" />
            <path d="M32 30 Q50 16 68 30 Q60 16 42 18 Z" fill="#365314" />
            <circle cx="43" cy="38" r="1.5" fill="#14532d" />
            <circle cx="57" cy="38" r="1.5" fill="#14532d" />
            {/* Suéter verde bosque / oliva */}
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#3f6212" />
            {/* Documento de fondo cultural sellado */}
            <rect x="22" y="68" width="14" height="20" rx="1.5" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1" />
            <circle cx="29" cy="78" r="4" fill="#ef4444" opacity="0.8" />
          </g>
        );

      // 17. Sponsorship Manager: Traje ejecutivo impecable, propuesta comercial y apretón de manos
      case 'ea-opp-04-sponsorship':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fcd9b8" />
            <path d="M30 30 Q50 14 70 30 Q60 16 42 18 Z" fill="#1e293b" />
            <circle cx="43" cy="37" r="1.5" fill="#0f172a" />
            <circle cx="57" cy="37" r="1.5" fill="#0f172a" />
            {/* Traje gris grafito con corbata sobria */}
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#334155" />
            <polygon points="50,56 46,68 54,68" fill="#ffffff" />
            <polygon points="50,68 48,84 52,84" fill="#0284c7" />
            {/* Carpeta corporativa con logo patrocinio */}
            <rect x="62" y="66" width="16" height="22" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
            <circle cx="70" cy="77" r="3" fill="#38bdf8" />
          </g>
        );

      // 18. Institutional Partnerships: Sello universitario, documento de alianza académica
      case 'ea-opp-05-institutional':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#f5d0b5" />
            <path d="M32 32 Q50 16 68 32 Q62 18 42 18 Z" fill="#4c0519" />
            <circle cx="43" cy="38" r="1.5" fill="#881337" />
            <circle cx="57" cy="38" r="1.5" fill="#881337" />
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#881337" />
            {/* Pergamino de convenio universitario */}
            <path d="M22 66 L36 66 L34 88 L20 88 Z" fill="#fff1f2" stroke="#e11d48" strokeWidth="1" />
            <circle cx="27" cy="74" r="3" fill="#e11d48" />
          </g>
        );

      // 19. Pitch Designer: Suéter beige minimalista, tableta gráfica con lápiz óptico
      case 'ea-opp-06-designer':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fad2b6" />
            <path d="M28 34 Q45 14 70 28 Q64 16 46 18 Z" fill="#18181b" />
            <circle cx="43" cy="37" r="1.5" fill="#18181b" />
            <circle cx="57" cy="37" r="1.5" fill="#18181b" />
            {/* Suéter de diseñador color arena / beige */}
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#d6d3d1" />
            {/* Tableta gráfica con stylus */}
            <rect x="58" y="64" width="20" height="24" rx="2" fill="#1c1917" stroke="#fbbf24" strokeWidth="1" />
            <circle cx="68" cy="74" r="4" fill="#fbbf24" opacity="0.6" />
            <line x1="74" y1="62" x2="80" y2="54" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" />
          </g>
        );

      // 20. Opportunities Analyst: Gafas redondas, pantalla con métricas de viabilidad
      case 'ea-opp-07-analyst':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fcd9b8" />
            <path d="M30 32 Q50 16 70 32 Q58 18 40 18 Z" fill="#312e81" />
            <circle cx="43" cy="37" r="4.5" fill="none" stroke="#4f46e5" strokeWidth="1.2" />
            <circle cx="57" cy="37" r="4.5" fill="none" stroke="#4f46e5" strokeWidth="1.2" />
            <line x1="47.5" y1="37" x2="52.5" y2="37" stroke="#4f46e5" strokeWidth="1.2" />
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#3730a3" />
            {/* Indicador de scoring de viabilidad */}
            <circle cx="50" cy="76" r="8" fill="#0f172a" stroke="#818cf8" strokeWidth="1.5" />
            <text x="45" y="80" fill="#a5b4fc" fontSize="8" fontFamily="monospace" fontWeight="bold">98</text>
          </g>
        );

      // Personaje Humano Director Central (User)
      case 'ea-director-human':
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fcd9b8" />
            <path d="M28 32 Q50 12 72 30 Q60 14 42 16 Z" fill="#0f172a" />
            <circle cx="43" cy="36" r="5" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <circle cx="57" cy="36" r="5" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <line x1="48" y1="36" x2="52" y2="36" stroke="#f59e0b" strokeWidth="1.5" />
            <path d="M30 56 L70 56 L78 96 L22 96 Z" fill="#09090b" />
            <polygon points="50,56 42,70 58,70" fill="#f59e0b" />
            {/* Sello distintivo de Director General */}
            <circle cx="50" cy="78" r="8" fill="#18181b" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="44" y="82" fill="#f59e0b" fontSize="8" fontFamily="sans-serif" fontWeight="bold">EA</text>
          </g>
        );

      default:
        return (
          <g>
            <circle cx="50" cy="36" r="18" fill="#fad2b6" />
            <path d="M30 32 Q50 16 70 32 Q58 18 40 18 Z" fill="#292524" />
            <circle cx="43" cy="38" r="1.5" fill="#292524" />
            <circle cx="57" cy="38" r="1.5" fill="#292524" />
            <path d="M30 56 L70 56 L76 96 L24 96 Z" fill="#3f3f46" />
          </g>
        );
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Halo de actividad / estado vivo */}
      {showAura && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ backgroundColor: statusColor }}
        />
      )}

      {/* SVG del personaje */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md transition-transform duration-200 hover:scale-105"
        style={{ overflow: 'visible' }}
      >
        {/* Fondo circular con borde fino arquitectónico */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="#141417"
          stroke={statusColor}
          strokeWidth="2.5"
          className="transition-colors duration-300"
        />

        {/* Clip path para que el cuerpo quede perfectamente recortado en el avatar circular */}
        <defs>
          <clipPath id={`clip-${agentId}`}>
            <circle cx="50" cy="50" r="46" />
          </clipPath>
        </defs>

        <g clipPath={`url(#clip-${agentId})`}>
          {renderAgentCharacter()}
        </g>

        {/* Indicador de estado en esquina inferior derecha */}
        <circle
          cx="82"
          cy="82"
          r="8"
          fill="#09090b"
          stroke="#18181b"
          strokeWidth="2"
        />
        <circle
          cx="82"
          cy="82"
          r="5"
          fill={statusColor}
        />
      </svg>
    </div>
  );
};
