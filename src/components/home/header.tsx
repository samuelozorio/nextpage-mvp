"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useState } from "react";
import { PartnerSelectionModal } from "./partner-selection-modal";

export function Header() {
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);

  return (
    <>
      <header className="bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Image
                src="/images/nextpage-logo-dark.png"
                alt="Nexpage"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>

            {/* Links de navegação */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="#inicio"
                className="hover:text-gray-300 transition-colors"
              >
                Início
              </Link>
              <Link
                href="#o-que-e"
                className="hover:text-gray-300 transition-colors"
              >
                O que é a Nexpage?
              </Link>
              <Link
                href="#solucoes"
                className="hover:text-gray-300 transition-colors"
              >
                Soluções
              </Link>
              <Link
                href="#contato"
                className="hover:text-gray-300 transition-colors"
              >
                Contato
              </Link>
            </nav>

            {/* Botão de login */}
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setIsPartnerModalOpen(true)}
              >
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de seleção de parceiros */}
      <PartnerSelectionModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />
    </>
  );
}
