export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'Gabriel Arruda',
      course: 'Graduação em Administração',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic.',
      rating: '5.0',
      stars: 5
    },
    {
      id: 2,
      name: 'Gabriel Arruda',
      course: 'Graduação em Alfabetização e Letramento',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic.',
      rating: '4.2',
      stars: 4 
    },
    {
      id: 3,
      name: 'Gabriel Arruda',
      course: 'Curso de Administração',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic.',
      rating: '4.6',
      stars: 5
    },
    {
      id: 4,
      name: 'Gabriel Arruda',
      course: 'Curso de Administração',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic.',
      rating: '5.0',
      stars: 5
    }
  ]

  return (
    <section className="w-full flex flex-col items-center py-12 lg:py-[60px] bg-[#09419f] mt-12 lg:mt-[60px]">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="w-full max-w-[1240px] flex flex-col items-start px-4 lg:px-8">
        <h2 className="text-white text-[28px] lg:text-[35px] font-extrabold uppercase font-['Kumbh_Sans'] leading-tight mb-12">
          O QUE NOSSOS ALUNOS DIZEM...
        </h2>
        
        <div className="flex w-full gap-[20px] overflow-x-auto pb-6 snap-x hide-scrollbar">
          {testimonials.map(item => (
            <div key={item.id} className="bg-[#f4f4f4] rounded-[16px] p-6 flex flex-col gap-4 shrink-0 w-[280px] lg:w-[306px] snap-start">
              <img src="/course/mask_group.webp" alt="Aspas" className="mb-2 w-[47px] h-[30px] object-contain" />
              
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-[20px] text-black font-['Kumbh_Sans'] leading-tight">{item.name}</h3>
                <p className="font-normal text-[14px] text-black font-['Kumbh_Sans'] leading-snug min-h-[42px]">{item.course}</p>
              </div>
              
              <div className="h-px bg-[#d9d9d9] w-full"></div>
              
              <p className="font-normal text-[12px] text-[#0b111f] font-['Liberation_Sans'] leading-relaxed tracking-[-0.24px] min-h-[118px]">
                {item.text}
              </p>
              
              <div className="flex items-center gap-3 mt-auto pt-2">
                <span className="font-semibold text-[14px] text-black font-['Kumbh_Sans']">{item.rating}</span>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(star => (
                    <img 
                      key={star} 
                      src="/course/star.webp" 
                      alt="Estrela" 
                      className={`w-[19px] h-[19px] object-contain ${star <= item.stars ? "" : "grayscale opacity-30 brightness-150"}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
