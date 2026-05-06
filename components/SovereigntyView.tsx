/**
 * @file SovereigntyView.tsx
 * @description Vista embebida en el LCD para el control de datos, consentimientos y portabilidad.
 */

import React from "react";

interface SovereigntyViewProps {
  consents: {
    audit: boolean;
    portability: boolean;
    transparency: boolean;
  };
  onToggleConsent: (key: 'audit' | 'portability' | 'transparency') => void;
  onExport: () => void;
  onDeleteFootprint: () => void;
  onBack: () => void;
}

export function SovereigntyView({ consents, onToggleConsent, onExport, onDeleteFootprint, onBack }: SovereigntyViewProps) {
  return (
    <div className="flex flex-col h-full gap-3 animate-in fade-in duration-500">
      <div className="text-center mb-2">
        <div className="lcd-text-large !text-[20px] tracking-widest border-b-2 border-[#1a2f1a] border-opacity-20 pb-1">
          MI SOBERANÍA
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
        <div className="bg-black bg-opacity-5 p-3 rounded-xl">
          <div className="text-[11px] font-black opacity-50 mb-2 uppercase">Consentimientos</div>
          
          <div className="flex flex-col gap-4">
            <ToggleItem 
              label="Auditoría IA" 
              description="Autorizo el procesamiento de mis datos para detección de abusos según Ley 19.496."
              active={consents.audit} 
              onClick={() => onToggleConsent('audit')} 
            />
            <ToggleItem 
              label="Portabilidad" 
              description="Permito la exportación de mi historial financiero a terceros autorizados."
              active={consents.portability} 
              onClick={() => onToggleConsent('portability')} 
            />
            <ToggleItem 
              label="Transparencia" 
              description="Derecho a conocer cómo se usan mis datos bajo Ley 19.628."
              active={consents.transparency} 
              onClick={() => onToggleConsent('transparency')} 
            />
          </div>
        </div>

        <div className="bg-black bg-opacity-5 p-3 rounded-xl">
          <div className="text-[11px] font-black opacity-50 mb-2 uppercase">Portabilidad</div>
          <button 
            onClick={onExport}
            className="w-full bg-[#1a2f1a] text-[#d4e8b0] py-2 rounded-lg font-bold text-[12px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            📥 DESCARGAR MI PASAPORTE
          </button>
          <div className="text-[10px] mt-2 opacity-60 leading-tight">
            Exporta tus datos financieros en formato JSON estándar (Open Banking).
          </div>
        </div>

        <div className="bg-red-500 bg-opacity-5 p-3 rounded-xl border border-red-500 border-opacity-10">
          <div className="text-[11px] font-black text-red-800 opacity-80 mb-2 uppercase flex items-center gap-2">
            <span>🗑️</span> DERECHO AL OLVIDO
          </div>
          <button 
            onClick={() => {
              if (confirm("¿ESTÁS SEGURO? Esta acción borrará permanentemente toda tu huella financiera cifrada en este dispositivo.")) {
                onDeleteFootprint();
              }
            }}
            className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-black text-[10px] uppercase border border-red-200 hover:bg-red-200 transition-colors"
          >
            Eliminar Mi Huella Digital
          </button>
        </div>
      </div>

      <button 
        onClick={onBack}
        className="modern-button !py-3 !text-[12px] w-full"
      >
        ↩️ VOLVER AL MENÚ
      </button>
    </div>
  );
}

function ToggleItem({ label, description, active, onClick }: { label: string, description: string, active: boolean, onClick: () => void }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-bold uppercase">{label}</span>
        <button 
          onClick={onClick}
          className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${active ? 'bg-[#2d5a27]' : 'bg-gray-400'}`}
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${active ? 'left-7' : 'left-1'}`} />
        </button>
      </div>
      <div className="text-[10px] leading-tight opacity-70 italic">
        {description}
      </div>
    </div>
  );
}
