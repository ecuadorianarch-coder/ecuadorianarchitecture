import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Compass,
  X,
  Send,
  Video,
  Coffee,
  Zap,
  Maximize2,
  Minimize2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileText,
  Share2,
  DollarSign,
  Award,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Edit3
} from 'lucide-react';
import { AgentCharacterAvatar } from './AgentCharacterAvatar';
import { DeskAgentData } from './AgentDeskWorkstation';

interface GatherOfficeWorldProps {
  agentsMap: Record<string, DeskAgentData>;
  onOpenAgentDrawer: (agent: DeskAgentData) => void;
  onOpenDirectorModal: () => void;
  onOpenMeetingModal: () => void;
  onApproveArticle: (articleId: string) => void;
  onApproveCarousel: (pkgId: string) => void;
  onApproveNewsletter: (newsletterId: string) => void;
  needsAttentionCount: number;
}

interface DeskEntity {
  id: string;
  name: string;
  shortName: string;
  role: string;
  simpleRole: string; // Explicación humana sencilla
  x: number;
  y: number;
  width: number;
  height: number;
  deptKey: string;
  deptName: string;
  color: string;
  facing: 'up' | 'down' | 'left' | 'right';
  hasDualMonitors?: boolean;
}

// 20 Agentes distribuidos ergonómicamente en islas de trabajo idénticas a la imagen de Gather.town
const DESK_ENTITIES: DeskEntity[] = [
  // 1. ZONA DIRECCIÓN GENERAL (Superior Izquierda)
  { id: 'ea-01-chief-editor', name: 'EA Chief Editor', shortName: 'Chief Editor', role: 'Editor-in-Chief', simpleRole: 'Supervisa la línea editorial y la calidad de todas las publicaciones', x: 190, y: 310, width: 85, height: 50, deptKey: 'direccion-general', deptName: 'DIRECCIÓN EDITORIAL', color: '#f59e0b', facing: 'down', hasDualMonitors: true },
  { id: 'ea-02-managing-editor', name: 'Managing Editor', shortName: 'Managing Editor', role: 'Jefe de Redacción', simpleRole: 'Organiza los tiempos, redactores y el flujo de los artículos', x: 340, y: 310, width: 85, height: 50, deptKey: 'direccion-general', deptName: 'DIRECCIÓN EDITORIAL', color: '#f59e0b', facing: 'down', hasDualMonitors: true },

  // 2. ZONA INVESTIGACIÓN Y CRÍTICA (Superior Derecha)
  { id: 'ea-03-architecture-editor', name: 'Architecture Editor', shortName: 'Arq. Editor', role: 'Editor de Textos', simpleRole: 'Corrige la redacción y la precisión arquitectónica', x: 1140, y: 300, width: 85, height: 50, deptKey: 'investigacion-critica', deptName: 'INVESTIGACIÓN & CRÍTICA', color: '#06b6d4', facing: 'down', hasDualMonitors: true },
  { id: 'ea-04-architecture-critic', name: 'Architecture Critic', shortName: 'Crítico Arq.', role: 'Crítico de Arquitectura', simpleRole: 'Escribe el análisis crítico y califica el proyecto', x: 1300, y: 300, width: 85, height: 50, deptKey: 'investigacion-critica', deptName: 'INVESTIGACIÓN & CRÍTICA', color: '#06b6d4', facing: 'down', hasDualMonitors: true },
  { id: 'ea-05-research-editor', name: 'Research Editor', shortName: 'Investigador', role: 'Editor de Investigación', simpleRole: 'Busca el contexto histórico, planos y memorias técnicas', x: 1140, y: 440, width: 85, height: 50, deptKey: 'investigacion-critica', deptName: 'INVESTIGACIÓN & CRÍTICA', color: '#06b6d4', facing: 'up', hasDualMonitors: true },
  { id: 'ea-06-fact-checker', name: 'Fact Checker', shortName: 'Verificador', role: 'Verificador de Datos', simpleRole: 'Revisa que los metros cuadrados, autores y fechas sean reales', x: 1300, y: 440, width: 85, height: 50, deptKey: 'investigacion-critica', deptName: 'INVESTIGACIÓN & CRÍTICA', color: '#06b6d4', facing: 'up', hasDualMonitors: false },

  // 3. ZONA CREATIVIDAD & MULTIMEDIA (Centro Derecha)
  { id: 'ea-opp-06-designer', name: 'Pitch Designer', shortName: 'Diseñador', role: 'Diseñador Gráfico', simpleRole: 'Crea portadas y dossiers visuales para presentaciones', x: 1140, y: 640, width: 85, height: 50, deptKey: 'creatividad-multimedia', deptName: 'CREATIVIDAD & REDES', color: '#e11d48', facing: 'down', hasDualMonitors: true },
  { id: 'ea-07-instagram-editor', name: 'Instagram Editor', shortName: 'Instagram', role: 'Editor de Instagram', simpleRole: 'Diseña y redacta los carruseles de 10 láminas para redes', x: 1300, y: 640, width: 85, height: 50, deptKey: 'creatividad-multimedia', deptName: 'CREATIVIDAD & REDES', color: '#e11d48', facing: 'down', hasDualMonitors: true },
  { id: 'ea-08-newsletter-editor', name: 'Newsletter Editor', shortName: 'Boletín', role: 'Editor de Newsletter', simpleRole: 'Redacta el boletín mensual enviado a suscriptores', x: 1140, y: 770, width: 85, height: 50, deptKey: 'creatividad-multimedia', deptName: 'CREATIVIDAD & REDES', color: '#e11d48', facing: 'up', hasDualMonitors: false },
  { id: 'ea-12-multimedia-producer', name: 'Multimedia Producer', shortName: 'Podcast & Audio', role: 'Productor Multimedia', simpleRole: 'Edita entrevistas de audio y guiones de podcast', x: 1300, y: 770, width: 85, height: 50, deptKey: 'creatividad-multimedia', deptName: 'CREATIVIDAD & REDES', color: '#e11d48', facing: 'up', hasDualMonitors: true },

  // 4. ZONA COMUNIDAD & ALIANZAS (Inferior Derecha)
  { id: 'ea-10-community-manager', name: 'Community Manager', shortName: 'Comunidad', role: 'Gestor de Comunidad', simpleRole: 'Modera comentarios de lectores y gestiona dudas del público', x: 1140, y: 990, width: 85, height: 50, deptKey: 'comunidad', deptName: 'COMUNIDAD & ALIANZAS', color: '#8b5cf6', facing: 'down', hasDualMonitors: false },
  { id: 'ea-opp-05-institutional', name: 'Institutional Manager', shortName: 'Alianzas Univ.', role: 'Alianzas Institucionales', simpleRole: 'Conecta con facultades de arquitectura y bienales', x: 1300, y: 990, width: 85, height: 50, deptKey: 'comunidad', deptName: 'COMUNIDAD & ALIANZAS', color: '#8b5cf6', facing: 'down', hasDualMonitors: true },

  // 5. ZONA TECNOLOGÍA & WEBOPS (Inferior Izquierda)
  { id: 'ea-09-webops-engineer', name: 'WebOps Engineer', shortName: 'WebOps', role: 'Ingeniero WebOps', simpleRole: 'Vigila que la web nunca se caiga y cargue ultra rápido', x: 180, y: 990, width: 85, height: 50, deptKey: 'tecnologia', deptName: 'TECNOLOGÍA & WEBOPS', color: '#10b981', facing: 'down', hasDualMonitors: true },
  { id: 'ea-11-product-manager', name: 'Product Manager', shortName: 'Producto', role: 'Gestor de Producto', simpleRole: 'Mejora las funciones del sitio web y la experiencia de usuario', x: 310, y: 990, width: 85, height: 50, deptKey: 'tecnologia', deptName: 'TECNOLOGÍA & WEBOPS', color: '#10b981', facing: 'down', hasDualMonitors: true },
  { id: 'ea-13-data-analyst', name: 'Data Analyst', shortName: 'Analista Datos', role: 'Analista de Métricas', simpleRole: 'Mide lecturas, visitas y mapas de calor territoriales', x: 440, y: 990, width: 85, height: 50, deptKey: 'tecnologia', deptName: 'TECNOLOGÍA & WEBOPS', color: '#10b981', facing: 'down', hasDualMonitors: true },

  // 6. ZONA COMERCIAL & FONDOS (Centro Izquierda)
  { id: 'ea-opp-01-director', name: 'Opportunities Director', shortName: 'Dir. Oportunidades', role: 'Director Oportunidades', simpleRole: 'Coordina la búsqueda de fondos, premios y alianzas', x: 180, y: 640, width: 85, height: 50, deptKey: 'comercial-operaciones', deptName: 'FONDOS & AUSPICIOS', color: '#d97706', facing: 'down', hasDualMonitors: true },
  { id: 'ea-opp-02-competitions', name: 'Calls Researcher', shortName: 'Concursos', role: 'Investigador Concursos', simpleRole: 'Rastrea bienales, premios y convocatorias de arquitectura', x: 310, y: 640, width: 85, height: 50, deptKey: 'comercial-operaciones', deptName: 'FONDOS & AUSPICIOS', color: '#d97706', facing: 'down', hasDualMonitors: true },
  { id: 'ea-opp-03-grants', name: 'Grants Researcher', shortName: 'Fondos Públicos', role: 'Fondos y Becas', simpleRole: 'Investiga fondos culturales del IFCI, AECID y subsidios', x: 440, y: 640, width: 85, height: 50, deptKey: 'comercial-operaciones', deptName: 'FONDOS & AUSPICIOS', color: '#d97706', facing: 'down', hasDualMonitors: false },
  { id: 'ea-opp-04-sponsorship', name: 'Sponsorship Manager', shortName: 'Auspicios', role: 'Gestor de Auspicios', simpleRole: 'Identifica marcas de materiales (Holcim, Novacero) afines', x: 230, y: 770, width: 85, height: 50, deptKey: 'comercial-operaciones', deptName: 'FONDOS & AUSPICIOS', color: '#d97706', facing: 'up', hasDualMonitors: true },
  { id: 'ea-opp-07-analyst', name: 'Impact Analyst', shortName: 'Evaluador', role: 'Analista de Viabilidad', simpleRole: 'Calcula si conviene postular a un fondo según sus bases', x: 390, y: 770, width: 85, height: 50, deptKey: 'comercial-operaciones', deptName: 'FONDOS & AUSPICIOS', color: '#d97706', facing: 'up', hasDualMonitors: false }
];

export const GatherOfficeWorld: React.FC<GatherOfficeWorldProps> = ({
  agentsMap,
  onOpenAgentDrawer,
  onOpenDirectorModal,
  onOpenMeetingModal,
  onApproveArticle,
  onApproveCarousel,
  onApproveNewsletter,
  needsAttentionCount
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Posición inicial del Director en el centro de la oficina
  const [playerPos, setPlayerPos] = useState<{ x: number; y: number }>({ x: 800, y: 630 });
  const [targetPos, setTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [isWalking, setIsWalking] = useState(false);
  const [walkFrame, setWalkFrame] = useState(0);
  const [playerDirection, setPlayerDirection] = useState<'down' | 'up' | 'left' | 'right'>('down');
  const [activeNearbyEntity, setActiveNearbyEntity] = useState<DeskEntity | null>(null);
  const [isInMeetingRoom, setIsInMeetingRoom] = useState(false);
  const [isNearDirectorDesk, setIsNearDirectorDesk] = useState(false);
  const [isNearCafeteria, setIsNearCafeteria] = useState(false);
  const [isNearGames, setIsNearGames] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Diálogo amigable con el agente
  const [interactingAgent, setInteractingAgent] = useState<DeskAgentData | null>(null);
  const [interactingEntity, setInteractingEntity] = useState<DeskEntity | null>(null);
  const [quickChatMessage, setQuickChatMessage] = useState('');
  const [isSendingQuickChat, setIsSendingQuickChat] = useState(false);
  const [customFeedbackNotes, setCustomFeedbackNotes] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  const keysPressed = useRef<Record<string, boolean>>({});

  // Manejo de teclado (WASD, Flechas, Espacio, E)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      keysPressed.current[e.key.toLowerCase()] = true;

      if (e.key.toLowerCase() === 'e' || e.key === ' ') {
        e.preventDefault();
        if (activeNearbyEntity) {
          const agentData = agentsMap[activeNearbyEntity.id];
          if (agentData) {
            setInteractingAgent(agentData);
            setInteractingEntity(activeNearbyEntity);
          }
        } else if (isNearDirectorDesk) {
          onOpenDirectorModal();
        } else if (isInMeetingRoom) {
          onOpenMeetingModal();
        }
      }

      if (e.key === 'Escape') {
        setInteractingAgent(null);
        setShowFeedbackInput(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeNearbyEntity, isNearDirectorDesk, isInMeetingRoom, agentsMap, onOpenDirectorModal, onOpenMeetingModal]);

  // Clic en el piso para caminar o interactuar
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // 1. Clic sobre un escritorio de agente
    const clickedDesk = DESK_ENTITIES.find(
      d => clickX >= d.x - 25 && clickX <= d.x + d.width + 25 && clickY >= d.y - 25 && clickY <= d.y + d.height + 25
    );

    if (clickedDesk) {
      const agentData = agentsMap[clickedDesk.id];
      if (agentData) {
        setInteractingAgent(agentData);
        setInteractingEntity(clickedDesk);
        setTargetPos({ x: clickedDesk.x + clickedDesk.width / 2, y: clickedDesk.y + (clickedDesk.facing === 'up' ? -30 : clickedDesk.height + 35) });
        return;
      }
    }

    // 2. Clic sobre la Mesa del Director
    if (clickX >= 720 && clickX <= 880 && clickY >= 490 && clickY <= 610) {
      onOpenDirectorModal();
      return;
    }

    // 3. Clic sobre la Sala de Reuniones
    if (clickX >= 580 && clickX <= 1020 && clickY >= 70 && clickY <= 250) {
      onOpenMeetingModal();
      return;
    }

    // 4. Caminar hacia el punto clickeado
    setTargetPos({ x: Math.max(50, Math.min(1550, clickX)), y: Math.max(50, Math.min(1150, clickY)) });
  };

  // Motor de física de movimiento a 60 FPS
  useEffect(() => {
    let animId: number;

    const updatePhysics = () => {
      setPlayerPos(prev => {
        let { x, y } = prev;
        const speed = 4.5;
        let moved = false;
        let newDir = playerDirection;

        const k = keysPressed.current;
        let dx = 0;
        let dy = 0;

        if (k['arrowup'] || k['w']) {
          dy -= speed;
          newDir = 'up';
          moved = true;
        }
        if (k['arrowdown'] || k['s']) {
          dy += speed;
          newDir = 'down';
          moved = true;
        }
        if (k['arrowleft'] || k['a']) {
          dx -= speed;
          newDir = 'left';
          moved = true;
        }
        if (k['arrowright'] || k['d']) {
          dx += speed;
          newDir = 'right';
          moved = true;
        }

        if (moved) {
          setTargetPos(null);
          x = Math.max(60, Math.min(1540, x + dx));
          y = Math.max(60, Math.min(1140, y + dy));
          setPlayerDirection(newDir);
          setIsWalking(true);
          setWalkFrame(f => (f + 1) % 60);
        } else if (targetPos) {
          const distX = targetPos.x - x;
          const distY = targetPos.y - y;
          const dist = Math.sqrt(distX * distX + distY * distY);

          if (dist > 6) {
            moved = true;
            setIsWalking(true);
            setWalkFrame(f => (f + 1) % 60);
            const moveStep = Math.min(dist, speed);
            x += (distX / dist) * moveStep;
            y += (distY / dist) * moveStep;

            if (Math.abs(distX) > Math.abs(distY)) {
              setPlayerDirection(distX > 0 ? 'right' : 'left');
            } else {
              setPlayerDirection(distY > 0 ? 'down' : 'up');
            }
          } else {
            setTargetPos(null);
            setIsWalking(false);
          }
        } else {
          setIsWalking(false);
        }

        // Detección de proximidad con escritorios
        let foundDesk: DeskEntity | null = null;
        for (const desk of DESK_ENTITIES) {
          const centerX = desk.x + desk.width / 2;
          const centerY = desk.y + desk.height / 2;
          const distToDesk = Math.hypot(x - centerX, y - centerY);
          if (distToDesk < 85) {
            foundDesk = desk;
            break;
          }
        }
        setActiveNearbyEntity(foundDesk);

        // Zonas especiales
        const inMeet = x >= 560 && x <= 1040 && y >= 60 && y <= 260;
        setIsInMeetingRoom(inMeet);

        const nearDir = Math.hypot(x - 800, y - 550) < 110;
        setIsNearDirectorDesk(nearDir);

        const nearCafe = x >= 650 && x <= 950 && y >= 270 && y <= 450;
        setIsNearCafeteria(nearCafe);

        const nearGms = x >= 640 && x <= 960 && y >= 950 && y <= 1150;
        setIsNearGames(nearGms);

        return { x, y };
      });

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [playerDirection, targetPos]);

  // RENDERIZADO GRÁFICO GATHER.TOWN DE ALTA FIDELIDAD
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    // 1. PISO BASE: Tablones de madera oscura estilo Gather (circulación general)
    ctx.fillStyle = '#22232a';
    ctx.fillRect(0, 0, W, H);

    // Líneas de tablones de madera horizontales
    ctx.strokeStyle = '#1a1b21';
    ctx.lineWidth = 1;
    for (let gy = 0; gy < H; gy += 24) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(W, gy);
      ctx.stroke();

      // Cortes alternados de madera para textura realista
      const offset = (gy / 24) % 2 === 0 ? 0 : 70;
      for (let gx = offset; gx < W; gx += 140) {
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx, gy + 24);
        ctx.stroke();
      }
    }

    // 2. ZONAS DE OFICINA: Pisos con textura Herringbone / Parquet y alfombras
    const rooms = [
      // Zona 1: Dirección Editorial (Arriba Izquierda)
      { x: 120, y: 240, w: 420, h: 220, label: '01. DIRECCIÓN EDITORIAL', floor: '#2e2b27', border: '#423c34', badge: 'DIRECCIÓN' },
      // Zona 2: Investigación & Crítica (Arriba Derecha)
      { x: 1060, y: 240, w: 420, h: 270, label: '02. INVESTIGACIÓN Y CRÍTICA', floor: '#262f36', border: '#33404a', badge: 'CRÍTICA' },
      // Zona 3: Creatividad & Redes (Centro Derecha)
      { x: 1060, y: 580, w: 420, h: 270, label: '03. CREATIVIDAD & MULTIMEDIA', floor: '#36272c', border: '#4c353d', badge: 'REDES' },
      // Zona 4: Comunidad & Alianzas (Abajo Derecha)
      { x: 1060, y: 920, w: 420, h: 220, label: '04. COMUNIDAD & ALIANZAS', floor: '#2d2636', border: '#3e344b', badge: 'COMUNIDAD' },
      // Zona 5: Tecnología & WebOps (Abajo Izquierda)
      { x: 120, y: 920, w: 420, h: 220, label: '05. TECNOLOGÍA & WEBOPS', floor: '#24322a', border: '#2e4337', badge: 'WEBOPS' },
      // Zona 6: Fondos & Auspicios (Centro Izquierda)
      { x: 120, y: 580, w: 420, h: 270, label: '06. FONDOS & AUSPICIOS', floor: '#352e25', border: '#493f31', badge: 'OPORTUNIDADES' }
    ];

    rooms.forEach(r => {
      // Piso de la habitación
      ctx.fillStyle = r.floor;
      ctx.fillRect(r.x, r.y, r.w, r.h);

      // Marco y zócalo de la sala
      ctx.strokeStyle = r.border;
      ctx.lineWidth = 3;
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      // Cartel colgante en la entrada superior
      ctx.fillStyle = '#141418';
      ctx.fillRect(r.x + 20, r.y - 12, 180, 22);
      ctx.strokeStyle = r.border;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(r.x + 20, r.y - 12, 180, 22);

      ctx.fillStyle = '#f4f4f5';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(r.label, r.x + 28, r.y + 3);
    });

    // 3. CAFETERÍA & BUFFET (Centro Superior): Piso ajedrezado exacto a la imagen Gather
    const cafeX = 640;
    const cafeY = 270;
    const cafeW = 320;
    const cafeH = 170;

    // Piso ajedrezado (Checkered floor)
    const tileSize = 20;
    for (let cx = cafeX; cx < cafeX + cafeW; cx += tileSize) {
      for (let cy = cafeY; cy < cafeY + cafeH; cy += tileSize) {
        const isLight = ((cx - cafeX) / tileSize + (cy - cafeY) / tileSize) % 2 === 0;
        ctx.fillStyle = isLight ? '#4c4e5a' : '#363740';
        ctx.fillRect(cx, cy, tileSize, tileSize);
      }
    }
    ctx.strokeStyle = '#5c5e6d';
    ctx.lineWidth = 2;
    ctx.strokeRect(cafeX, cafeY, cafeW, cafeH);

    // Mueble de cafetería / Cocina al fondo
    ctx.fillStyle = '#1e1f24';
    ctx.fillRect(cafeX + 15, cafeY + 8, 290, 26);
    ctx.strokeStyle = '#32343d';
    ctx.strokeRect(cafeX + 15, cafeY + 8, 290, 26);

    // Cafetera espresso
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(cafeX + 30, cafeY + 12, 18, 16);
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(cafeX + 32, cafeY + 14, 6, 8); // Luces de cafetera

    // Dispensador de agua con botellón azul
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(cafeX + 70, cafeY + 14, 14, 16);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(cafeX + 77, cafeY + 12, 7, 0, Math.PI * 2);
    ctx.fill();

    // Máquina expendedora (Vending machine)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(cafeX + 110, cafeY + 8, 26, 26);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(cafeX + 114, cafeY + 12, 18, 14); // Vidrio con bebidas
    ctx.fillStyle = '#facc15';
    ctx.fillRect(cafeX + 128, cafeY + 28, 4, 4); // Ranura monedas

    // Mesas de café redondas con sillas
    const cafeTables = [
      { x: cafeX + 60, y: cafeY + 80 },
      { x: cafeX + 160, y: cafeY + 80 },
      { x: cafeX + 260, y: cafeY + 80 }
    ];
    cafeTables.forEach(t => {
      // Mesa de madera redonda
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Taza de café encima
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Sillas a los lados
      ctx.fillStyle = '#451a03';
      ctx.fillRect(t.x - 26, t.y - 7, 8, 14);
      ctx.fillRect(t.x + 18, t.y - 7, 8, 14);
    });

    // Mesa de Buffet con pizza y comida
    ctx.fillStyle = '#92400e';
    ctx.fillRect(cafeX + 100, cafeY + 125, 120, 28);
    ctx.strokeStyle = '#78350f';
    ctx.strokeRect(cafeX + 100, cafeY + 125, 120, 28);

    // Caja de pizza abierta con rebanadas
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(cafeX + 115, cafeY + 130, 20, 18);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cafeX + 125, cafeY + 139, 7, 0, Math.PI * 2);
    ctx.fill();

    // Pastel / Bocaditos
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(cafeX + 155, cafeY + 132, 18, 14);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(cafeX + 185, cafeY + 132, 20, 14);

    // Cartel Cafetería
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('☕ CAFETERÍA & BUFFET EA', cafeX + cafeW / 2, cafeY + cafeH - 6);

    // 4. SALA DE REUNIONES (Boardroom - Superior Centro)
    ctx.fillStyle = '#1a1824';
    ctx.fillRect(580, 50, 440, 180);
    ctx.strokeStyle = isInMeetingRoom ? '#a855f7' : '#39334a';
    ctx.lineWidth = isInMeetingRoom ? 3 : 2;
    ctx.strokeRect(580, 50, 440, 180);

    // Pizarra blanca (Whiteboard) en la pared superior con diagramas azules
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(680, 55, 120, 30);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(680, 55, 120, 30);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(690, 62, 24, 16); // Cajitas de flujo
    ctx.strokeRect(730, 62, 24, 16);
    ctx.beginPath();
    ctx.moveTo(714, 70);
    ctx.lineTo(730, 70);
    ctx.stroke();

    // Mapa mundial enmarcado
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(830, 55, 70, 30);
    ctx.strokeStyle = '#d97706';
    ctx.strokeRect(830, 55, 70, 30);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(865, 70, 8, 0, Math.PI * 2);
    ctx.fill();

    // Gran Mesa de Conferencias Ovalada
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.ellipse(800, 145, 130, 45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#57534e';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Sillas ejecutivas alrededor de la mesa
    const chairAngles = [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.6, 4.0, 4.4, 4.8, 5.2, 5.6, 6.0];
    chairAngles.forEach(ang => {
      const cx = 800 + Math.cos(ang) * 145;
      const cy = 145 + Math.sin(ang) * 58;
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(cx, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎙️ SALA DE CONFERENCIAS // COMITÉ EDITORIAL', 800, 148);

    // 5. ZONA LOUNGE & JUEGOS (Inferior Centro)
    const loungeX = 640;
    const loungeY = 940;
    const loungeW = 320;
    const loungeH = 190;

    // Alfombra oscura acogedora
    ctx.fillStyle = '#1c222a';
    ctx.fillRect(loungeX, loungeY, loungeW, loungeH);
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.strokeRect(loungeX, loungeY, loungeW, loungeH);

    // Sofás de cuero marrón (Lounge couches)
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(loungeX + 20, loungeY + 30, 70, 26);
    ctx.fillRect(loungeX + 20, loungeY + 75, 70, 26);
    // Mesa de centro ovalada
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.ellipse(loungeX + 55, loungeY + 65, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ping-Pong Table (Mesa de Tenis de Mesa verde con red blanca)
    const pingX = loungeX + 130;
    const pingY = loungeY + 35;
    ctx.fillStyle = '#15803d';
    ctx.fillRect(pingX, pingY, 70, 44);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(pingX, pingY, 70, 44);
    // Red blanca en el medio
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pingX + 35, pingY);
    ctx.lineTo(pingX + 35, pingY + 44);
    ctx.stroke();
    // Paletas
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(pingX + 15, pingY + 22, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(pingX + 55, pingY + 22, 4, 0, Math.PI * 2);
    ctx.fill();

    // Futbolín (Foosball table)
    const footX = loungeX + 230;
    const footY = loungeY + 35;
    ctx.fillStyle = '#166534';
    ctx.fillRect(footX, footY, 65, 44);
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(footX, footY, 65, 44);
    // Barras de jugadores
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    for (let rod = 10; rod < 65; rod += 15) {
      ctx.beginPath();
      ctx.moveTo(footX + rod, footY - 4);
      ctx.lineTo(footX + rod, footY + 48);
      ctx.stroke();
    }

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('🎮 LOUNGE, PING-PONG & FUTBOLÍN', loungeX + loungeW / 2, loungeY + loungeH - 12);

    // 6. ÁRBOL DE CEREZO CENTRAL (Sakura Tree) EXACTO AL SCREENSHOT
    const treeX = 800;
    const treeY = 720;

    // Macetero circular de madera y césped
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(treeX, treeY, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Copa rosa del cerezo (sakura blooming)
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(treeX, treeY - 8, 38, 0, Math.PI * 2);
    ctx.arc(treeX - 20, treeY - 14, 26, 0, Math.PI * 2);
    ctx.arc(treeX + 22, treeY - 14, 26, 0, Math.PI * 2);
    ctx.arc(treeX, treeY - 26, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbcfe8';
    ctx.beginPath();
    ctx.arc(treeX - 8, treeY - 18, 18, 0, Math.PI * 2);
    ctx.arc(treeX + 10, treeY - 12, 16, 0, Math.PI * 2);
    ctx.fill();

    // Pétalos caídos en el suelo alrededor
    ctx.fillStyle = '#fbcfe8';
    const petals = [
      { x: treeX - 35, y: treeY + 15 },
      { x: treeX + 38, y: treeY + 12 },
      { x: treeX - 15, y: treeY + 36 },
      { x: treeX + 20, y: treeY + 32 }
    ];
    petals.forEach(p => {
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 4, 2, 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    // 7. MESA DEL DIRECTOR (Curved Yellow Reception/Director Desk)
    const dirDeskX = 800;
    const dirDeskY = 550;

    // Resplandor áurico si hay decisiones pendientes
    if (needsAttentionCount > 0) {
      const pulse = (Math.sin(Date.now() / 250) + 1) / 2;
      ctx.fillStyle = `rgba(245, 158, 11, ${0.15 + pulse * 0.25})`;
      ctx.beginPath();
      ctx.arc(dirDeskX, dirDeskY, 95, 0, Math.PI * 2);
      ctx.fill();
    }

    // Escritorio curvado amarillo/dorado
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.ellipse(dirDeskX, dirDeskY, 75, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Silla ejecutiva del director (detrás del escritorio)
    ctx.fillStyle = '#18181b';
    ctx.beginPath();
    ctx.arc(dirDeskX, dirDeskY + 8, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pantalla ultra-panorámica curva en el escritorio del Director
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(dirDeskX - 35, dirDeskY - 20, 70, 10);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(dirDeskX - 32, dirDeskY - 18, 64, 6); // Brillo de pantalla

    // Placa dorada "MESA DEL DIRECTOR"
    ctx.fillStyle = '#78350f';
    ctx.fillRect(dirDeskX - 45, dirDeskY - 4, 90, 14);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⭐ MESA DEL DIRECTOR', dirDeskX, dirDeskY + 6);

    // Globo de decisiones pendientes si hay entregas esperando
    if (needsAttentionCount > 0) {
      const pulseY = Math.sin(Date.now() / 200) * 4;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(dirDeskX - 60, dirDeskY - 55 + pulseY, 120, 22, 6);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(`⚡ ${needsAttentionCount} DECISIONES`, dirDeskX, dirDeskY - 41 + pulseY);
    }

    // 8. ESCRITORIOS Y PERSONAJES DE LOS 20 AGENTES (Pixel/Chibi Style)
    DESK_ENTITIES.forEach(desk => {
      const agentState = agentsMap[desk.id];
      const isNearby = activeNearbyEntity?.id === desk.id;
      const status = agentState?.status || 'disponible';
      const isWaitingApproval = status === 'esperando_aprobacion';

      // Resplandor interactivo si el jugador está cerca
      if (isNearby) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.beginPath();
        ctx.arc(desk.x + desk.width / 2, desk.y + desk.height / 2, 60, 0, Math.PI * 2);
        ctx.fill();
      }

      // Base del escritorio moderno (madera clara y tapa blanca)
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(desk.x, desk.y, desk.width, desk.height);
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(desk.x, desk.y, desk.width, desk.height);

      // Monitores sobre el escritorio
      if (desk.hasDualMonitors) {
        // Monitor 1
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(desk.x + 8, desk.y + 6, 28, 14);
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(desk.x + 10, desk.y + 8, 24, 10); // Pantalla código/plano

        // Monitor 2
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(desk.x + 42, desk.y + 6, 28, 14);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(desk.x + 44, desk.y + 8, 24, 10);
      } else {
        // Monitor simple centrado
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(desk.x + desk.width / 2 - 18, desk.y + 6, 36, 14);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(desk.x + desk.width / 2 - 16, desk.y + 8, 32, 10);
      }

      // Accesorios de oficina: Taza de café y plantita suculenta
      ctx.fillStyle = '#f97316'; // Taza naranja
      ctx.fillRect(desk.x + desk.width - 12, desk.y + 24, 6, 6);
      ctx.fillStyle = '#16a34a'; // Mini planta verde
      ctx.beginPath();
      ctx.arc(desk.x + 10, desk.y + 26, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Silla del agente (según la orientación 'up' o 'down')
      const chairY = desk.facing === 'up' ? desk.y - 14 : desk.y + desk.height + 14;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(desk.x + desk.width / 2, chairY, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.stroke();

      // PERSONAJE CHIBI / PIXEL SENTADO EN LA SILLA
      const charX = desk.x + desk.width / 2;
      const charY = chairY;

      // Cuerpo / Camisa con el color de su departamento
      ctx.fillStyle = desk.color;
      ctx.beginPath();
      ctx.arc(charX, charY, 8, 0, Math.PI * 2);
      ctx.fill();

      // Cabeza y cabello
      ctx.fillStyle = '#fed7aa'; // Piel
      ctx.beginPath();
      ctx.arc(charX, charY - 4, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#1c1917'; // Cabello oscuro
      ctx.beginPath();
      ctx.arc(charX, charY - 7, 6, Math.PI, 0);
      ctx.fill();

      // CARTEL FLOTANTE CON NOMBRE Y PUNTO DE ESTADO (Idéntico a Gather.town)
      const tagY = desk.facing === 'up' ? desk.y - 32 : desk.y + desk.height + 34;

      // Determinar color y texto del punto de estado
      let dotColor = '#10b981'; // Verde: disponible
      let statusText = 'Disponible';

      if (isWaitingApproval) {
        dotColor = '#eab308'; // Dorado parpadeante: requiere decisión
        statusText = 'Decisión';
      } else if (status === 'trabajando') {
        dotColor = '#3b82f6'; // Azul: trabajando
        statusText = 'Activo';
      } else if (status === 'bloqueado') {
        dotColor = '#ef4444'; // Rojo: bloqueado
        statusText = 'Pausado';
      }

      // Caja del nombre
      ctx.fillStyle = 'rgba(15, 15, 20, 0.9)';
      ctx.beginPath();
      ctx.roundRect(charX - 44, tagY - 10, 88, 18, 4);
      ctx.fill();
      ctx.strokeStyle = isWaitingApproval ? '#eab308' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = isWaitingApproval ? 1.5 : 1;
      ctx.stroke();

      // Punto de estado (online dot)
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(charX - 35, tagY - 1, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Nombre del agente
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(desk.shortName, charX - 28, tagY + 2);

      // Si está esperando tu decisión, mostrar globo de exclamación dorado
      if (isWaitingApproval) {
        const bounce = Math.sin(Date.now() / 150) * 3;
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(charX + 35, tagY - 10 + bounce, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('!', charX + 35, tagY - 7 + bounce);
      }
    });

    // 9. PERSONAJE DEL JUGADOR (DIRECTOR GENERAL)
    const px = playerPos.x;
    const py = playerPos.y;

    // Sombra en el piso
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(px, py + 16, 14, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Halo dorado del Director
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(px, py, 18, 0, Math.PI * 2);
    ctx.stroke();

    // Piernas animadas al caminar
    const legOffset = isWalking ? Math.sin(walkFrame * 0.4) * 5 : 0;
    ctx.fillStyle = '#1e1b18'; // Pantalones oscuros
    ctx.fillRect(px - 5, py + 8 + legOffset, 4, 7);
    ctx.fillRect(px + 1, py + 8 - legOffset, 4, 7);

    // Cuerpo / Saco de arquitecto
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.roundRect(px - 9, py - 4, 18, 14, 3);
    ctx.fill();

    // Bufanda o solapa dorada
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(px - 2, py - 3, 4, 10);

    // Cabeza
    ctx.fillStyle = '#fcd34d'; // Tono piel
    ctx.beginPath();
    ctx.arc(px, py - 10, 8, 0, Math.PI * 2);
    ctx.fill();

    // Cabello negro peinado
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(px, py - 13, 8, Math.PI, 0);
    ctx.fill();

    // Gafas de arquitecto
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(px - 6, py - 11, 4, 3);
    ctx.strokeRect(px + 2, py - 11, 4, 3);

    // Cartel flotante del Director (Tu personaje)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.beginPath();
    ctx.roundRect(px - 45, py - 38, 90, 18, 4);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(px - 35, py - 29, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('DIRECTOR (TÚ)', px - 28, py - 26);

  }, [playerPos, agentsMap, activeNearbyEntity, isInMeetingRoom, isNearDirectorDesk, needsAttentionCount, isWalking, walkFrame]);

  // Enviar mensaje al agente en lenguaje natural
  const handleSendQuickChat = async () => {
    if (!quickChatMessage.trim() || !interactingAgent) return;
    const msg = quickChatMessage.trim();
    setQuickChatMessage('');
    setIsSendingQuickChat(true);

    try {
      const res = await fetch('/api/editorial/agent/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: interactingAgent.id, message: msg })
      });
      if (res.ok) {
        const data = await res.json();
        setInteractingAgent(prev => {
          if (!prev) return null;
          const updatedMessages = [...(prev.messages || []), data.userMessage, data.agentResponse];
          return { ...prev, messages: updatedMessages };
        });
      }
    } catch (e: any) {
      alert('Error al enviar mensaje: ' + e.message);
    } finally {
      setIsSendingQuickChat(false);
    }
  };

  // Botones de teletransporte rápido a cada departamento
  const handleTeleportTo = (zoneKey: string) => {
    switch (zoneKey) {
      case 'director':
        setPlayerPos({ x: 800, y: 630 });
        break;
      case 'meeting':
        setPlayerPos({ x: 800, y: 220 });
        break;
      case 'cafe':
        setPlayerPos({ x: 800, y: 390 });
        break;
      case 'critica':
        setPlayerPos({ x: 1210, y: 380 });
        break;
      case 'creatividad':
        setPlayerPos({ x: 1210, y: 720 });
        break;
      case 'direccion':
        setPlayerPos({ x: 300, y: 380 });
        break;
      case 'comercial':
        setPlayerPos({ x: 300, y: 720 });
        break;
      case 'tecnologia':
        setPlayerPos({ x: 300, y: 1040 });
        break;
      case 'games':
        setPlayerPos({ x: 800, y: 1020 });
        break;
      default:
        setPlayerPos({ x: 800, y: 630 });
    }
  };

  return (
    <div className={`relative flex flex-col bg-[#0d0e12] select-none ${isFullscreen ? 'fixed inset-0 z-50' : 'h-[85vh]'}`}>
      {/* 1. BARRA SUPERIOR: Controles limpios para no técnicos */}
      <div className="bg-[#15161c] border-b border-white/10 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold">DIRECTOR GENERAL:</span>
            <span>Tú tienes el control total • Camina o haz clic para dar órdenes</span>
          </div>

          {needsAttentionCount > 0 && (
            <button
              onClick={onOpenDirectorModal}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-anton tracking-wider text-xs rounded-lg shadow-lg shadow-red-600/30 animate-bounce transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{needsAttentionCount} DECISIONES ESPERANDO TU OK</span>
            </button>
          )}
        </div>

        {/* Teletransporte rápido con iconos */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <span className="text-zinc-500 font-mono text-[10px] mr-1 hidden xl:inline">MOVERME A:</span>
          {[
            { id: 'director', label: '⭐ Mi Mesa' },
            { id: 'meeting', label: '🎙️ Sala Reunión' },
            { id: 'cafe', label: '☕ Cafetería' },
            { id: 'critica', label: '📐 Crítica Arq.' },
            { id: 'creatividad', label: '📸 Redes Sociales' },
            { id: 'comercial', label: '💰 Fondos & Marcas' },
            { id: 'tecnologia', label: '💻 WebOps' },
            { id: 'games', label: '🎮 Ping-Pong' }
          ].map(tp => (
            <button
              key={tp.id}
              onClick={() => handleTeleportTo(tp.id)}
              className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 rounded-md transition-colors text-[11px] font-mono"
            >
              {tp.label}
            </button>
          ))}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 rounded-md ml-1"
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. LIENZO 2D GATHER.TOWN */}
      <div className="relative flex-1 bg-[#121318] overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={1600}
          height={1200}
          onClick={handleCanvasClick}
          className="w-full h-full object-contain cursor-pointer shadow-2xl"
        />

        {/* Notificación flotante de proximidad para hablar con un agente */}
        {activeNearbyEntity && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950/95 backdrop-blur-md border-2 border-amber-400 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce z-20">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
              <div>
                <span className="font-anton text-sm tracking-wider text-white block">
                  {activeNearbyEntity.name} ({activeNearbyEntity.shortName})
                </span>
                <span className="font-mono text-[11px] text-zinc-400">
                  {activeNearbyEntity.simpleRole}
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                const ag = agentsMap[activeNearbyEntity.id];
                if (ag) {
                  setInteractingAgent(ag);
                  setInteractingEntity(activeNearbyEntity);
                }
              }}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-anton tracking-wider text-xs rounded-lg transition-transform active:scale-95 flex items-center gap-1.5 shadow-md"
            >
              <kbd className="px-1.5 py-0.5 bg-black text-amber-400 rounded text-[10px]">ESPACIO</kbd>
              <span>HABLAR / REVISAR TRABAJO</span>
            </button>
          </div>
        )}

        {/* Notificación flotante al estar en la Mesa del Director */}
        {!activeNearbyEntity && isNearDirectorDesk && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-zinc-950/95 backdrop-blur-md border-2 border-amber-500 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-bounce z-20">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-400" />
              <div>
                <span className="font-anton text-sm tracking-wider text-white block">
                  MESA DEL DIRECTOR GENERAL
                </span>
                <span className="font-mono text-[11px] text-zinc-300">
                  {needsAttentionCount > 0
                    ? `Tienes ${needsAttentionCount} entregables terminados esperando tu visto bueno.`
                    : 'Todos tus agentes están trabajando al día en segundo plano.'}
                </span>
              </div>
            </div>
            <button
              onClick={onOpenDirectorModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-anton tracking-wider text-xs rounded-lg transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <span>VER BANDEJA DE DECISIONES</span>
            </button>
          </div>
        )}

        {/* Notificación flotante en Sala de Conferencias */}
        {!activeNearbyEntity && isInMeetingRoom && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-zinc-950/95 backdrop-blur-md border border-purple-400 px-6 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 z-20">
            <Video className="w-4 h-4 text-purple-400" />
            <span className="font-anton text-xs tracking-wider text-white">
              SALA DE REUNIONES VIRTUALES // CONFERENCIA MULTIAGENTE
            </span>
            <button
              onClick={onOpenMeetingModal}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white font-anton text-xs rounded transition-colors"
            >
              CONVOCAR COMITÉ
            </button>
          </div>
        )}

        {/* Botonera de flechas en pantalla (para táctil o mouse) */}
        <div className="absolute bottom-6 right-6 flex flex-col items-center gap-1 bg-black/70 p-2 rounded-2xl border border-white/10 backdrop-blur-sm z-10">
          <button
            onClick={() => setPlayerPos(p => ({ ...p, y: Math.max(50, p.y - 45) }))}
            className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPlayerPos(p => ({ ...p, x: Math.max(50, p.x - 45) }))}
              className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPlayerPos(p => ({ ...p, y: Math.min(1150, p.y + 45) }))}
              className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPlayerPos(p => ({ ...p, x: Math.min(1550, p.x + 45) }))}
              className="w-9 h-9 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg flex items-center justify-center transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. MODAL DE CONVERSACIÓN Y DECISIÓN HUMANA (Zero Jargon / Todo en Español Claro) */}
      {interactingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#14151b] border-2 border-amber-400/80 rounded-2xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Cabecera del Agente */}
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-4">
                <AgentCharacterAvatar
                  agentId={interactingAgent.id}
                  size={64}
                  status={interactingAgent.status}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-anton text-2xl text-white tracking-wide">{interactingAgent.name}</h3>
                    <span className="px-2 py-0.5 bg-zinc-800 border border-white/10 text-amber-400 font-mono text-[10px] rounded uppercase">
                      {interactingEntity?.deptName || 'DEPARTAMENTO'}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-zinc-300 mt-0.5">
                    {interactingEntity?.simpleRole || interactingAgent.role}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setInteractingAgent(null);
                  setShowFeedbackInput(false);
                }}
                className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* SECCIÓN 1: ¿REQUIERE TU DECISIÓN? (Human-in-the-loop Gatekeeper) */}
            {interactingAgent.status === 'esperando_aprobacion' ? (
              <div className="p-4 bg-amber-500/10 border-2 border-amber-500/60 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-amber-400 font-anton text-base tracking-wide">
                  <Zap className="w-5 h-5 animate-pulse" />
                  <span>REQUIERE TU DECISIÓN PARA PUBLICAR</span>
                </div>
                <p className="text-zinc-200 text-xs leading-relaxed font-mono">
                  {interactingAgent.currentTask || 'Este agente preparó una entrega y se detuvo para que tú decidas si se publica en la web o se ajusta.'}
                </p>

                {/* Botones Grandes de Decisión en 1 Clic */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-500/20">
                  {interactingAgent.id.includes('chief-editor') || interactingAgent.id.includes('critic') || interactingAgent.id.includes('architecture-editor') ? (
                    <button
                      onClick={() => {
                        onApproveArticle('espacio-para-hablar-con-dios-ssqj');
                        setInteractingAgent(null);
                      }}
                      className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-anton tracking-wider text-xs rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>APROBAR Y PUBLICAR ARTÍCULO</span>
                    </button>
                  ) : interactingAgent.id.includes('instagram') ? (
                    <button
                      onClick={() => {
                        onApproveCarousel('ig-pkg-1793831565573');
                        setInteractingAgent(null);
                      }}
                      className="flex-1 py-2.5 px-4 bg-rose-500 hover:bg-rose-400 text-white font-anton tracking-wider text-xs rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-rose-500/20"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>APROBAR CARRUSEL 10 LÁMINAS</span>
                    </button>
                  ) : interactingAgent.id.includes('newsletter') ? (
                    <button
                      onClick={() => {
                        onApproveNewsletter('nl-1793831565603');
                        setInteractingAgent(null);
                      }}
                      className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-anton tracking-wider text-xs rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>APROBAR Y ENVIAR BOLETÍN</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        alert('Entrega aprobada con éxito por Dirección General.');
                        setInteractingAgent(null);
                      }}
                      className="flex-1 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-black font-anton tracking-wider text-xs rounded-lg transition-transform active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>APROBAR ENTREGA</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowFeedbackInput(!showFeedbackInput)}
                    className="py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-white font-anton tracking-wider text-xs rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <Edit3 className="w-4 h-4 text-amber-400" />
                    <span>PEDIR CORRECCIÓN</span>
                  </button>
                </div>

                {/* Campo para pedir corrección */}
                {showFeedbackInput && (
                  <div className="mt-3 p-3 bg-black/60 border border-white/10 rounded-lg space-y-2 animate-fadeIn">
                    <span className="text-[11px] font-mono text-zinc-300 block">
                      ¿Qué cambios quieres que haga el agente en este trabajo?
                    </span>
                    <textarea
                      rows={2}
                      value={customFeedbackNotes}
                      onChange={e => setCustomFeedbackNotes(e.target.value)}
                      placeholder="Ej: Haz el texto más crítico con el hormigón o cambia la lámina 3..."
                      className="w-full bg-zinc-900 border border-white/10 rounded p-2 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setShowFeedbackInput(false)}
                        className="px-3 py-1 text-zinc-400 hover:text-white text-xs font-mono"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => {
                          if (!customFeedbackNotes.trim()) return;
                          alert(`Instrucción enviada a ${interactingAgent.name}: "${customFeedbackNotes}"`);
                          setCustomFeedbackNotes('');
                          setShowFeedbackInput(false);
                        }}
                        className="px-3 py-1 bg-amber-400 text-black font-anton text-xs rounded"
                      >
                        ENVIAR CORRECCIÓN
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ESTADO NORMAL DE TRABAJO */
              <div className="p-3 bg-black/40 border border-white/10 rounded-xl font-mono text-xs space-y-1">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>ESTADO: <b className="text-emerald-400 uppercase">{interactingAgent.status}</b></span>
                  <span className="text-zinc-400">Progreso: <b className="text-white">{interactingAgent.progress ?? 100}%</b></span>
                </div>
                <p className="text-zinc-300">
                  <b>En qué está trabajando:</b> {interactingAgent.currentTask || 'Operación autónoma regular.'}
                </p>
              </div>
            )}

            {/* SECCIÓN 2: HISTORIAL DE DIÁLOGO / MENSAJES CON EL AGENTE */}
            <div className="p-3 bg-black/50 border border-white/10 rounded-xl space-y-2.5 max-h-48 overflow-y-auto font-mono text-xs">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-bold">
                DIÁLOGO DIRECTO CON EL AGENTE
              </span>

              {interactingAgent.messages && interactingAgent.messages.length > 0 ? (
                interactingAgent.messages.map((m: any) => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-lg ${
                      m.sender === 'user'
                        ? 'bg-amber-500/15 text-amber-200 border border-amber-500/30 ml-6'
                        : 'bg-zinc-900 text-zinc-200 border border-white/5 mr-6'
                    }`}
                  >
                    <span className="text-[9px] text-zinc-400 block font-bold mb-1">
                      {m.sender === 'user' ? 'TÚ (DIRECTOR GENERAL)' : interactingAgent.name}
                    </span>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-zinc-400 text-center py-3 italic">
                  "Hola Director, estoy en mi puesto de trabajo. Puedes pedirme cualquier investigación, redacción o cambio en lenguaje normal."
                </p>
              )}
            </div>

            {/* SECCIÓN 3: CAMPO PARA ESCRIBIRLE COMO EN WHATSAPP */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={quickChatMessage}
                onChange={(e) => setQuickChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendQuickChat()}
                placeholder={`Escribe una instrucción o pregunta en español para ${interactingAgent.name}...`}
                className="flex-1 bg-zinc-900 border border-white/15 rounded-xl px-4 py-2.5 font-mono text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <button
                onClick={handleSendQuickChat}
                disabled={isSendingQuickChat || !quickChatMessage.trim()}
                className="p-2.5 bg-amber-400 text-black rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Pie de modal */}
            <div className="pt-2 flex items-center justify-between border-t border-white/10 text-xs font-mono">
              <button
                onClick={() => {
                  onOpenAgentDrawer(interactingAgent);
                  setInteractingAgent(null);
                }}
                className="text-zinc-400 hover:text-white underline"
              >
                Ver expediente completo y herramientas
              </button>
              <button
                onClick={() => setInteractingAgent(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-anton tracking-wider text-xs"
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
