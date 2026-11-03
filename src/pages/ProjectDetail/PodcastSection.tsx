import React, { useState } from 'react';
import { Mic, Play, Pause, Volume2, RotateCcw, RotateCw, Download, FileText, Share2, Headphones, Radio, Sparkles } from 'lucide-react';

interface PodcastSectionProps {
  project: any;
}

export const PodcastSection: React.FC<PodcastSectionProps> = ({ project }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(14 * 60 + 28); // 14:28 in seconds
  const totalDuration = 44 * 60 + 15; // 44:15 in seconds
  const [activeTimestamp, setActiveTimestamp] = useState<number>(1);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const triggerNotice = (msg: string) => {
    setDownloadNotice(msg);
    setTimeout(() => setDownloadNotice(null), 3800);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timestamps = [
    {
      time: '00:00',
      secs: 0,
      title: `Territorio y emplazamiento: las condiciones geográficas de ${project.location}`,
      speaker: 'Crítica Editorial EA',
    },
    {
      time: '08:35',
      secs: 8 * 60 + 35,
      title: 'Tectónica y materia: vaciado de hormigón, madera y mano de obra local',
      speaker: `${project.studio}`,
    },
    {
      time: '21:10',
      secs: 21 * 60 + 10,
      title: 'El vacío central como chimenea bioclimática pasiva',
      speaker: `${project.critic || 'Al Borde'} en diálogo con los autores`,
    },
    {
      time: '34:50',
      secs: 34 * 60 + 50,
      title: 'Veredicto crítico: pertinencia social y resistencia ecológica en los Andes',
      speaker: 'Mesa de Debate EA',
    },
  ];

  const handleSeek = (secs: number, index: number) => {
    setCurrentTime(secs);
    setActiveTimestamp(index);
    if (!isPlaying) setIsPlaying(true);
  };

  const handleSpeedToggle = () => {
    const speeds = [1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
  };

  return (
    <article className="space-y-8 max-w-4xl mx-auto">
      {/* 1. HEADER */}
      <div>
        <div className="flex flex-wrap items-center gap-3 mb-2.5">
          <span className="font-anton text-[10.5px] sm:text-[11.5px] tracking-widest uppercase bg-ea-black text-white px-3 py-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>DISCURSO SONORO EN OBRA</span>
          </span>
          <span className="font-anton text-[10px] sm:text-[11px] tracking-wider uppercase bg-amber-400 text-ea-black border border-ea-black px-2.5 py-1 font-bold">
            ESTRENO PRÓXIMO // TEMPORADA 2026
          </span>
          <span className="font-mono text-[10px] sm:text-[11px] text-ea-black/50 uppercase">
            PODCAST OFICIAL // ECUADORIAN ARCHITECTURE
          </span>
        </div>
        <h3 className="font-okcok text-lg sm:text-[20px] md:text-[22px] uppercase text-ea-black leading-[1.25] tracking-normal mb-2.5">
          Tectónica, Inercia y Vacío en {project.title}
        </h3>
        <div className="text-[10px] sm:text-[11px] font-mono text-ea-black/50 uppercase flex flex-wrap gap-4 border-b border-ea-border pb-3.5">
          <span>EPISODIO: EA-POD-0{project.id === 'atrium' ? '1' : project.id === 'casa-arboles' ? '2' : '3'}</span>
          <span>•</span>
          <span>DURACIÓN: 44 MIN 15 SEG</span>
          <span>•</span>
          <span>GRABACIÓN IN SITU: {project.location}</span>
        </div>
      </div>

      <p className="font-creato text-[13.5px] sm:text-[14.5px] text-ea-black/85 leading-[1.72] font-normal">
        Conversación grabada en el interior de la obra entre los proyectistas de <strong className="font-semibold">{project.studio}</strong> y la cátedra crítica de <strong className="font-semibold">{project.critic || 'Al Borde Arquitectos'}</strong>. Un análisis a micrófono abierto sobre las fricciones del proceso constructivo, la economía de medios en la cordillera y la respuesta habitacional del edificio.
      </p>

      {/* 2. BRUTALIST INTERACTIVE AUDIO PLAYER */}
      <div className="border-2 border-ea-black bg-[#FBFBFA] p-6 sm:p-8 rounded-[2px] shadow-[4px_4px_0px_#000000]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-ea-border">
          {/* Track metadata */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-ea-black border-2 border-ea-black flex flex-col items-center justify-center text-white shrink-0 shadow-sm relative overflow-hidden group">
              <img
                src={project.heroImage}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity group-hover:scale-110 transition-transform"
              />
              <Headphones className="w-6 h-6 text-white relative z-10" />
              <span className="font-anton text-[8px] tracking-widest uppercase mt-1 relative z-10 text-white/80">
                MASTER
              </span>
            </div>

            <div>
              <span className="font-mono text-[11px] text-ea-black/50 uppercase block">
                AUDIOGUÍA TÉCNICA // CAPÍTULO MONOGRÁFICO
              </span>
              <h4 className="font-anton text-lg sm:text-xl text-ea-black uppercase tracking-wide">
                EP. 06 — Diálogo Crítico en {project.title}
              </h4>
              <p className="font-creato text-xs text-ea-black/70">
                Voces: {project.studio} & {project.critic || 'Crítica Paritaria'}
              </p>
            </div>
          </div>

          {/* Quick playback actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={handleSpeedToggle}
              className="px-2.5 py-1.5 border border-ea-black text-xs font-anton tracking-wider uppercase bg-white hover:bg-ea-black hover:text-white transition-colors"
              title="Velocidad de reproducción"
              data-cursor
            >
              {playbackSpeed}x
            </button>
            <button
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard?.writeText(url);
                alert('Enlace del podcast copiado al portapapeles');
              }}
              className="p-1.5 border border-ea-black text-ea-black hover:bg-ea-black hover:text-white transition-colors"
              title="Compartir episodio"
              data-cursor
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Audio scrub wave & scrubber */}
        <div className="pt-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-ea-black/60">
            <span className="font-semibold text-ea-black">{formatTime(currentTime)}</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
              <span className="uppercase text-[10px] tracking-wider">CANAL ESTÉREO // AUDIO IN SITU</span>
            </div>
            <span>{formatTime(totalDuration)}</span>
          </div>

          {/* Simulated Waveform Visualizer */}
          <div
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setCurrentTime(Math.floor(pct * totalDuration));
              if (!isPlaying) setIsPlaying(true);
            }}
            className="w-full h-12 flex items-end gap-[3px] py-1 cursor-pointer group bg-ea-offwhite/80 p-2 border border-ea-border rounded-[2px]"
            title="Hacer clic para saltar en el audio"
            data-cursor
          >
            {Array.from({ length: 48 }).map((_, idx) => {
              const pct = (idx / 48);
              const isPast = pct <= (currentTime / totalDuration);
              // deterministic natural audio wave height
              const heightPct = 20 + Math.abs(Math.sin(idx * 0.45) * 65) + ((idx % 3) * 6);
              return (
                <div
                  key={idx}
                  style={{ height: `${heightPct}%` }}
                  className={`flex-1 rounded-[1px] transition-all duration-150 ${
                    isPast
                      ? 'bg-ea-black'
                      : 'bg-ea-black/20 group-hover:bg-ea-black/40'
                  }`}
                />
              );
            })}
          </div>

          {/* Master Transport Controls */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentTime((t) => Math.max(0, t - 15))}
                className="p-2 border border-ea-black/40 hover:border-ea-black hover:bg-white text-ea-black transition-colors rounded-[2px]"
                title="Retroceder 15 segundos"
                data-cursor
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center gap-2.5 px-6 py-2.5 bg-ea-black text-white font-anton text-xs sm:text-sm tracking-widest uppercase hover:bg-neutral-800 active:translate-y-0.5 transition-all shadow-[2px_2px_0px_#000000]"
                data-cursor
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isPlaying ? 'PAUSAR DIÁLOGO' : 'REPRODUCIR EPISODIO'}</span>
              </button>

              <button
                onClick={() => setCurrentTime((t) => Math.min(totalDuration, t + 15))}
                className="p-2 border border-ea-black/40 hover:border-ea-black hover:bg-white text-ea-black transition-colors rounded-[2px]"
                title="Adelantar 15 segundos"
                data-cursor
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-ea-black/60">
              <Volume2 className="w-4 h-4" />
              <span>SONIDO BINAURAL 3D</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TIMESTAMPS & TOPICS */}
      <div className="border-2 border-ea-black p-6 sm:p-8 bg-white">
        <div className="flex items-center justify-between pb-4 border-b border-ea-border mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-ea-black rounded-full" />
            <h4 className="font-anton text-sm uppercase tracking-wider text-ea-black">
              TEMAS DEL EPISODIO & MARCAS DE TIEMPO
            </h4>
          </div>
          <span className="font-mono text-xs text-ea-black/50 uppercase">
            4 CAPÍTULOS SONOROS
          </span>
        </div>

        <div className="space-y-3">
          {timestamps.map((t, idx) => {
            const isCurrent = activeTimestamp === idx;
            return (
              <div
                key={idx}
                onClick={() => handleSeek(t.secs, idx)}
                className={`p-3.5 border transition-all cursor-pointer flex items-start justify-between gap-4 group ${
                  isCurrent
                    ? 'border-ea-black bg-ea-offwhite/80 shadow-[2px_2px_0px_#000000]'
                    : 'border-ea-border hover:border-ea-black/70 hover:bg-white'
                }`}
                data-cursor
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs font-bold text-ea-black bg-white border border-ea-border px-2 py-0.5 rounded-[1px] group-hover:border-ea-black transition-colors">
                    {t.time}
                  </span>
                  <div>
                    <span className="font-anton text-xs sm:text-sm uppercase tracking-wide text-ea-black block group-hover:underline">
                      {t.title}
                    </span>
                    <span className="font-creato text-xs text-ea-black/60 mt-0.5 block">
                      Voz principal: {t.speaker}
                    </span>
                  </div>
                </div>

                <button
                  className="font-anton text-[10px] tracking-widest uppercase border border-ea-black px-2.5 py-1 text-ea-black bg-white group-hover:bg-ea-black group-hover:text-white transition-colors shrink-0"
                >
                  IR AL MINUTO →
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DOWNLOAD & TRANSCRIPT DOSSIER */}
      {downloadNotice && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 p-3.5 bg-ea-black text-white text-xs font-mono flex items-center justify-between rounded-sm shadow-sm transition-all"
        >
          <span className="flex items-center gap-2">
            <span className="text-emerald-400">✓</span> {downloadNotice}
          </span>
          <button
            type="button"
            onClick={() => setDownloadNotice(null)}
            className="text-white/60 hover:text-white cursor-pointer px-1 py-0.5 text-xs focus:outline-hidden"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => {
            triggerNotice('El Audio Master (MP3 320kbps) estará disponible para descarga directa el día del estreno oficial de la temporada.');
          }}
          className="border-2 border-ea-black p-4 bg-ea-offwhite hover:bg-white transition-colors flex items-center justify-between group shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden text-left"
          data-cursor
        >
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-ea-black group-hover:-translate-y-0.5 transition-transform" />
            <div>
              <span className="font-anton text-xs uppercase tracking-wider block text-ea-black">
                DESCARGAR AUDIO MASTER
              </span>
              <span className="font-mono text-[10px] text-ea-black/50">MP3 320 KBPS • DISPONIBLE EN ESTRENO</span>
            </div>
          </div>
          <span className="font-mono text-xs">↗</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerNotice('La transcripción crítica y el expediente editorial en PDF se habilitarán junto con la publicación del episodio.');
          }}
          className="border-2 border-ea-black p-4 bg-ea-offwhite hover:bg-white transition-colors flex items-center justify-between group shadow-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-ea-black/70 focus-visible:outline-hidden text-left"
          data-cursor
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-ea-black group-hover:-translate-y-0.5 transition-transform" />
            <div>
              <span className="font-anton text-xs uppercase tracking-wider block text-ea-black">
                TRANSCRIPCIÓN CRÍTICA
              </span>
              <span className="font-mono text-[10px] text-ea-black/50">EXPEDIENTE EDITORIAL • DISPONIBLE EN ESTRENO</span>
            </div>
          </div>
          <span className="font-mono text-xs">↗</span>
        </button>
      </div>
    </article>
  );
};

export default PodcastSection;
