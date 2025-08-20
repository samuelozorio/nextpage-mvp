import Image from "next/image";

export function ThirdFold() {
  return (
    <section className="bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Conteúdo à esquerda */}
        <div className="flex items-center justify-center px-8 py-20">
          <div className="space-y-6 max-w-lg">
            <p className="text-xl text-gray-600 leading-relaxed">
              Venha conhecer como podemos oferecer um benefício exclusivo aos
              seus clientes, mudando a forma de se relacionar com eles,
              proporcionando ganhos mútuos e um salto na rentabilidade da sua
              empresa.
            </p>
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                <span className="text-[#7ed957]">AUMENTE</span> seu valor para
                os clientes
              </h3>
              <h3 className="text-3xl font-bold text-gray-900 leading-tight">
                <span className="text-[#7ed957]">MAXIMIZE</span> seus ganhos !!!
              </h3>
            </div>
          </div>
        </div>

        {/* Imagem à direita - ocupando da metade até a totalidade da tela */}
        <div className="relative h-[400px] lg:h-[600px]">
          <Image
            src="/images/money.png"
            alt="Dinheiro e sucesso"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
