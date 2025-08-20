import Image from "next/image";

export function SecondFold() {
  return (
    <section className="bg-black text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Imagem à esquerda - ocupando da metade até a totalidade da tela */}
        <div className="relative h-auto">
          <Image
            src="/images/leitura.png"
            alt="Pessoa lendo"
            fill
            className="object-cover"
          />
        </div>

        {/* Conteúdo à direita */}
        <div className="flex items-center justify-center px-8 py-20">
          <div className="space-y-6 max-w-lg">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Transforme a experiência de compra em sua loja em um momento de
              alto valor.
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Com a NexPage, você presenteia seus clientes com acesso à um
              universo de e-books de alta qualidade. Um benefício exclusivo que
              fortalece o relacionamento, fideliza e posiciona sua marca como
              inovadora. Conhecimento e entretenimento, o presente ideal.
            </p>
            <h3 className="text-3xl font-bold leading-tight">
              SAIA DO COMUM, Conquiste o{" "}
              <span className="text-[#ff2828]">CORAÇÃO</span> e a{" "}
              <span className="text-[#ff2828]">MENTE</span> dos seus clientes
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}
