import { Header } from "./header";
import { Hero } from "./hero";
import { SecondFold } from "./second-fold";
import { ThirdFold } from "./third-fold";
import { Footer } from "./footer";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <SecondFold />
      <ThirdFold />
      <Footer />
    </div>
  );
}
