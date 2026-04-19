import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { useVisitorCommands } from "@/hooks/useVisitorCommands";

/** Mounted inside Router to track visits and listen for admin commands. Renders nothing. */
const VisitorTracker = () => {
  useVisitorTracking();
  useVisitorCommands();
  return null;
};

export default VisitorTracker;
