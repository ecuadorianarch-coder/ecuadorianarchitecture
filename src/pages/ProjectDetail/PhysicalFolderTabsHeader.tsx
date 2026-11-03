import React from 'react';

export type DossierTabKey = 'resena' | 'critica' | 'podcast' | 'obra-viva';

interface PhysicalFolderTabsHeaderProps {
  activeTab: DossierTabKey;
  onSelectTab: (tab: DossierTabKey) => void;
}

export const PhysicalFolderTabsHeader: React.FC<PhysicalFolderTabsHeaderProps> = ({
  activeTab,
  onSelectTab,
}) => {
  return (
    <div className="w-full relative z-20 select-none">
      <svg
        className="w-full h-auto block"
        viewBox="80.02 44 697.79 51"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: '-2px' }}
      >
        <defs>
          <style>{`
            @font-face {
              font-family: 'OKCOK';
              src: url('/fonts/OKCOK.otf') format('opentype');
            }
            .pft-tab-text {
              font-family: 'OKCOK', sans-serif;
              text-anchor: middle;
            }
            .pft-tab-subtext {
              font-family: 'OKCOK', sans-serif;
              font-size: 8.8px;
              text-anchor: middle;
            }
          `}</style>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* BASELINE SEGMENTS (Connecting seamlessly to HTML folder body)  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'resena' && (
          <>
            <line x1="80.02" y1="94.5" x2="105.81" y2="94.5" stroke="#1d1d1b" strokeWidth="2" strokeLinecap="square" />
            <line x1="249.17" y1="94.5" x2="777.81" y2="94.5" stroke="#1d1d1b" strokeWidth="2" strokeLinecap="square" />
          </>
        )}
        {activeTab === 'critica' && (
          <>
            <line x1="80.02" y1="94.5" x2="263.98" y2="94.5" stroke="#1d1d1b" strokeWidth="2" strokeLinecap="square" />
            <line x1="407.35" y1="94.5" x2="777.81" y2="94.5" stroke="#1d1d1b" strokeWidth="2" strokeLinecap="square" />
          </>
        )}
        {activeTab === 'podcast' && (
          <>
            <line x1="80.02" y1="94.5" x2="428.92" y2="94.5" stroke="#1d1d1b" strokeWidth="2" strokeLinecap="square" />
            <line x1="572.29" y1="94.5" x2="777.81" y2="94.5" stroke="#1d1d1b" strokeWidth="2" strokeLinecap="square" />
          </>
        )}
        {activeTab === 'obra-viva' && (
          <>
            <line x1="80.02" y1="94.5" x2="607.26" y2="94.5" stroke="#1d1d1b" strokeWidth="2" strokeLinecap="square" />
            <line x1="750.62" y1="94.5" x2="777.81" y2="94.5" stroke="#1d1d1b" strokeWidth="2" strokeLinecap="square" />
          </>
        )}

        {/* ------------------------------------------------------------- */}
        {/* INACTIVE TABS (Rendered in background layers)                */}
        {/* ------------------------------------------------------------- */}

        {/* TAB 4: NOTAS DE LA COMUNIDAD (Inactive) */}
        {activeTab !== 'obra-viva' && (
          <g
            id="tab-btn-obra-viva"
            className="cursor-pointer transition-opacity hover:opacity-85"
            onClick={() => onSelectTab('obra-viva')}
          >
            <path
              d="M750.62,94.5v-33c0-3.45-2.8-6.26-6.26-6.26H613.52c-3.45,0-6.26,2.8-6.26,6.26v33"
              fill="#FAF8F5"
              stroke="#1d1d1b"
              strokeWidth="1.5"
            />
            <text x="678.94" y="73" className="pft-tab-text" fontSize="16px" fill="#1d1d1b">
              NOTAS
            </text>
            <text x="678.94" y="85" className="pft-tab-subtext" fill="#1d1d1b">
              DE LA COMUNIDAD
            </text>
          </g>
        )}

        {/* TAB 3: PODCAST (Inactive) */}
        {activeTab !== 'podcast' && (
          <g
            id="tab-btn-podcast"
            className="cursor-pointer transition-opacity hover:opacity-85"
            onClick={() => onSelectTab('podcast')}
          >
            <path
              d="M572.29,94.5v-33c0-3.45-2.8-6.26-6.26-6.26H435.18c-3.45,0-6.26,2.8-6.26,6.26v33"
              fill="#DADADA"
              stroke="#1d1d1b"
              strokeWidth="1.5"
            />
            <text x="500.60" y="77" className="pft-tab-text" fontSize="18px" fill="#1d1d1b">
              PODCAST
            </text>
          </g>
        )}

        {/* TAB 2: CRÍTICA (Inactive) */}
        {activeTab !== 'critica' && (
          <g
            id="tab-btn-critica"
            className="cursor-pointer transition-opacity hover:opacity-85"
            onClick={() => onSelectTab('critica')}
          >
            <path
              d="M407.35,94.5v-35c0-3.45-2.8-6.26-6.26-6.26H270.24c-3.45,0-6.26,2.8-6.26,6.26v35"
              fill="#EDEDED"
              stroke="#1d1d1b"
              strokeWidth="1.5"
            />
            <text x="335.66" y="77" className="pft-tab-text" fontSize="18px" fill="#1d1d1b">
              CRÍTICA
            </text>
          </g>
        )}

        {/* TAB 1: RESEÑA (Inactive) */}
        {activeTab !== 'resena' && (
          <g
            id="tab-btn-resena"
            className="cursor-pointer transition-opacity hover:opacity-85"
            onClick={() => onSelectTab('resena')}
          >
            <path
              d="M249.17,94.5v-35c0-3.45-2.8-6.26-6.26-6.26H112.07c-3.45,0-6.26,2.8-6.26,6.26v35"
              fill="#EDEDED"
              stroke="#1d1d1b"
              strokeWidth="1.5"
            />
            <text x="177.49" y="77" className="pft-tab-text" fontSize="18px" fill="#1d1d1b">
              RESEÑA
            </text>
          </g>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ACTIVE TAB (Rendered in front, prominent, seamlessly merged)   */}
        {/* ------------------------------------------------------------- */}

        {/* TAB 1: RESEÑA (Active) */}
        {activeTab === 'resena' && (
          <g>
            <path
              d="M249.17,94.8v-41.5c0-3.45-2.8-6.26-6.26-6.26H112.07c-3.45,0-6.26,2.8-6.26,6.26v41.5"
              fill="#FFFFFF"
              stroke="#1d1d1b"
              strokeWidth="2"
            />
            {/* White masking bar over the baseline gap */}
            <line x1="106.3" y1="94.5" x2="248.7" y2="94.5" stroke="#FFFFFF" strokeWidth="3" />
            <text x="177.49" y="74" className="pft-tab-text" fontSize="19px" fill="#1d1d1b" fontWeight="bold">
              RESEÑA
            </text>
          </g>
        )}

        {/* TAB 2: CRÍTICA (Active) */}
        {activeTab === 'critica' && (
          <g>
            <path
              d="M407.35,94.8v-41.5c0-3.45-2.8-6.26-6.26-6.26H270.24c-3.45,0-6.26,2.8-6.26,6.26v41.5"
              fill="#FFFFFF"
              stroke="#1d1d1b"
              strokeWidth="2"
            />
            <line x1="264.5" y1="94.5" x2="406.8" y2="94.5" stroke="#FFFFFF" strokeWidth="3" />
            <text x="335.66" y="74" className="pft-tab-text" fontSize="19px" fill="#1d1d1b" fontWeight="bold">
              CRÍTICA
            </text>
          </g>
        )}

        {/* TAB 3: PODCAST (Active) */}
        {activeTab === 'podcast' && (
          <g>
            <path
              d="M572.29,94.8v-41.5c0-3.45-2.8-6.26-6.26-6.26H435.18c-3.45,0-6.26,2.8-6.26,6.26v41.5"
              fill="#FFFFFF"
              stroke="#1d1d1b"
              strokeWidth="2"
            />
            <line x1="429.4" y1="94.5" x2="571.8" y2="94.5" stroke="#FFFFFF" strokeWidth="3" />
            <text x="500.60" y="74" className="pft-tab-text" fontSize="19px" fill="#1d1d1b" fontWeight="bold">
              PODCAST
            </text>
          </g>
        )}

        {/* TAB 4: NOTAS DE LA COMUNIDAD (Active) */}
        {activeTab === 'obra-viva' && (
          <g>
            <path
              d="M750.62,94.8v-41.5c0-3.45-2.8-6.26-6.26-6.26H613.52c-3.45,0-6.26,2.8-6.26,6.26v41.5"
              fill="#FFFFFF"
              stroke="#1d1d1b"
              strokeWidth="2"
            />
            <line x1="607.8" y1="94.5" x2="750.1" y2="94.5" stroke="#FFFFFF" strokeWidth="3" />
            <text x="678.94" y="69" className="pft-tab-text" fontSize="17px" fill="#1d1d1b" fontWeight="bold">
              NOTAS
            </text>
            <text x="678.94" y="82" className="pft-tab-subtext" fill="#1d1d1b" fontWeight="bold">
              DE LA COMUNIDAD
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
