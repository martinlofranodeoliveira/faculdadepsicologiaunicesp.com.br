import { useState } from 'react'
import type { CatalogCurriculumVariant } from '@/lib/catalogApi'

type Props = {
  variants: CatalogCurriculumVariant[]
}

const imgChevronLeft = "https://www.figma.com/api/mcp/asset/d92f5e94-4eae-4735-b6b3-7afc9b7ef638"
const imgDownload = "https://www.figma.com/api/mcp/asset/788079c9-0c57-4b68-8345-3ceef33a8333"

export function CurriculumSection({ variants }: Props) {
  const [activeVariant, setActiveVariant] = useState(variants[0])
  const [isOpen, setIsOpen] = useState(true)

  if (!activeVariant || !activeVariant.disciplines) return null

  return (
    <section className="w-full flex flex-col items-start lg:items-center">
      <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-[20px] lg:gap-6 mb-6 lg:mb-10">
        <h2 className="text-white text-[25px] lg:text-[40px] font-extrabold uppercase font-['Kumbh_Sans'] leading-tight m-0 text-center lg:text-left w-full lg:w-auto">
          Grade Curricular
        </h2>
        
        {variants.length > 0 && (
          <div className="flex flex-wrap justify-center lg:justify-end gap-[10px] lg:gap-3 w-full lg:w-auto">
            {variants.map(variant => (
              <button 
                key={variant.id}
                onClick={() => setActiveVariant(variant)}
                className={`px-[23px] py-[10.6px] lg:px-6 lg:py-2 rounded-[56px] font-bold text-[14px] lg:text-[20px] uppercase font-['Kumbh_Sans'] transition-colors ${activeVariant.id === variant.id ? 'bg-white text-[#091149]' : 'border-[1.4px] lg:border-2 border-[#1b63de] lg:border-[#77aaff] text-white hover:bg-white/10'}`}
              >
                {variant.totalHours}H
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-full bg-white rounded-[13.8px] lg:rounded-[35px] px-[14px] py-[15px] lg:px-[58px] lg:py-[44px] flex flex-col transition-all duration-300">
        <div 
          className="flex items-center justify-between w-full cursor-pointer select-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2 font-extrabold text-[12px] lg:text-[22px] uppercase font-['Kumbh_Sans'] leading-[1.13] lg:leading-normal">
            <span className="text-[#1b63de] lg:text-[#235dbe]">Disciplinas</span>
            <span className="text-[#0b111f] font-extrabold lg:font-medium text-[12px] lg:text-[18px] lowercase">(plataforma conted)</span>
          </div>
          <div className="flex items-center justify-end gap-[5px] lg:gap-3 text-[rgba(0,2,5,0.4)] font-bold text-[12px] lg:text-[20px] uppercase font-['Kumbh_Sans'] leading-[1.13] lg:leading-normal">
            <span className="w-min lg:w-auto text-right">Carga Horária</span>
            <div className="w-[26px] h-[26px] lg:w-[47px] lg:h-[47px] flex items-center justify-center bg-transparent border border-[rgba(0,2,5,0.4)] rounded-full shrink-0">
              <img src={imgChevronLeft} alt="" className={`w-[17.3px] h-[17.3px] lg:w-6 lg:h-6 opacity-50 transition-transform duration-300 ${isOpen ? '-rotate-90' : 'rotate-90'}`} />
            </div>
          </div>
        </div>

        <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 mt-3 lg:mt-6' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
          <div className="flex flex-col w-full overflow-hidden">
            {activeVariant.disciplines.map((discipline, index) => (
              <div key={discipline.id} className="flex flex-col w-full">
                <div className="h-[1px] bg-[#d9d9d9] w-full my-2 lg:my-4"></div>
                <div className="flex items-center justify-between gap-4 font-['Kumbh_Sans'] lg:font-['Liberation_Sans'] text-[12px] lg:text-[20px] text-black w-full py-[2px] lg:py-0">
                  <span className="font-medium lg:font-semibold text-black leading-[1.13] lg:leading-normal">{discipline.name}</span>
                  <span className="shrink-0 font-medium lg:font-normal leading-[1.13] lg:leading-normal whitespace-nowrap">{discipline.hours} horas</span>
                </div>
              </div>
            ))}
            
            <div className="h-[1px] bg-[#d9d9d9] w-full my-2 lg:my-4"></div>
            
            {/* Total row */}
            <div className="flex items-center justify-between gap-4 font-['Kumbh_Sans'] lg:font-['Liberation_Sans'] text-[12px] lg:text-[20px] font-bold text-black uppercase leading-[1.13] lg:leading-normal py-[2px] lg:py-0">
              <span>TOTAL:</span>
              <span>{activeVariant.totalHours} horas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-5 mt-8 lg:mt-10">
        <button onClick={(e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); }} className="bg-white text-[#091149] text-[14px] lg:text-[18px] font-extrabold uppercase rounded-[10px] lg:rounded-[12px] hover:opacity-90 transition-opacity font-['Kumbh_Sans'] w-full sm:w-[197px] flex items-center justify-center h-[50px] lg:h-[57px] text-center px-[25px] py-[17px]">
          INSCREVA-SE JÁ
        </button>
        <a href="#" className="border-2 border-[#7af] lg:border-[#77aaff] text-white text-[14px] lg:text-[18px] font-extrabold lg:font-bold uppercase rounded-[10px] lg:rounded-[12px] hover:bg-white/10 transition-colors font-['Kumbh_Sans'] flex items-center justify-center gap-[10px] lg:gap-[15px] w-full sm:w-auto h-[50px] lg:h-[57px] px-[20px] py-[18px]">
          <img src={imgDownload} alt="" className="w-6 h-6 object-contain shrink-0" />
          <span className="shrink-0 whitespace-nowrap">BAIXAR MATRIZ COMPLETA</span>
        </a>
      </div>
    </section>
  )
}