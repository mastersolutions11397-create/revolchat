import { useState } from "react";
import { AnimatePresence } from "framer-motion";

import { PromoCard } from "@/components/ui/card-9";
import { Button } from "@/components/ui/button";

export default function PromoCardDemo() {
  const [isCardVisible, setIsCardVisible] = useState(true);

  const handleGetStarted = () => {
    alert("Get Started button clicked!");
    setIsCardVisible(false);
  };

  const handleClose = () => {
    setIsCardVisible(false);
  };

  const handleShowCard = () => {
    setIsCardVisible(true);
  };

  return (
    <div className="flex min-h-[450px] w-full flex-col items-center justify-center gap-4 bg-background p-4">
      <AnimatePresence>
        {isCardVisible && (
          <PromoCard
            label="Join VeloMark Pro!"
            title={<>Ready to boost <br /> your performance?</>}
            buttonText="Get Started"
            onButtonClick={handleGetStarted}
            onClose={handleClose}
          />
        )}
      </AnimatePresence>

      {!isCardVisible && (
        <Button onClick={handleShowCard}>Show Promo Card</Button>
      )}
    </div>
  );
}


