import React, { useState, useRef } from 'react';
import {
  CheckCircle2,
  Heart,
  Plus,
  X,
  Send,
  MessageSquare
} from 'lucide-react';

export interface CommunityNote {
  id: string;
  stream: 'visitas' | 'notas' | 'conversaciones';
  author: string;
  tabLabel: string;
  role: string;
  levelBadge: string;
  levelNum: 1 | 2 | 3;
  date: string;
  city: string;
  statusBadge: string;
  verified: boolean;
  title: string;
  content: string;
  imageUrl?: string;
  figureCaption?: string;
  likes: number;
  hasLiked?: boolean;
}

interface CommunityFolderExplorerProps {
  project: any;
  onNavigateTab?: (tab: 'resena' | 'critica' | 'podcast' | 'obra-viva') => void;
}

export const CommunityFolderExplorer: React.FC<CommunityFolderExplorerProps> = ({
  project,
  onNavigateTab,
}) => {
  // Navigation inside physical folder
  const [activeStream, setActiveStream] = useState<'overview' | 'visitas' | 'notas' | 'conversaciones'>('overview');
  const [selectedEntryIndex, setSelectedEntryIndex] = useState(0);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formStream, setFormStream] = useState<'visitas' | 'notas' | 'conversaciones'>('visitas');
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formStatus, setFormStatus] = useState('CONFORT TÉRMICO Y ACÚSTICO VERIFICADO');
  const [formDate, setFormDate] = useState('16 de Octubre, 2026');

  // Active user profile
  const [userProfile] = useState({
    name: 'Arq. Mateo Carrión',
    tabLabel: 'MATEO C.',
    role: 'Arquitecto Colaborador // PUCE FADA',
    city: 'Quito',
    levelNum: 2 as 1 | 2 | 3,
    levelBadge: 'NIVEL 2 • ARQUITECTO RESIDENTE',
  });

  // Database of notes grouped by streams
  const [notesData, setNotesData] = useState<{
    visitas: CommunityNote[];
    notas: CommunityNote[];
    conversaciones: CommunityNote[];
  }>({
    visitas: [
      {
        id: 'v-1',
        stream: 'visitas',
        author: 'JUAN PÉREZ',
        tabLabel: 'JUAN',
        role: 'Redactor Verificado EA // Cátedra de Proyectos',
        levelBadge: 'REDACTOR VERIFICADO',
        levelNum: 2,
        date: '02 Octubre 2026 • 11:00 hrs',
        city: project.location || 'Quito',
        statusBadge: 'BALANCE LUMÍNICO NATURAL EQUINOCCIAL',
        verified: true,
        title: 'Recorrido sensorial y comportamiento de la luz cenital en el atrio',
        content:
          'El atrio central opera como una cámara bioclimática viva. La luz cenital baña los planos verticales de hormigón sin deslumbrar las zonas habitables. Durante la mañana, las corrientes de aire ascienden de forma natural manteniendo una temperatura estable de 19°C sin climatización activa.',
        imageUrl: project.heroImage,
        figureCaption: 'FIG. 1.01 — VISTA CENITAL DEL ATRIO',
        likes: 24,
      },
      {
        id: 'v-2',
        stream: 'visitas',
        author: 'DRA. ELENA SANTILLÁN',
        tabLabel: 'ELENA S.',
        role: 'Catedrática de Proyectos & Crítica // PUCE',
        levelBadge: 'NIVEL 3 // CRÍTICA',
        levelNum: 3,
        date: '12 Septiembre 2026 • 15:30 hrs',
        city: 'Quito',
        statusBadge: 'CONFORT TÉRMICO & ACÚSTICO VERIFICADO',
        verified: true,
        title: 'El vacío central como regulador térmico real en horas de máxima insolación',
        content:
          'Recorrido realizado con estudiantes de taller. El vacío central disipa eficazmente el calor acumulado en las horas de mayor radiación ultravioleta andina. La pátina del hormigón visto presenta un envejecimiento noble sin eflorescencias ni filtraciones visibles en los encuentros con la carpintería metálica.',
        imageUrl: project.heroImage,
        figureCaption: 'FIG. 1.04 — PATIO COLECTIVO',
        likes: 28,
      },
      {
        id: 'v-3',
        stream: 'visitas',
        author: 'ARQ. SANTIAGO RIVAS',
        tabLabel: 'SANTIAGO',
        role: 'Residente de Obra // UCE',
        levelBadge: 'RESIDENTE OBRA',
        levelNum: 2,
        date: '28 Agosto 2026 • 09:15 hrs',
        city: 'Quito',
        statusBadge: 'INSPECCIÓN DE FACHADA Y VENTILACIÓN CRUZADA',
        verified: true,
        title: 'Comportamiento de la celosía de ladrillo ante vientos cruzados del este',
        content:
          'La permeabilidad de la mampostería permite una renovación constante del aire interior sin generar silbidos acústicos molestos durante las ráfagas vespertinas. Excelente resolución del detalle en el dintel.',
        imageUrl: project.heroImage,
        figureCaption: 'FIG. 1.08 — DETALLE CELOSÍA',
        likes: 19,
      },
      {
        id: 'v-4',
        stream: 'visitas',
        author: 'CAMILA VILLACÍS',
        tabLabel: 'CAMILA',
        role: 'Estudiante Taller Terminal // PUCE',
        levelBadge: 'TALLER PUCE',
        levelNum: 1,
        date: '04 Agosto 2026 • 16:40 hrs',
        city: 'Quito',
        statusBadge: 'EVALUACIÓN DE HABITABILIDAD COTIDIANA',
        verified: false,
        title: 'Apropiación comunitaria de los descansos de escalera y puentes',
        content:
          'Los descansos intermedios no son solo circulaciones; funcionan como terrazas de encuentro vecinal informal. La vegetación colgante de los jardines interiores ha proliferado de forma óptima.',
        imageUrl: project.heroImage,
        figureCaption: 'FIG. 2.01 — PUENTE COLECTIVO',
        likes: 14,
      },
    ],
    notas: [
      {
        id: 'n-1',
        stream: 'notas',
        author: 'ING. CARLA MONTENEGRO',
        tabLabel: 'CARLA M.',
        role: 'Consultora de Estructuras & Patologías',
        levelBadge: 'NIVEL 3 // PATOLOGÍAS',
        levelNum: 3,
        date: '18 Julio 2026 • 10:00 hrs',
        city: 'Quito',
        statusBadge: 'JUNTAS DE DILATACIÓN Y SISMO-RESISTENCIA',
        verified: true,
        title: 'Monitoreo de juntas constructivas tras sismo de magnitud 4.2',
        content:
          'Inspección técnica detallada en las juntas de dilatación entre el núcleo de circulación y las crujías residenciales. No se aprecian fisuras estructurales ni desprendimientos en los morteros de asiento.',
        imageUrl: project.heroImage,
        figureCaption: 'FIG. 3.02 — REGISTRO JUNTA ESTRUCTURAL',
        likes: 31,
      },
      {
        id: 'n-2',
        stream: 'notas',
        author: 'ARQ. DAVID GÓMEZ',
        tabLabel: 'DAVID G.',
        role: 'Fiscalizador Independiente',
        levelBadge: 'NIVEL 2 // FISCALIZADOR',
        levelNum: 2,
        date: '02 Junio 2026 • 14:20 hrs',
        city: 'Quito',
        statusBadge: 'IMPERMEABILIZACIÓN DE CUBIERTAS AJARDINADAS',
        verified: true,
        title: 'Eficiencia del sistema de drenaje en azotea vegetal durante el invierno',
        content:
          'Verificación in situ del manto geotextil y cazoletas de desagüe tras 72 horas de lluvia continua. Evacuación perimetral fluida sin empozamientos ni sobrecargas en las losas alivianadas.',
        imageUrl: project.heroImage,
        figureCaption: 'FIG. 3.05 — DRENAJE AZOTEA',
        likes: 22,
      },
    ],
    conversaciones: [
      {
        id: 'c-1',
        stream: 'conversaciones',
        author: 'MESA REDONDA PUCE // FADA',
        tabLabel: 'MESA PUCE',
        role: 'Debate Crítico Académico',
        levelBadge: 'NIVEL 3 // DEBATE ACADÉMICO',
        levelNum: 3,
        date: '25 Mayo 2026 • 18:00 hrs',
        city: 'Quito',
        statusBadge: 'DIÁLOGO COLECTIVO TRANSMITIDO EN VIVO',
        verified: true,
        title: '¿Vivienda colectiva o manifiesto formal? Análisis de pertinencia urbana',
        content:
          'Participación de proyectistas y docentes invitados. Se debatió intensamente la tensión entre el rigor del hormigón a la vista y el confort percibido por residentes no arquitectos. Conclusión unánime sobre la valentía tipológica.',
        imageUrl: project.heroImage,
        figureCaption: 'FIG. 4.01 — SESIÓN DE DEBATE EN ATRIO',
        likes: 45,
      },
      {
        id: 'c-2',
        stream: 'conversaciones',
        author: 'AL BORDE & RAMA ESTUDIO',
        tabLabel: 'DIÁLOGO',
        role: 'Conversación entre Pares',
        levelBadge: 'NIVEL 3 // PARES EA',
        levelNum: 3,
        date: '10 Abril 2026 • 16:30 hrs',
        city: 'Quito',
        statusBadge: 'CONTRASTE DE PROCESOS DE TALLER',
        verified: true,
        title: 'La economía de medios frente a la estandarización inmobiliaria',
        content:
          'Diálogo grabado in situ explorando cómo la reducción de acabados secundarios permitió destinar mayor presupuesto al espesor de las carpinterías y al sistema pasivo de captación solar.',
        imageUrl: project.heroImage,
        figureCaption: 'FIG. 4.04 — REGISTRO DE CONVERSATORIO',
        likes: 38,
      },
    ],
  });

  // Current stream notes and selected entry
  const currentStreamNotes = activeStream === 'overview' ? [] : notesData[activeStream];
  const activeNote = currentStreamNotes[selectedEntryIndex] || currentStreamNotes[0];

  const handleLike = (noteId: string) => {
    if (activeStream === 'overview') return;
    setNotesData((prev) => ({
      ...prev,
      [activeStream]: prev[activeStream].map((n) =>
        n.id === noteId
          ? {
              ...n,
              likes: n.hasLiked ? n.likes - 1 : n.likes + 1,
              hasLiked: !n.hasLiked,
            }
          : n
      ),
    }));
  };

  const handleAddContribution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const newNote: CommunityNote = {
      id: `custom-${Date.now()}`,
      stream: formStream,
      author: userProfile.name.toUpperCase(),
      tabLabel: userProfile.tabLabel,
      role: userProfile.role,
      levelBadge: userProfile.levelBadge,
      levelNum: userProfile.levelNum,
      date: formDate,
      city: userProfile.city,
      statusBadge: formStatus,
      verified: true,
      title: formTitle,
      content: formContent,
      imageUrl: project.heroImage,
      figureCaption: 'FIG. REGISTRO EN CAMPO // ' + userProfile.name.toUpperCase(),
      likes: 1,
      hasLiked: true,
    };

    setNotesData((prev) => ({
      ...prev,
      [formStream]: [newNote, ...prev[formStream]],
    }));

    setActiveStream(formStream);
    setSelectedEntryIndex(0);
    setIsModalOpen(false);
    setFormTitle('');
    setFormContent('');
  };

  return (
    <div className="w-full flex flex-col items-center justify-center my-4 font-okcok select-none">
      <style>{`
        @font-face {
          font-family: 'OKCOK';
          src: url('/fonts/OKCOK.otf') format('opentype');
        }
        .ea-folder-svg text {
          font-family: 'OKCOK', sans-serif;
        }
        .ea-cls-1, .ea-cls-2 { fill: #dadada; }
        .ea-cls-3 { font-size: 19.27px; fill: #1d1d1b; }
        .ea-cls-4 { font-size: 13.34px; fill: #1d1d1b; }
        .ea-cls-5 { font-size: 14.89px; fill: #1d1d1b; }
        .ea-cls-6 { font-size: 21.49px; fill: #1d1d1b; }
        .ea-cls-7 { font-size: 11.72px; fill: #fff; }
        .ea-cls-8 { font-size: 9.9px; fill: #1d1d1b; }
        .ea-cls-2, .ea-cls-9, .ea-cls-10, .ea-cls-11 {
          stroke: #1d1d1b;
          stroke-miterlimit: 10;
        }
        .ea-cls-12, .ea-cls-9 { fill: none; }
        .ea-cls-9 { stroke-width: 2px; }
        .ea-cls-10 { fill: #fff; }
        .ea-cls-13, .ea-cls-11 { fill: #ededed; }

        /* Detail SVG classes */
        .ea-dt-1 { font-size: 9.57px; fill: #1d1d1b; }
        .ea-dt-2 { font-size: 14.93px; fill: #1d1d1b; }
        .ea-dt-3 { font-size: 19.27px; fill: #1d1d1b; }
        .ea-dt-4 { font-size: 6.16px; fill: #1d1d1b; }
        .ea-dt-6 { font-size: 14.35px; fill: #1d1d1b; }
        .ea-dt-7 { font-size: 9.9px; fill: #1d1d1b; }
        .ea-dt-8 { font-size: 15.42px; fill: #1d1d1b; }
        .ea-dt-9 { font-size: 8.41px; fill: #fff; }
        .ea-dt-10 { font-size: 8.14px; fill: #fff; }
        .ea-dt-11 { font-size: 15.44px; fill: #fff; }
        .ea-dt-12, .ea-dt-13 { fill: #dadada; }
        .ea-dt-13, .ea-dt-14, .ea-dt-15 { stroke: #1d1d1b; stroke-miterlimit: 10; }
        .ea-dt-14 { fill: #fff; }
        .ea-dt-15, .ea-dt-17 { fill: #ededed; }
        .ea-dt-16 { fill: none; }
      `}</style>

      {/* =================================================================== */}
      {/* 1. STATE A: OVERVIEW FOLDER (Matching OP1_Mesa de trabajo 1 copia.svg) */}
      {/* =================================================================== */}
      {activeStream === 'overview' && (
        <div className="w-full transition-all duration-300">
          <svg
            className="ea-folder-svg w-full h-auto drop-shadow-md"
            viewBox="0 0 841.89 595.28"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background folder layers */}
            <g>
              <path className="ea-cls-1" d="M752.02,118.3h-137.11c-3.45,0-6.26-2.8-6.26-6.26v-.04h149.62v.04c0,3.45-2.8,6.26-6.26,6.26Z"/>
              <path className="ea-cls-2" d="M608.66,112.04c0,3.45,2.8,6.26,6.26,6.26h137.11c3.45,0,6.26-2.8,6.26-6.26"/>
              <path className="ea-cls-2" d="M758.28,112.04l-179.74-.04h199.28c6.98,0,12.64,5.66,12.64,12.64v344.43c0,6.98-5.66,12.64-12.64,12.64H80.02c-6.98,0-12.64-5.66-12.64-12.64V124.64c0-6.98,5.66-12.64,12.64-12.64h183.96l164.94.04"/>
              {/* PODCAST TAB */}
              <g
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onNavigateTab?.('podcast')}
              >
                <path className="ea-cls-2" d="M428.92,112v-37.66c0-3.45,2.8-6.26,6.26-6.26h137.11c3.45,0,6.26,2.8,6.26,6.26v37.66"/>
                <text className="ea-cls-3" transform="translate(456.71 101.25)"><tspan x="0" y="0">PODCAST</tspan></text>
              </g>
            </g>

            {/* Middle folder layer: CRITICA */}
            <g>
              <path className="ea-cls-13" d="M752.02,133.87h-137.11c-3.45,0-6.26-2.8-6.26-6.26v-.04h149.62v.04c0,3.45-2.8,6.26-6.26,6.26Z"/>
              <path className="ea-cls-11" d="M608.66,127.61c0,3.45,2.8,6.26,6.26,6.26h137.11c3.45,0,6.26-2.8,6.26-6.26"/>
              <path className="ea-cls-11" d="M758.28,127.61l-344.68-.04h364.21c6.98,0,12.64,5.66,12.64,12.64v344.43c0,6.98-5.66,12.64-12.64,12.64H80.02c-6.98,0-12.64-5.66-12.64-12.64V140.21c0-6.98,5.66-12.64,12.64-12.64h183.96v.04"/>
              <g
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onNavigateTab?.('critica')}
              >
                <path className="ea-cls-11" d="M263.98,127.57v-37.66c0-3.45,2.8-6.26,6.26-6.26h137.11c3.45,0,6.26,2.8,6.26,6.26v37.66"/>
                <text className="ea-cls-3" transform="translate(292.08 113.6)"><tspan x="0" y="0">CRITICA</tspan></text>
              </g>
            </g>

            {/* RESEÑA TAB */}
            <g
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onNavigateTab?.('resena')}
            >
              <path className="ea-cls-12" d="M105.81,151.46h137.11c3.45,0,6.26-2.8,6.26-6.26v-.04H99.55v.04c0,3.45,2.8,6.26,6.26,6.26Z"/>
              <path className="ea-cls-10" d="M249.17,145.2c0,3.45-2.8,6.26-6.26,6.26H105.81c-3.45,0-6.26-2.8-6.26-6.26"/>
              <path className="ea-cls-10" d="M249.17,145.16v-37.66c0-3.45-2.8-6.26-6.26-6.26H105.81c-3.45,0-6.26,2.8-6.26,6.26v37.66"/>
              <text className="ea-cls-3" transform="translate(129.18 131.46)"><tspan x="0" y="0">RESENA</tspan></text>
            </g>

            {/* Front folder body: NOTAS DE LA COMUNIDAD */}
            <g>
              <path className="ea-cls-12" d="M105.81,163.79h137.11c3.45,0,6.26-2.8,6.26-6.26v-.04H99.6s-.04.02-.04.04h0c0,3.45,2.8,6.26,6.26,6.26Z"/>
              <path className="ea-cls-10" d="M601,157.49H249.17v.04"/>
              <line className="ea-cls-10" x1="749.91" y1="157.49" x2="601" y2="157.49"/>
              <path className="ea-cls-10" d="M601,157.53l-501.45-.04h-19.53c-6.98,0-12.64,5.66-12.64,12.64v344.43c0,6.98,5.66,12.64,12.64,12.64h697.79c6.98,0,12.64-5.66,12.64-12.64V170.13c0-6.98-5.66-12.64-12.64-12.64h-27.89"/>
              <path className="ea-cls-10" d="M750.62,157.51v-37.66c0-3.45-2.8-6.26-6.26-6.26h-137.11c-3.45,0-6.26,2.8-6.26,6.26v37.66"/>
              <text className="ea-cls-3" transform="translate(638.26 139.89)"><tspan x="0" y="0">NOTAS</tspan></text>
              <text className="ea-cls-8" transform="translate(628.79 151.25)"><tspan x="0" y="0">DE LA COMUNIDAD</tspan></text>
            </g>

            {/* ============================================================= */}
            {/* SUBFOLDER 1: VISITAS DE OBRA                                  */}
            {/* ============================================================= */}
            <g
              id="folder-stream-visitas"
              className="cursor-pointer transition-transform duration-200 hover:-translate-y-1.5"
              onClick={() => {
                setActiveStream('visitas');
                setSelectedEntryIndex(0);
              }}
            >
              <path d="M267.91,210.76c.91.54.38,3.2.24,4.11-.89,5.71-2.69,13.39-4.15,19.05-.97,3.76-2.58,7.53-3.34,11.4-.18.89-.95,4.97-.36,5.41,6.4-.22,12.85-.24,19.26-.17,9.06.1,18.25.28,27.28.83,6.51.4,13.08,1.34,19.65.81,1.39-.11,7.14-1.77,7.78-.61s-.22,2.83-.27,4.03c-.48,10.9-.08,21.83-.27,32.76-.12,7.24-.95,14.52-.57,21.84.27,5.11,1.59,10.51,1.92,15.55.33,5.07-.26,10.47,0,15.57.13,2.61.8,5.52.84,8.16.1,5.77-.31,12.23-.57,18.02-.42,9.56-1.87,19.67-1.09,29.23.08.96.93,2.71.44,3.42-.43.62-1.6,0-2.2-.01-13.93-.46-27.69-2.53-41.75-3.02-8.45-.29-16.97.65-25.38.84-14.16.32-28.41-.5-42.6-.55-11.91-.04-24.11-.24-36.03-.02-4.45.08-8.8,1.12-13.08,1.39-1.19.07-9.55.11-9.98-.14-.46-.57-.7-1.51-.78-2.22-.81-6.93-.16-12.81-.02-19.61.41-19.97-1.4-40.54.57-60.3.32-3.24.72-5.38.77-8.75.16-10.07-.7-20.42-.82-30.57-.1-8.32-.02-16.67.16-24.98.28-.39.59-.73,1.09-.82,2.55-.46,5.83-.18,8.45-.28,18.82-.73,37.7-.02,56.49.29,1.97.03,3.92.02,5.86-.31l8.47-39.98c1.16-1.23,2.56-.41,3.96-.38,5.61.1,11.84-.62,17.22-.3.41.02,2.69.26,2.81.33ZM266.58,212.64l-21.16-.03c-1.31,11.72-4.85,22.95-7.36,34.4-1.3,5.94-2.53,11.9-3.08,17.96-.03.31-.12.54.2.75.88.57,5.41-.14,6.69-.16,4.41-.08,8.81-.06,13.14.82l.53-.25c1.27-8.41,2.19-17.18,4.36-25.39.92-3.5,2.18-6.8,3.01-10.36,1.38-5.86,2.27-11.88,3.67-17.74ZM332.36,398.51v-15.71c.84-11.1,2.06-23.01,1.65-34.12-.09-2.39-.72-4.98-.84-7.35-.27-5.09.33-10.49,0-15.57s-1.66-10.4-1.92-15.55c-.37-7.32.45-14.59.57-21.84.18-10.85-.01-21.67.25-32.5.02-.73.67-2.27.02-2.74-.15-.11-3.12.38-3.67.45-7.72,1.01-13.7.16-21.32-.29-8.85-.52-17.86-.76-26.73-.83-6.71-.06-13.44.01-20.15.08-.3.08-.59.07-.74.41-.27.61-.87,4-1.02,4.91-.29,1.73-.71,9.78-1.76,10.38-2.3.26-4.61-.62-6.89-.77-3.46-.23-6.98.22-10.39.28-2.13.04-4.27.1-6.36-.32-.76-1.17.07-2.25.2-3.39.16-1.53.12-3.37.33-4.85.3-2.1,1.24-4.04,1.33-6.17l-69.48.26c-.32,15.99.08,31.96.43,47.92.13,5.89.03,9.47-.52,15.32-1.9,20.2-.03,40.79-.56,61.12-.15,5.69-.62,9.08-.02,15,.14,1.39-.28,2.88.32,4.19,2.81-.06,5.76.22,8.56.04,4.37-.29,8.84-1.3,13.37-1.37,20.77-.35,41.72-.08,62.51.29,18.12.32,36.2-.84,54.33-.01,5.91.27,11.83,1.37,17.73,1.92,3.58.33,7.24.26,10.78.82Z"/>
              <text className="ea-cls-6" transform="translate(203.92 325.47)"><tspan x="0" y="0">VISITAS</tspan></text>
              <text className="ea-cls-6" transform="translate(196.52 347.32)"><tspan x="0" y="0">DE OBRA</tspan></text>
              <rect x="208.66" y="361.78" width="70.61" height="17.08" rx="1.98" ry="1.98" fill="#1d1d1b"/>
              <text className="ea-cls-7" transform="translate(214.53 374.24)"><tspan x="0" y="0">{notesData.visitas.length} VISITAS</tspan></text>
            </g>

            {/* ============================================================= */}
            {/* SUBFOLDER 2: NOTAS DE OBRA                                    */}
            {/* ============================================================= */}
            <g
              id="folder-stream-notas"
              className="cursor-pointer transition-transform duration-200 hover:-translate-y-1.5"
              onClick={() => {
                setActiveStream('notas');
                setSelectedEntryIndex(0);
              }}
            >
              <path d="M466.51,210.76c.91.54.38,3.2.24,4.11-.89,5.71-2.69,13.39-4.15,19.05-.97,3.76-2.58,7.53-3.34,11.4-.18.89-.95,4.97-.36,5.41,6.4-.22,12.85-.24,19.26-.17,9.06.1,18.25.28,27.28.83,6.51.4,13.08,1.34,19.65.81,1.39-.11,7.14-1.77,7.78-.61s-.22,2.83-.27,4.03c-.48,10.9-.08,21.83-.27,32.76-.12,7.24-.95,14.52-.57,21.84.27,5.11,1.59,10.51,1.92,15.55.33,5.07-.26,10.47,0,15.57.13,2.61.8,5.52.84,8.16.1,5.77-.31,12.23-.57,18.02-.42,9.56-1.87,19.67-1.09,29.23.08.96.93,2.71.44,3.42-.43.62-1.6,0-2.2-.01-13.93-.46-27.69-2.53-41.75-3.02-8.45-.29-16.97.65-25.38.84-14.16.32-28.41-.5-42.6-.55-11.91-.04-24.11-.24-36.03-.02-4.45.08-8.8,1.12-13.08,1.39-1.19.07-9.55.11-9.98-.14-.46-.57-.7-1.51-.78-2.22-.81-6.93-.16-12.81-.02-19.61.41-19.97-1.4-40.54.57-60.3.32-3.24.72-5.38.77-8.75.16-10.07-.7-20.42-.82-30.57-.1-8.32-.02-16.67.16-24.98.28-.39.59-.73,1.09-.82,2.55-.46,5.83-.18,8.45-.28,18.82-.73,37.7-.02,56.49.29,1.97.03,3.92.02,5.86-.31l8.47-39.98c1.16-1.23,2.56-.41,3.96-.38,5.61.1,11.84-.62,17.22-.3.41.02,2.69.26,2.81.33ZM465.18,212.64l-21.16-.03c-1.31,11.72-4.85,22.95-7.36,34.4-1.3,5.94-2.53,11.9-3.08,17.96-.03.31-.12.54.2.75.88.57,5.41-.14,6.69-.16,4.41-.08,8.81-.06,13.14.82l.53-.25c1.27-8.41,2.19-17.18,4.36-25.39.92-3.5,2.18-6.8,3.01-10.36,1.38-5.86,2.27-11.88,3.67-17.74ZM530.97,398.51v-15.71c.84-11.1,2.06-23.01,1.65-34.12-.09-2.39-.72-4.98-.84-7.35-.27-5.09.33-10.49,0-15.57-.32-5.06-1.66-10.4-1.92-15.55-.37-7.32.45-14.59.57-21.84.18-10.85-.01-21.67.25-32.5.02-.73.67-2.27.02-2.74-.15-.11-3.12.38-3.67.45-7.72,1.01-13.7.16-21.32-.29-8.85-.52-17.86-.76-26.73-.83-6.71-.06-13.44.01-20.15.08-.3.08-.59.07-.74.41-.27.61-.87,4-1.02,4.91-.29,1.73-.71,9.78-1.76,10.38-2.3.26-4.61-.62-6.89-.77-3.46-.23-6.98.22-10.39.28-2.13.04-4.27.1-6.36-.32-.76-1.17.07-2.25.2-3.39.16-1.53.12-3.37.33-4.85.3-2.1,1.24-4.04,1.33-6.17l-69.48.26c-.32,15.99.08,31.96.43,47.92.13,5.89.03,9.47-.52,15.32-1.9,20.2-.03,40.79-.56,61.12-.15,5.69-.62,9.08-.02,15,.14,1.39-.28,2.88.32,4.19,2.81-.06,5.76.22,8.56.04,4.37-.29,8.84-1.3,13.37-1.37,20.77-.35,41.72-.08,62.51.29,18.12.32,36.2-.84,54.33-.01,5.91.27,11.83,1.37,17.73,1.92,3.58.33,7.24.26,10.78.82Z"/>
              <text className="ea-cls-6" transform="translate(404.17 325.47)"><tspan x="0" y="0">NOTAS</tspan></text>
              <text className="ea-cls-6" transform="translate(396.77 347.32)"><tspan x="0" y="0">DE OBRA</tspan></text>
              <rect x="414.06" y="361.78" width="70.61" height="17.08" rx="1.98" ry="1.98" fill="#1d1d1b"/>
              <text className="ea-cls-7" transform="translate(419.92 374.24)"><tspan x="0" y="0">{notesData.notas.length} VISITAS</tspan></text>
            </g>

            {/* ============================================================= */}
            {/* SUBFOLDER 3: CONVERSACIONES CRITICAS                          */}
            {/* ============================================================= */}
            <g
              id="folder-stream-conversaciones"
              className="cursor-pointer transition-transform duration-200 hover:-translate-y-1.5"
              onClick={() => {
                setActiveStream('conversaciones');
                setSelectedEntryIndex(0);
              }}
            >
              <path d="M662.66,210.76c.91.54.38,3.2.24,4.11-.89,5.71-2.69,13.39-4.15,19.05-.97,3.76-2.58,7.53-3.34,11.4-.18.89-.95,4.97-.36,5.41,6.4-.22,12.85-.24,19.26-.17,9.06.1,18.25.28,27.28.83,6.51.4,13.08,1.34,19.65.81,1.39-.11,7.14-1.77,7.78-.61s-.22,2.83-.27,4.03c-.48,10.9-.08,21.83-.27,32.76-.12,7.24-.95,14.52-.57,21.84.27,5.11,1.59,10.51,1.92,15.55s-.26,10.47,0,15.57c.13,2.61.8,5.52.84,8.16.1,5.77-.31,12.23-.57,18.02-.42,9.56-1.87,19.67-1.09,29.23.08.96.93,2.71.44,3.42-.43.62-1.6,0-2.2-.01-13.93-.46-27.69-2.53-41.75-3.02-8.45-.29-16.97.65-25.38.84-14.16.32-28.41-.5-42.6-.55-11.91-.04-24.11-.24-36.03-.02-4.45.08-8.8,1.12-13.08,1.39-1.19.07-9.55.11-9.98-.14-.46-.57-.7-1.51-.78-2.22-.81-6.93-.16-12.81-.02-19.61.41-19.97-1.4-40.54.57-60.3.32-3.24.72-5.38.77-8.75.16-10.07-.7-20.42-.82-30.57-.1-8.32-.02-16.67.16-24.98.28-.39.59-.73,1.09-.82,2.55-.46,5.83-.18,8.45-.28,18.82-.73,37.7-.02,56.49.29,1.97.03,3.92.02,5.86-.31l8.47-39.98c1.16-1.23,2.56-.41,3.96-.38,5.61.1,11.84-.62,17.22-.3.41.02,2.69.26,2.81.33ZM661.33,212.64l-21.16-.03c-1.31,11.72-4.85,22.95-7.36,34.4-1.3,5.94-2.53,11.9-3.08,17.96-.03.31-.12.54.2.75.88.57,5.41-.14,6.69-.16,4.41-.08,8.81-.06,13.14.82l.53-.25c1.27-8.41,2.19-17.18,4.36-25.39.92-3.5,2.18-6.8,3.01-10.36,1.38-5.86,2.27-11.88,3.67-17.74ZM727.11,398.51v-15.71c.84-11.1,2.06-23.01,1.65-34.12-.09-2.39-.72-4.98-.84-7.35-.27-5.09.33-10.49,0-15.57-.32-5.06-1.66-10.4-1.92-15.55-.37-7.32.45-14.59.57-21.84.18-10.85-.01-21.67.25-32.5.02-.73.67-2.27.02-2.74-.15-.11-3.12.38-3.67.45-7.72,1.01-13.7.16-21.32-.29-8.85-.52-17.86-.76-26.73-.83-6.71-.06-13.44.01-20.15.08-.3.08-.59.07-.74.41-.27.61-.87,4-1.02,4.91-.29,1.73-.71,9.78-1.76,10.38-2.3.26-4.61-.62-6.89-.77-3.46-.23-6.98.22-10.39.28-2.13.04-4.27.1-6.36-.32-.76-1.17.07-2.25.2-3.39.16-1.53.12-3.37.33-4.85.3-2.1,1.24-4.04,1.33-6.17l-69.48.26c-.32,15.99.08,31.96.43,47.92.13,5.89.03,9.47-.52,15.32-1.9,20.2-.03,40.79-.56,61.12-.15,5.69-.62,9.08-.02,15,.14,1.39-.28,2.88.32,4.19,2.81-.06,5.76.22,8.56.04,4.37-.29,8.84-1.3,13.37-1.37,20.77-.35,41.72-.08,62.51.29,18.12.32,36.2-.84,54.33-.01,5.91.27,11.83,1.37,17.73,1.92,3.58.33,7.24.26,10.78.82Z"/>
              <text className="ea-cls-4" transform="translate(581.33 320.23)"><tspan x="0" y="0">CONVERSACIONES</tspan></text>
              <text className="ea-cls-6" transform="translate(587.78 340.54)"><tspan x="0" y="0">CRITICAS</tspan></text>
              <rect x="614.68" y="361.78" width="70.61" height="17.08" rx="1.98" ry="1.98" fill="#1d1d1b"/>
              <text className="ea-cls-7" transform="translate(620.54 374.24)"><tspan x="0" y="0">{notesData.conversaciones.length} VISITAS</tspan></text>
            </g>

            {/* ============================================================= */}
            {/* BUTTON: CONTRIBUIR AL ESPACIO                                 */}
            {/* ============================================================= */}
            <g
              id="btn-contribuir-espacio"
              className="cursor-pointer transition-transform duration-150 hover:scale-[1.02]"
              onClick={() => {
                setFormStream('visitas');
                setIsModalOpen(true);
              }}
            >
              <path className="ea-cls-9" d="M557.78,441.96c-2.52,11.86,8.23,23.27,7.82,35.09l-231.66-.94-3.9-33.22c5.4.04,10.85-.07,16.26,0,61.22.85,122.11,1.18,183.5,0,9.22-.18,18.78-.64,27.99-.93Z"/>
              <text className="ea-cls-5" transform="translate(344.15 465.76)"><tspan x="0" y="0">CONTRIBUIR AL ESPACIO</tspan></text>
            </g>
          </svg>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. STATE B: DETAILED DOSSIER (Matching OP1_Mesa de trabajo 1 copia 2.svg) */}
      {/* =================================================================== */}
      {activeStream !== 'overview' && activeNote && (
        <div className="w-full transition-all duration-300">
          <svg
            className="ea-folder-svg w-full h-auto drop-shadow-md"
            viewBox="0 0 841.89 595.28"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background folder layers */}
            <g>
              <path className="ea-dt-12" d="M752.02,123.67h-137.11c-3.45,0-6.26-2.8-6.26-6.26v-.04h149.62v.04c0,3.45-2.8,6.26-6.26,6.26Z"/>
              <path className="ea-dt-13" d="M608.66,117.42c0,3.45,2.8,6.26,6.26,6.26h137.11c3.45,0,6.26-2.8,6.26-6.26"/>
              <path className="ea-dt-13" d="M758.28,117.42l-179.74-.04h199.28c6.98,0,12.64,5.66,12.64,12.64v344.43c0,6.98-5.66,12.64-12.64,12.64H80.02c-6.98,0-12.64-5.66-12.64-12.64V130.01c0-6.98,5.66-12.64,12.64-12.64h183.96l164.94.04"/>
              {/* PODCAST TAB */}
              <g
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onNavigateTab?.('podcast')}
              >
                <path className="ea-dt-13" d="M428.92,117.37v-37.66c0-3.45,2.8-6.26,6.26-6.26h137.11c3.45,0,6.26,2.8,6.26,6.26v37.66"/>
                <text className="ea-dt-3" transform="translate(456.71 106.62)"><tspan x="0" y="0">PODCAST</tspan></text>
              </g>
            </g>

            {/* Middle folder layer: CRITICA */}
            <g>
              <path className="ea-dt-17" d="M752.02,139.24h-137.11c-3.45,0-6.26-2.8-6.26-6.26v-.04h149.62v.04c0,3.45-2.8,6.26-6.26,6.26Z"/>
              <path className="ea-dt-15" d="M608.66,132.99c0,3.45,2.8,6.26,6.26,6.26h137.11c3.45,0,6.26-2.8,6.26-6.26"/>
              <path className="ea-dt-15" d="M758.28,132.99l-344.68-.04h364.21c6.98,0,12.64,5.66,12.64,12.64v344.43c0,6.98-5.66,12.64-12.64,12.64H80.02c-6.98,0-12.64-5.66-12.64-12.64V145.58c0-6.98,5.66-12.64,12.64-12.64h183.96v.04"/>
              <g
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onNavigateTab?.('critica')}
              >
                <path className="ea-dt-15" d="M263.98,132.94v-37.66c0-3.45,2.8-6.26,6.26-6.26h137.11c3.45,0,6.26,2.8,6.26,6.26v37.66"/>
                <text className="ea-dt-3" transform="translate(292.08 118.97)"><tspan x="0" y="0">CRITICA</tspan></text>
              </g>
            </g>

            {/* RESEÑA TAB */}
            <g
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onNavigateTab?.('resena')}
            >
              <path className="ea-dt-16" d="M105.81,156.84h137.11c3.45,0,6.26-2.8,6.26-6.26v-.04H99.55v.04c0,3.45,2.8,6.26,6.26,6.26Z"/>
              <path className="ea-dt-14" d="M249.17,150.58c0,3.45-2.8,6.26-6.26,6.26H105.81c-3.45,0-6.26-2.8-6.26-6.26"/>
              <path className="ea-dt-14" d="M249.17,150.54v-37.66c0-3.45-2.8-6.26-6.26-6.26H105.81c-3.45,0-6.26,2.8-6.26,6.26v37.66"/>
              <text className="ea-dt-3" transform="translate(129.18 136.83)"><tspan x="0" y="0">RESENA</tspan></text>
            </g>

            {/* Front folder body: NOTAS DE LA COMUNIDAD */}
            <g>
              <path className="ea-dt-16" d="M105.81,171.2h137.11c3.45,0,6.26-2.8,6.26-6.26v-.04H99.6s-.04.02-.04.04h0c0,3.45,2.8,6.26,6.26,6.26Z"/>
              <path className="ea-dt-14" d="M601,164.9H249.17v.04"/>
              <line className="ea-dt-14" x1="749.91" y1="164.9" x2="601" y2="164.9"/>
              <path className="ea-dt-14" d="M601,164.95l-501.45-.04h-19.53c-6.98,0-12.64,5.66-12.64,12.64v344.43c0,6.98,5.66,12.64,12.64,12.64h697.79c6.98,0,12.64-5.66,12.64-12.64V177.54c0-6.98-5.66-12.64-12.64-12.64h-27.89"/>
              <path className="ea-dt-14" d="M750.62,164.92v-37.66c0-3.45-2.8-6.26-6.26-6.26h-137.11c-3.45,0-6.26,2.8-6.26,6.26v37.66"/>
              <text className="ea-dt-3" transform="translate(638.26 145.27)"><tspan x="0" y="0">NOTAS</tspan></text>
              <text className="ea-dt-7" transform="translate(628.79 156.63)"><tspan x="0" y="0">DE LA COMUNIDAD</tspan></text>
            </g>

            {/* ============================================================= */}
            {/* LEFT COLUMN: 2 INACTIVE PINNED SUBFOLDERS                     */}
            {/* ============================================================= */}
            {/* Card 1 */}
            {(() => {
              const otherStreams = (['visitas', 'notas', 'conversaciones'] as const).filter(
                (s) => s !== activeStream
              );
              const stream1 = otherStreams[0];
              const title1 =
                stream1 === 'visitas'
                  ? 'VISITAS'
                  : stream1 === 'notas'
                  ? 'NOTAS'
                  : 'CONVERSACIONES';
              const subtitle1 =
                stream1 === 'visitas'
                  ? 'DE OBRA'
                  : stream1 === 'notas'
                  ? 'DE OBRA'
                  : 'CRITICAS';
              const count1 = notesData[stream1].length;

              return (
                <g
                  className="cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                  onClick={() => {
                    setActiveStream(stream1);
                    setSelectedEntryIndex(0);
                  }}
                >
                  <path d="M172.76,186.03c.63.37.26,2.23.16,2.85-.62,3.97-1.87,9.3-2.88,13.24-.67,2.61-1.79,5.23-2.32,7.92-.12.62-.66,3.45-.25,3.76,4.45-.15,8.93-.17,13.38-.12,6.3.07,12.68.2,18.95.58,4.52.28,9.09.93,13.65.56.96-.08,4.96-1.23,5.41-.42s-.15,1.97-.19,2.8c-.33,7.57-.06,15.17-.18,22.76-.08,5.03-.66,10.09-.39,15.17.19,3.55,1.1,7.3,1.33,10.8s-.18,7.27,0,10.81c.09,1.81.56,3.84.59,5.67.07,4.01-.22,8.5-.4,12.52-.29,6.64-1.3,13.66-.76,20.3.05.67.64,1.88.3,2.37-.3.43-1.11,0-1.53-.01-9.68-.32-19.24-1.76-29-2.09-5.87-.2-11.79.45-17.63.59-9.84.22-19.74-.35-29.6-.38-8.28-.03-16.75-.17-25.03-.02-3.09.06-6.11.78-9.09.96-.82.05-6.63.08-6.93-.1-.32-.4-.49-1.05-.54-1.54-.56-4.82-.11-8.9-.01-13.62.29-13.87-.98-28.16.39-41.89.22-2.25.5-3.74.54-6.08.11-6.99-.48-14.19-.57-21.24-.07-5.78-.01-11.58.11-17.35.19-.27.41-.51.76-.57,1.77-.32,4.05-.12,5.87-.2,13.07-.51,26.19-.01,39.24.2,1.37.02,2.72.01,4.07-.22l5.88-27.77c.8-.85,1.78-.28,2.75-.27,3.89.07,8.23-.43,11.96-.21.28.02,1.87.18,1.95.23ZM171.84,187.34l-14.7-.02c-.91,8.14-3.37,15.94-5.11,23.9-.9,4.13-1.76,8.26-2.14,12.48-.02.21-.09.37.14.52.61.4,3.76-.09,4.65-.11,3.06-.06,6.12-.04,9.13.57l.37-.18c.88-5.84,1.52-11.93,3.03-17.64.64-2.43,1.51-4.72,2.09-7.2.96-4.07,1.57-8.25,2.55-12.32ZM217.54,316.45v-10.91c.59-7.71,1.43-15.99,1.15-23.7-.06-1.66-.5-3.46-.59-5.1-.19-3.54.23-7.29,0-10.81s-1.15-7.23-1.33-10.8c-.26-5.08.31-10.14.39-15.17.13-7.54,0-15.06.17-22.58.01-.51.47-1.58.01-1.9-.1-.07-2.17.26-2.55.31-5.36.7-9.51.11-14.81-.2-6.15-.36-12.4-.53-18.57-.58-4.66-.04-9.34,0-14,.06-.21.06-.41.05-.51.28-.19.42-.61,2.78-.71,3.41-.2,1.2-.49,6.79-1.23,7.21-1.6.18-3.2-.43-4.79-.53-2.4-.16-4.85.15-7.21.19-1.48.03-2.97.07-4.42-.22-.53-.81.05-1.56.14-2.36.11-1.06.08-2.34.23-3.37.21-1.46.86-2.81.93-4.29l-48.27.18c-.22,11.11.06,22.2.3,33.29.09,4.09.02,6.58-.36,10.64-1.32,14.03-.02,28.34-.39,42.46-.1,3.95-.43,6.31-.01,10.42.1.96-.2,2,.22,2.91,1.95-.04,4,.16,5.94.02,3.04-.2,6.14-.9,9.29-.95,14.43-.24,28.98-.05,43.43.2,12.59.22,25.15-.58,37.74,0,4.11.19,8.22.95,12.32,1.33,2.49.23,5.03.18,7.49.57Z"/>
                  <text className="ea-dt-2" transform="translate(129.46 265.72)"><tspan x="0" y="0">{title1}</tspan></text>
                  <text className="ea-dt-2" transform="translate(124.32 280.89)"><tspan x="0" y="0">{subtitle1}</tspan></text>
                  <rect x="136.33" y="290.94" width="49.05" height="11.87" rx="1.98" ry="1.98" fill="#1d1d1b"/>
                  <text className="ea-dt-10" transform="translate(140.4 299.6)"><tspan x="0" y="0">{count1} VISITAS</tspan></text>
                </g>
              );
            })()}

            {/* Card 2 */}
            {(() => {
              const otherStreams = (['visitas', 'notas', 'conversaciones'] as const).filter(
                (s) => s !== activeStream
              );
              const stream2 = otherStreams[1];
              const title2 =
                stream2 === 'visitas'
                  ? 'VISITAS'
                  : stream2 === 'notas'
                  ? 'NOTAS'
                  : 'CONVERSACIONES';
              const subtitle2 =
                stream2 === 'visitas'
                  ? 'DE OBRA'
                  : stream2 === 'notas'
                  ? 'DE OBRA'
                  : 'CRITICAS';
              const count2 = notesData[stream2].length;

              return (
                <g
                  className="cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                  onClick={() => {
                    setActiveStream(stream2);
                    setSelectedEntryIndex(0);
                  }}
                >
                  <path d="M173.19,326.48c.65.39.27,2.3.17,2.95-.64,4.1-1.93,9.61-2.98,13.67-.7,2.7-1.85,5.41-2.4,8.18-.13.64-.68,3.57-.26,3.88,4.59-.16,9.22-.17,13.82-.12,6.5.07,13.1.2,19.57.6,4.67.29,9.39.96,14.1.58,1-.08,5.12-1.27,5.58-.44s-.15,2.03-.19,2.89c-.34,7.82-.06,15.67-.19,23.51-.09,5.19-.68,10.42-.41,15.67.19,3.67,1.14,7.54,1.38,11.16s-.18,7.51,0,11.17c.09,1.87.57,3.96.6,5.86.07,4.14-.23,8.78-.41,12.93-.3,6.86-1.34,14.11-.78,20.97.06.69.67,1.95.31,2.45-.31.44-1.15,0-1.58-.01-10-.33-19.87-1.81-29.95-2.16-6.06-.21-12.17.47-18.21.6-10.16.23-20.38-.36-30.57-.39-8.55-.03-17.3-.17-25.85-.02-3.19.06-6.31.8-9.38,1-.85.05-6.85.08-7.16-.1-.33-.41-.5-1.08-.56-1.59-.58-4.97-.11-9.19-.01-14.07.3-14.33-1.01-29.08.41-43.27.23-2.32.52-3.86.56-6.28.12-7.22-.5-14.65-.59-21.93-.07-5.97-.01-11.96.11-17.92.2-.28.42-.52.78-.59,1.83-.33,4.18-.13,6.06-.2,13.5-.52,27.05-.01,40.53.21,1.41.02,2.81.01,4.2-.22l6.08-28.68c.83-.88,1.84-.29,2.84-.27,4.02.07,8.5-.44,12.36-.21.29.02,1.93.19,2.02.24ZM172.24,327.83l-15.18-.02c-.94,8.41-3.48,16.47-5.28,24.68-.93,4.26-1.82,8.54-2.21,12.89-.02.22-.09.39.15.54.63.41,3.88-.1,4.8-.11,3.16-.06,6.32-.04,9.43.59l.38-.18c.91-6.03,1.57-12.32,3.13-18.22.66-2.51,1.56-4.88,2.16-7.43.99-4.2,1.63-8.53,2.63-12.73ZM219.44,461.18v-11.27c.61-7.97,1.47-16.51,1.19-24.48-.06-1.71-.52-3.57-.61-5.27-.19-3.65.24-7.53,0-11.17s-1.19-7.46-1.38-11.16c-.26-5.25.32-10.47.41-15.67.13-7.78,0-15.55.18-23.32.01-.53.48-1.63.01-1.96-.11-.08-2.24.27-2.63.32-5.54.72-9.83.11-15.29-.21-6.35-.38-12.81-.54-19.18-.6-4.82-.04-9.64,0-14.46.06-.22.06-.42.05-.53.29-.19.44-.63,2.87-.74,3.53-.21,1.24-.51,7.01-1.27,7.45-1.65.18-3.31-.44-4.95-.55-2.48-.16-5.01.16-7.45.2-1.53.03-3.07.07-4.56-.23-.54-.84.05-1.61.14-2.43.12-1.1.08-2.42.24-3.48.22-1.51.89-2.9.96-4.43l-49.85.18c-.23,11.48.06,22.93.31,34.38.09,4.23.02,6.79-.37,10.99-1.36,14.49-.02,29.27-.41,43.85-.11,4.08-.44,6.52-.01,10.76.1.99-.2,2.06.23,3,2.02-.05,4.13.16,6.14.03,3.14-.21,6.34-.93,9.59-.99,14.9-.25,29.93-.05,44.85.21,13,.23,25.97-.6,38.98-.01,4.24.19,8.49.98,12.72,1.38,2.57.24,5.19.19,7.73.59Z"/>
                  <text className="ea-dt-1" transform="translate(114.84 405.02)"><tspan x="0" y="0">{title2}</tspan></text>
                  <text className="ea-dt-8" transform="translate(119.47 419.59)"><tspan x="0" y="0">{subtitle2}</tspan></text>
                  <rect x="138.77" y="434.83" width="50.66" height="12.26" rx="1.98" ry="1.98" fill="#1d1d1b"/>
                  <text className="ea-dt-9" transform="translate(142.97 443.77)"><tspan x="0" y="0">{count2} VISITAS</tspan></text>
                </g>
              );
            })()}

            {/* ============================================================= */}
            {/* CENTER SHEET OUTLINE WITH TOP-LEFT TAPE                       */}
            {/* ============================================================= */}
            <g>
              {/* Tape strip */}
              <path className="ea-dt-16" d="M295.81,225.07c.65.42,4.01-.1,4.96-.12,3.27-.06,6.53-.04,9.74.61l.39-.19c.94-6.23,1.62-12.73,3.23-18.82.68-2.59,1.61-5.04,2.23-7.68,1.02-4.34,1.68-8.8,2.72-13.14l-15.68-.02c-.97,8.68-3.59,17.01-5.45,25.49-.96,4.4-1.88,8.82-2.28,13.31-.02.23-.09.4.15.55Z"/>
              {/* Main white sheet background and border */}
              <path fill="#ffffff" stroke="#1d1d1b" strokeWidth="1.5" d="M774.68,225.84c-6.68.18-13.52-.06-20.14-.3-9.92-.36-20.17-.73-30.22.33-14.03-.15-28.91.38-46.72,1.66,0-3.31.04-6.63.18-9.93.04-.89.66-2.16.2-2.99-.48-.86-4.74.37-5.77.45-4.87.39-105.95-.31-110.77-.6-6.69-.41-226.03-.55-232.74-.62-4.54-.05-9.11-.04-13.64.11-.21,0-.42.01-.63.02-.44-.32.13-3.35.26-4.01.57-2.86,1.76-5.66,2.48-8.45,1.08-4.19,2.42-9.88,3.07-14.12.1-.67.5-2.64-.18-3.04-.09-.05-1.78-.23-2.08-.24-3.98-.24-8.61.29-12.76.22-1.03-.02-2.08-.62-2.93.28l-6.28,29.62c-1.43.24-2.88.25-4.34.23-13.92-.23-27.91-.76-41.86-.21-1.94.08-4.38-.13-6.26.21-.37.07-.6.32-.81.61-.13,6.16-.19,12.35-.12,18.51.09,7.52.73,15.19.61,22.65-.04,2.5-.33,4.09-.57,6.49-1.46,14.65-.11,228.21-.42,243.01-.1,5.04-.59,9.39.01,14.53.06.53.24,1.22.58,1.64.32.19,6.52.16,7.39.11,3.17-.2,6.39-.97,9.69-1.03,8.83-.16,17.87-.01,26.7.02,10.52.04,21.07.64,31.57.41,6.24-.14,12.54-.84,18.81-.62,10.42.36,329.35,1.89,339.67,2.23.45.01,1.31.47,1.63.01.36-.52-.27-1.82-.32-2.53-.58-7.08.5-59.58.81-66.66.19-4.29.49-162.39.42-166.67-.03-1.96-.53-4.12-.62-6.05-.1-2.14-.01-4.35.05-6.55h.09c24.69-2.84,49.81-3.33,71.15-3.44,3.98.75,8.05.67,11.98.6,1.52-.03,3.09-.06,4.62-.04.52,0,1.03.11,1.58.23,1.48.31,3.5.73,5.42-1.46l.3-.34,2.34-44.3-1.42.04Z"/>
            </g>

            {/* TOP BLACK TAB ON SHEET */}
            <g>
              <path d="M517.06,186.81h141c4.79,0,8.68,3.89,8.68,8.68v19.73h-158.37v-19.73c0-4.79,3.89-8.68,8.68-8.68Z" fill="#1d1d1b"/>
              <text className="ea-dt-11" transform="translate(524 207.55)">
                <tspan x="0" y="0">
                  {activeStream === 'visitas'
                    ? 'VISITAS DE OBRA'
                    : activeStream === 'notas'
                    ? 'NOTAS DE OBRA'
                    : 'CONVERSACIONES CRÍTICAS'}
                </tspan>
              </text>
            </g>

            {/* ============================================================= */}
            {/* RIGHT COLUMN: 5 ATTACHED VERTICAL INDEX TABS                  */}
            {/* ============================================================= */}
            {/* Tab 1 */}
            <g
              className="cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => setSelectedEntryIndex(0)}
            >
              <path
                d="M774.68,225.84c-6.68.18-13.52-.06-20.14-.3-9.92-.36-20.17-.73-30.22.33-14.03-.15-28.91.38-46.72,1.66,0-3.31.04-6.63.18-9.93.04-.89.66-2.16.2-2.99-.48-.86-4.74.37-5.77.45-4.87.39-105.95-.31-110.77-.6-6.69-.41-226.03-.55-232.74-.62-4.54-.05-9.11-.04-13.64.11-.21,0-.42.01-.63.02-.44-.32.13-3.35.26-4.01.57-2.86,1.76-5.66,2.48-8.45,1.08-4.19,2.42-9.88,3.07-14.12.1-.67.5-2.64-.18-3.04-.09-.05-1.78-.23-2.08-.24-3.98-.24-8.61.29-12.76.22-1.03-.02-2.08-.62-2.93.28l-6.28,29.62c-1.43.24-2.88.25-4.34.23-13.92-.23-27.91-.76-41.86-.21-1.94.08-4.38-.13-6.26.21-.37.07-.6.32-.81.61-.13,6.16-.19,12.35-.12,18.51.09,7.52.73,15.19.61,22.65-.04,2.5-.33,4.09-.57,6.49-1.46,14.65-.11,228.21-.42,243.01-.1,5.04-.59,9.39.01,14.53.06.53.24,1.22.58,1.64.32.19,6.52.16,7.39.11,3.17-.2,6.39-.97,9.69-1.03,8.83-.16,17.87-.01,26.7.02,10.52.04,21.07.64,31.57.41,6.24-.14,12.54-.84,18.81-.62,10.42.36,329.35,1.89,339.67,2.23.45.01,1.31.47,1.63.01.36-.52-.27-1.82-.32-2.53-.58-7.08.5-59.58.81-66.66.19-4.29.49-162.39.42-166.67-.03-1.96-.53-4.12-.62-6.05-.1-2.14-.01-4.35.05-6.55h.09c24.69-2.84,49.81-3.33,71.15-3.44,3.98.75,8.05.67,11.98.6,1.52-.03,3.09-.06,4.62-.04.52,0,1.03.11,1.58.23,1.48.31,3.5.73,5.42-1.46l.3-.34,2.34-44.3-1.42.04Z"
                fill={selectedEntryIndex === 0 ? '#ffffff' : '#f4f4f4'}
                stroke="#1d1d1b"
                strokeWidth={selectedEntryIndex === 0 ? '2' : '1'}
              />
              <text className="ea-dt-6" x="725" y="247" textAnchor="middle"><tspan x="725" y="247">{currentStreamNotes[0]?.tabLabel || 'JUAN'}</tspan></text>
              <text className="ea-dt-4" x="725" y="260" textAnchor="middle"><tspan x="725" y="260">{currentStreamNotes[0]?.levelBadge || 'REDACTOR VERIFICADO'}</tspan></text>
            </g>

            {/* Tab 2 */}
            <g
              className="cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => setSelectedEntryIndex(1)}
            >
              <path
                d="M774.68,278.06c-6.68.18-13.52-.06-20.14-.3-9.92-.36-20.17-.73-30.22.33-13.78-.15-28.38.36-45.78,1.59v.53h-2.3v2.29s1.99-.14,1.99-.14v-.03c17.58-1.25,32.26-1.76,46.13-1.62h.08s.08,0,.08,0c9.89-1.04,20.08-.68,29.93-.32,6.19.22,12.58.45,18.88.33l-2.14,40.53c-.76.7-1.39.57-2.61.31-.61-.13-1.31-.27-2.08-.28-1.57-.02-3.16,0-4.7.04-3.84.07-7.81.15-11.56-.58l-.13-.02h-.13c-21.03.1-45.75.57-70.16,3.29h0s-2.61.43-2.61.43l.02.63c0,.53-.02,1.07-.03,1.6h2.45c24.39-2.74,49.15-3.22,70.21-3.32,3.98.75,8.05.67,11.98.6,1.52-.03,3.09-.06,4.62-.04.52,0,1.03.11,1.58.23,1.48.31,3.5.73,5.42-1.46l.3-.34,2.34-44.3-1.42.04Z"
                fill={selectedEntryIndex === 1 ? '#ffffff' : '#f4f4f4'}
                stroke="#1d1d1b"
                strokeWidth={selectedEntryIndex === 1 ? '2' : '1'}
              />
              <text className="ea-dt-6" x="725" y="300" textAnchor="middle"><tspan x="725" y="300">{currentStreamNotes[1]?.tabLabel || 'ELENA S.'}</tspan></text>
              <text className="ea-dt-4" x="725" y="313" textAnchor="middle"><tspan x="725" y="313">{currentStreamNotes[1]?.levelBadge || 'NIVEL 3 // CRÍTICA'}</tspan></text>
            </g>

            {/* Tab 3 */}
            <g
              className="cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => setSelectedEntryIndex(2)}
            >
              <path
                d="M774.68,330.45c-6.68.18-13.52-.06-20.14-.3-9.92-.36-20.17-.73-30.22.33-13.78-.15-28.38.36-45.78,1.59v.53h-2.3v2.29s1.99-.14,1.99-.14v-.03c17.58-1.25,32.26-1.76,46.13-1.62h.08s.08,0,.08,0c9.89-1.04,20.08-.68,29.93-.32,6.19.22,12.58.45,18.88.33l-2.14,40.53c-.76.7-1.39.57-2.61.31-.61-.13-1.31-.27-2.08-.28-1.57-.02-3.16,0-4.7.04-3.84.07-7.81.15-11.56-.58l-.13-.02h-.13c-21.03.1-45.75.57-70.16,3.29h0s-2.61.43-2.61.43l.02.63c0,.53-.02,1.07-.03,1.6h2.45c24.39-2.74,49.15-3.22,70.21-3.32,3.98.75,8.05.67,11.98.6,1.52-.03,3.09-.06,4.62-.04.52,0,1.03.11,1.58.23,1.48.31,3.5.73,5.42-1.46l.3-.34,2.34-44.3-1.42.04Z"
                fill={selectedEntryIndex === 2 ? '#ffffff' : '#f4f4f4'}
                stroke="#1d1d1b"
                strokeWidth={selectedEntryIndex === 2 ? '2' : '1'}
              />
              <text className="ea-dt-6" x="725" y="352" textAnchor="middle"><tspan x="725" y="352">{currentStreamNotes[2]?.tabLabel || 'SANTIAGO'}</tspan></text>
              <text className="ea-dt-4" x="725" y="365" textAnchor="middle"><tspan x="725" y="365">{currentStreamNotes[2]?.levelBadge || 'RESIDENTE OBRA'}</tspan></text>
            </g>

            {/* Tab 4 */}
            <g
              className="cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => setSelectedEntryIndex(3)}
            >
              <path
                d="M774.68,382.84c-6.68.18-13.52-.06-20.14-.3-9.92-.36-20.17-.73-30.22.33-13.78-.15-28.38.36-45.78,1.59v.53h-2.3v2.29s1.99-.14,1.99-.14v-.03c17.58-1.25,32.26-1.76,46.13-1.62h.08s.08,0,.08,0c9.89-1.04,20.08-.68,29.93-.32,6.19.22,12.58.45,18.88.33l-2.14,40.53c-.76.7-1.39.57-2.61.31-.61-.13-1.31-.27-2.08-.28-1.57-.02-3.16,0-4.7.04-3.84.07-7.81.15-11.56-.58l-.13-.02h-.13c-21.03.1-45.75.57-70.16,3.29h0s-2.61.43-2.61.43l.02.63c0,.53-.02,1.07-.03,1.6h2.45c24.39-2.74,49.15-3.22,70.21-3.32,3.98.75,8.05.67,11.98.6,1.52-.03,3.09-.06,4.62-.04.52,0,1.03.11,1.58.23,1.48.31,3.5.73,5.42-1.46l.3-.34,2.34-44.3-1.42.04Z"
                fill={selectedEntryIndex === 3 ? '#ffffff' : '#f4f4f4'}
                stroke="#1d1d1b"
                strokeWidth={selectedEntryIndex === 3 ? '2' : '1'}
              />
              <text className="ea-dt-6" x="725" y="404" textAnchor="middle"><tspan x="725" y="404">{currentStreamNotes[3]?.tabLabel || 'CAMILA'}</tspan></text>
              <text className="ea-dt-4" x="725" y="417" textAnchor="middle"><tspan x="725" y="417">{currentStreamNotes[3]?.levelBadge || 'TALLER PUCE'}</tspan></text>
            </g>

            {/* Tab 5: + APORTAR */}
            <g
              className="cursor-pointer transition-opacity hover:opacity-80"
              onClick={() => {
                setFormStream(activeStream);
                setIsModalOpen(true);
              }}
            >
              <path
                d="M774.68,435.23c-6.68.18-13.52-.06-20.14-.3-9.92-.36-20.17-.73-30.22.33-13.78-.15-28.38.36-45.78,1.59v.53h-2.3v2.29s1.99-.14,1.99-.14v-.03c17.58-1.25,32.26-1.76,46.13-1.62h.08s.08,0,.08,0c9.89-1.04,20.08-.68,29.93-.32,6.19.22,12.58.45,18.88.33l-2.14,40.53c-.76.7-1.39.57-2.61.31-.61-.13-1.31-.27-2.08-.28-1.57-.02-3.16,0-4.7.04-3.84.07-7.81.15-11.56-.58l-.13-.02h-.13c-21.03.1-45.75.57-70.16,3.29h0s-2.61.43-2.61.43l.02.63c0,.53-.02,1.07-.03,1.6h2.45c24.39-2.74,49.15-3.22,70.21-3.32,3.98.75,8.05.67,11.98.6,1.52-.03,3.09-.06,4.62-.04.52,0,1.03.11,1.58.23,1.48.31,3.5.73,5.42-1.46l.3-.34,2.34-44.3-1.42.04Z"
                fill="#FAF8F5"
                stroke="#1d1d1b"
                strokeDasharray="3 3"
              />
              <text className="ea-dt-6" x="725" y="456" textAnchor="middle"><tspan x="725" y="456">+ APORTAR</tspan></text>
              <text className="ea-dt-4" x="725" y="469" textAnchor="middle"><tspan x="725" y="469">NUEVA FICHA</tspan></text>
            </g>

            {/* ============================================================= */}
            {/* INSIDE CENTER SHEET: <foreignObject> WITH NOTE CONTENT        */}
            {/* ============================================================= */}
            <foreignObject x="248" y="218" width="436" height="286">
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                style={{
                  fontFamily: "'Segoe UI', Roboto, Helvetica, sans-serif",
                  padding: '10px 18px 8px 18px',
                  height: '100%',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  {/* Header Bar */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '8.5px', fontFamily: 'monospace', letterSpacing: '1px', color: '#777', textTransform: 'uppercase' }}>
                      {activeStream.toUpperCase()} // EXPEDIENTE #{selectedEntryIndex + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveStream('overview')}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '8.5px',
                        fontFamily: 'monospace',
                        letterSpacing: '0.8px',
                        textTransform: 'uppercase',
                        color: '#1d1d1b',
                        textDecoration: 'underline',
                        padding: '2px 4px',
                      }}
                    >
                      ← TODAS LAS CARPETAS (3)
                    </button>
                  </div>

                  {/* Diagnostic Badges with Breathing Room */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span
                      style={{
                        background: '#1d1d1b',
                        color: '#fff',
                        padding: '2.5px 8px',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {activeNote.statusBadge}
                    </span>
                    {activeNote.verified && (
                      <span
                        style={{
                          border: '1px solid #10b981',
                          color: '#047857',
                          padding: '2px 7px',
                          fontSize: '7.5px',
                          fontWeight: 'bold',
                          letterSpacing: '0.5px',
                          textTransform: 'uppercase',
                          background: '#ecfdf5',
                        }}
                      >
                        ✓ VERIFICADO EA
                      </span>
                    )}
                    <span style={{ fontSize: '8px', fontFamily: 'monospace', color: '#888', marginLeft: 'auto' }}>
                      {activeNote.date}
                    </span>
                  </div>

                  {/* Note Title with Respiro */}
                  <h3
                    style={{
                      fontFamily: "'OKCOK', sans-serif",
                      fontSize: '17px',
                      margin: '0 0 10px 0',
                      lineHeight: '1.3',
                      color: '#1d1d1b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.2px',
                    }}
                  >
                    {activeNote.title}
                  </h3>

                  {/* 2-Column Content: Text + Photo with generous gap */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '18px', alignItems: 'start' }}>
                    <p style={{ fontSize: '9.5px', lineHeight: '1.65', color: '#2a2a28', margin: 0 }}>
                      {activeNote.content}
                    </p>
                    {activeNote.imageUrl && (
                      <div style={{ border: '1.5px solid #1d1d1b', padding: '3px', background: '#FAF8F5' }}>
                        <img
                          src={activeNote.imageUrl}
                          alt={activeNote.title}
                          style={{ width: '100%', height: '80px', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ fontSize: '6.5px', fontFamily: 'monospace', color: '#666', textAlign: 'center', paddingTop: '3px', textTransform: 'uppercase' }}>
                          {activeNote.figureCaption || 'FIG. REGISTRO EN OBRA'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Author & Action Buttons with padding */}
                <div style={{ borderTop: '1px solid #e2e0dc', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#1d1d1b', textTransform: 'uppercase' }}>
                        {activeNote.author}
                      </span>
                      <span style={{ background: '#1d1d1b', color: '#fff', fontSize: '6.5px', fontFamily: 'monospace', padding: '1.5px 5px' }}>
                        {activeNote.levelBadge}
                      </span>
                    </div>
                    <div style={{ fontSize: '8px', color: '#666', fontFamily: 'monospace', marginTop: '2px' }}>
                      {activeNote.role} • {activeNote.city}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleLike(activeNote.id)}
                      style={{
                        background: activeNote.hasLiked ? '#1d1d1b' : '#fff',
                        color: activeNote.hasLiked ? '#fff' : '#1d1d1b',
                        border: '1.5px solid #1d1d1b',
                        padding: '4px 10px',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      ♥ ÚTIL ({activeNote.likes})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormStream(activeStream);
                        setFormTitle('Contraste a: ' + activeNote.title);
                        setIsModalOpen(true);
                      }}
                      style={{
                        background: '#1d1d1b',
                        color: '#fff',
                        border: '1.5px solid #1d1d1b',
                        padding: '4px 10px',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      CONTRASTAR
                    </button>
                  </div>
                </div>
              </div>
            </foreignObject>
          </svg>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. MODAL: CONTRIBUIR AL ARCHIVO COLECTIVO                             */}
      {/* ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans">
          <div className="bg-white border-2 border-[#1d1d1b] shadow-[8px_8px_0px_#1d1d1b] max-w-lg w-full p-6 sm:p-8 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 border border-[#1d1d1b] hover:bg-[#1d1d1b] hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-gray-200 pb-3 mb-5">
              <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest block">
                EXPEDIENTE COLECTIVO // OBRA VIVA
              </span>
              <h3 className="font-okcok text-2xl uppercase text-[#1d1d1b] leading-tight mt-0.5">
                CONTRIBUIR AL ARCHIVO DE CAMPO
              </h3>
            </div>

            <form onSubmit={handleAddContribution} className="space-y-4 text-xs font-sans">
              <div>
                <label className="font-mono text-[10px] uppercase text-gray-600 block mb-1">
                  SELECCIONA CARPETA DESTINO:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['visitas', 'notas', 'conversaciones'] as const).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setFormStream(s)}
                      className={`py-2 px-2 border-2 text-[10px] font-bold uppercase transition-all ${
                        formStream === s
                          ? 'bg-[#1d1d1b] text-white border-[#1d1d1b]'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-[#1d1d1b]'
                      }`}
                    >
                      {s === 'visitas' ? 'VISITAS' : s === 'notas' ? 'NOTAS' : 'DEBATES'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase text-gray-600 block mb-1">
                  CRITERIO DE DIAGNÓSTICO:
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full p-2 border-2 border-[#1d1d1b] bg-white text-xs uppercase font-mono"
                >
                  <option value="CONFORT TÉRMICO Y ACÚSTICO VERIFICADO">CONFORT TÉRMICO & ACÚSTICO</option>
                  <option value="BALANCE LUMÍNICO NATURAL EQUINOCCIAL">BALANCE LUMÍNICO NATURAL</option>
                  <option value="MONITOREO DE JUNTAS Y SISMO-RESISTENCIA">JUNTAS Y SISMO-RESISTENCIA</option>
                  <option value="ESTUDIO DE PATOLOGÍAS Y ENVEJECIMIENTO">PATOLOGÍAS Y MATERIALIDAD</option>
                  <option value="OBSERVACIÓN DE HABITABILIDAD COTIDIANA">HABITABILIDAD COTIDIANA</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase text-gray-600 block mb-1">
                  TÍTULO DE LA OBSERVACIÓN:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Comportamiento térmico del hormigón a las 14:00 hrs..."
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2.5 border-2 border-[#1d1d1b] text-xs font-medium"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] uppercase text-gray-600 block mb-1">
                  OBSERVACIÓN DETALLADA IN SITU:
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe la experiencia material, ambiental o constructiva en la obra..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-2.5 border-2 border-[#1d1d1b] text-xs font-normal"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <span className="font-mono text-[9px] text-gray-500">
                  APORTARÁS COMO: <strong>{userProfile.name}</strong> ({userProfile.levelBadge})
                </span>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#1d1d1b] text-white font-bold text-xs uppercase border-2 border-[#1d1d1b] hover:bg-white hover:text-[#1d1d1b] transition-all cursor-pointer flex items-center gap-1.5 shadow-[2px_2px_0px_#1d1d1b]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>PUBLICAR FICHA</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
