import React, { useState } from 'react';
import { CommunityFolderExplorer } from './CommunityFolderExplorer';
import { Award, ShieldCheck, User } from 'lucide-react';

interface ObraVivaSectionProps {
  project: any;
  onNavigateTab?: (tab: 'resena' | 'critica' | 'podcast' | 'obra-viva') => void;
}

export const ObraVivaSection: React.FC<ObraVivaSectionProps> = ({ project, onNavigateTab }) => {
  return (
    <div className="w-full">
      {/* Interactive Physical Archival Folder Explorer (matching SVG references) */}
      <CommunityFolderExplorer project={project} onNavigateTab={onNavigateTab} />

      {/* Trust & Reputation System Footnote (Garantía de Confianza Técnica) */}
      <div className="mt-12 p-8 sm:p-10 bg-[#FAF9F5] border-2 border-ea-black rounded-[2px] shadow-[4px_4px_0px_#000000] w-full">
        <div className="flex items-center justify-between pb-3 border-b border-ea-border mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-ea-black" />
            <h4 className="font-anton text-xs sm:text-sm uppercase tracking-wider text-ea-black">
              SISTEMA DE CONFIANZA & NIVELES DE APORTE COLECTIVO
            </h4>
          </div>
          <span className="font-mono text-[11px] text-ea-black/50 uppercase">
            GARANTÍA EDITORIAL POR PARES // ECUADORIAN ARCHITECTURE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-creato text-xs">
          <div className="p-3 bg-white border border-ea-border rounded-[2px]">
            <span className="inline-flex items-center gap-1.5 bg-[#F2EFE9] text-ea-black/80 px-2 py-0.5 rounded-[2px] font-anton text-[10px] tracking-wider uppercase border border-ea-black/30 mb-2">
              <User className="w-3 h-3 text-ea-black/60" />
              <span>NIVEL 1 • OBSERVADOR REGISTRADO</span>
            </span>
            <p className="text-ea-black/70 leading-relaxed">
              <strong>1–2 aportes verificados.</strong> Registro fotográfico inicial, vivencias espaciales y primeras impresiones como visitante.
            </p>
          </div>

          <div className="p-3 bg-white border border-ea-border rounded-[2px]">
            <span className="inline-flex items-center gap-1.5 bg-white text-ea-black px-2.5 py-0.5 rounded-[2px] font-anton text-[10px] tracking-wider uppercase border-2 border-ea-black shadow-xs mb-2">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>NIVEL 2 • ARQUITECTO RESIDENTE ✓</span>
            </span>
            <p className="text-ea-black/70 leading-relaxed">
              <strong>3–6 aportes técnicos.</strong> Profesionales con visitas periódicas, seguimiento de patologías y notas de mantenimiento.
            </p>
          </div>

          <div className="p-3 bg-white border border-ea-border rounded-[2px]">
            <span className="inline-flex items-center gap-1.5 bg-ea-black text-white px-2.5 py-0.5 rounded-[2px] font-anton text-[10px] tracking-wider uppercase border border-ea-black shadow-xs mb-2">
              <Award className="w-3 h-3 text-amber-400" />
              <span>NIVEL 3 • CRÍTICO CERTIFICADO EA ✓</span>
            </span>
            <p className="text-ea-black/70 leading-relaxed">
              <strong>7+ aportes o revisión paritaria.</strong> Máxima confianza técnica, contraste con planos originales y dictámenes estructurales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
