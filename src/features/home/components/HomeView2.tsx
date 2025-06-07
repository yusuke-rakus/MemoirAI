import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const HomeView2 = () => {
  return (
    <>
      <h1>Home Page2</h1>
      <Button
        onClick={() => {
          toast.message("hej");
        }}
      >
        Click Me
      </Button>
    </>
  );
};
