import Link from 'next/link';
import type { Location } from './constants';

interface InfoPanelProps {
  selectedLocation: Location;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ selectedLocation }) => {
  const slug = selectedLocation.name.toLowerCase().replace(/\s+/g, '-');
  const arLink = `/ar/${slug}`;
  const vrLink = `/vr/${slug}`;

  return (
    <div className="flex w-72 items-start gap-3 text-card-foreground sm:w-80">
      <img
        src={selectedLocation.image}
        alt={selectedLocation.name}
        className="h-20 w-20 rounded-md object-cover"
      />
      <div className="flex-grow">
        <h3 className="text-base font-bold">{selectedLocation.name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{selectedLocation.description}</p>
        <div className="mt-2 flex flex-col gap-2">
          <Link
            href={arLink}
            className="rounded-md bg-orange-600 py-1.5 px-3 text-center text-xs font-semibold text-black transition-colors hover:bg-orange-700"
          >
            AR Experience
          </Link>
          <Link
            href={vrLink}
            className="rounded-md border border-orange-400 py-1.5 px-3 text-center text-xs font-semibold text-orange-600 transition-colors hover:bg-orange-600/10"
          >
            VR Tour
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;