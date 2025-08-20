import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo centralizada */}
          <div className="flex justify-center">
            <Image
              src="/images/nextpage-logo-dark.png"
              alt="Nexpage"
              width={160}
              height={53}
              className="h-12 w-auto"
            />
          </div>

          {/* Copyright */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 NexPage. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
