import { Component, lazy, Suspense, type ReactNode } from "react";
import type { CityPoint, ServiceKey } from "./LeafletMap";

const LeafletMap = lazy(() => import("./LeafletMap"));

interface State { hasError: boolean; message?: string }
interface Props {
  cities: CityPoint[];
  view: "coverage" | "speeds";
  service: ServiceKey | "all";
  focusToken?: number;
  focusCountry?: string;
  showGovernorates?: boolean;
  onCountryClick?: (country: string) => void;
  selectedCountry?: string;
  onServiceChange?: (s: ServiceKey | "all") => void;
}

class Boundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[480px] border border-foreground/10 flex items-center justify-center text-sm text-muted-foreground">
          تعذّر تحميل الخريطة. {this.state.message}
        </div>
      );
    }
    return this.props.children;
  }
}

const Fallback = () => (
  <div className="w-full h-[480px] border border-foreground/10 flex items-center justify-center text-sm text-muted-foreground">
    جارٍ تحميل الخريطة...
  </div>
);

const LeafletMapBoundary = (props: Props) => (
  <Boundary>
    <Suspense fallback={<Fallback />}>
      <LeafletMap {...props} />
    </Suspense>
  </Boundary>
);

export default LeafletMapBoundary;
