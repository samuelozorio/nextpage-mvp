import Image from "next/image";

export function Hero() {
  return (
    <section className="relative h-[680px] flex items-center">
      {/* Imagem de background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-cover.png"
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay escuro para melhorar legibilidade */}
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto px-4 relative z-10 w-full">
        <div className=" flex flex-col w-full">
          {/* Logo */}
          <div className="mb-8">
            <Image
              src="/images/nextpage-logo-dark.png"
              alt="Nexpage"
              width={200}
              height={67}
              className="h-16 w-auto"
            />
          </div>

          {/* Título principal */}
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-2xl">
            Sua próxima página começa aqui!
          </h1>

          {/* Descrição */}
          <p className="text-xl text-gray-200 leading-relaxed max-w-sm text-center self-end">
            Plataforma de conteúdo digital com mais de 1000 E-BOOKS e conteúdos
            de todos os gêneros, com curadoria apurada e atualização constante
          </p>
        </div>
      </div>
    </section>
  );
}
