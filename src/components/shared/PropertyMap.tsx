import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AdvancedMarker,
  APIProvider,
  APILoadingStatus,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps';
import { MapPin, ShieldAlert } from 'lucide-react';
import type { Property } from '@/src/types/domain';
import { formatINR } from '@/src/lib/format';

const GOOGLE_MAPS_API_KEY = (
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
).trim();

export const isGoogleMapsConfigured = GOOGLE_MAPS_API_KEY.length > 0;

interface PropertyMapProps {
  properties: Property[];
  heightClassName?: string;
  zoom?: number;
}

function MapsInnerCanvas({
  properties,
  zoom,
}: {
  properties: Property[];
  zoom: number;
}) {
  const status = useApiLoadingStatus();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    properties.length === 1 ? properties[0].id : null
  );

  if (
    status === APILoadingStatus.FAILED ||
    status === APILoadingStatus.AUTH_FAILURE
  ) {
    return (
      <div className="flex h-full items-center justify-center bg-secondary/60 p-6 text-center">
        <div className="max-w-md space-y-2">
          <div className="text-sm font-semibold text-navy">
            Google Maps failed to authorize
          </div>
          <p className="text-xs text-muted-foreground">
            Verify that VITE_GOOGLE_MAPS_API_KEY is active with the Maps
            JavaScript API enabled and HTTP referrer restrictions configured.
          </p>
        </div>
      </div>
    );
  }

  const center =
    properties.length === 1
      ? properties[0].coordinates
      : {
          lat:
            properties.reduce((sum, p) => sum + p.coordinates.lat, 0) /
            Math.max(1, properties.length),
          lng:
            properties.reduce((sum, p) => sum + p.coordinates.lng, 0) /
            Math.max(1, properties.length),
        };

  const selectedProperty =
    properties.find((p) => p.id === selectedPropertyId) ?? null;

  return (
    <GoogleMap
      mapId="DEMO_MAP_ID"
      defaultCenter={center}
      defaultZoom={zoom}
      gestureHandling="cooperative"
      internalUsageAttributionIds={[
        'gmp_mcp_codeassist_v1_aistudio',
        'gmp_git_agentskills_v1',
      ]}
      style={{ width: '100%', height: '100%' }}
    >
      {properties.map((property) => (
        <AdvancedMarker
          key={property.id}
          position={property.coordinates}
          title={`${property.name} — ${property.city}`}
          onClick={() => setSelectedPropertyId(property.id)}
        >
          <Pin
            background={selectedPropertyId === property.id ? '#0F1D32' : '#0F766E'}
            borderColor="#FFFFFF"
            glyphColor="#FFFFFF"
          />
        </AdvancedMarker>
      ))}

      {selectedProperty && (
        <InfoWindow
          position={selectedProperty.coordinates}
          onCloseClick={() => setSelectedPropertyId(null)}
          maxWidth={260}
        >
          <div className="p-1 text-left space-y-1">
            <div className="text-[11px] text-primary font-medium">
              Verified Direct Stay
            </div>
            <div className="text-sm font-semibold text-navy">
              {selectedProperty.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedProperty.locality}, {selectedProperty.city}
            </div>
            <div className="flex items-center justify-between pt-1.5 gap-3">
              <span className="font-tabular text-xs font-semibold text-navy">
                From {formatINR(selectedProperty.startingRateInr)}/night
              </span>
              <Link
                to={`/hotels/${selectedProperty.id}`}
                className="text-xs font-medium text-primary hover:underline"
              >
                Inspect →
              </Link>
            </div>
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}

export function PropertyMap({
  properties,
  heightClassName = 'h-[360px]',
  zoom,
}: PropertyMapProps) {
  const effectiveZoom = zoom ?? (properties.length === 1 ? 13 : 5);

  if (properties.length === 0) {
    return null;
  }

  if (!isGoogleMapsConfigured) {
    return (
      <div className="rounded-xl border border-border bg-secondary/50 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <MapPin
            className="h-5 w-5 text-primary shrink-0 mt-0.5"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <div className="text-sm font-semibold text-navy">
              Google Maps: Not configured
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Interactive Google Maps Platform pins activate automatically when{' '}
              <code className="font-tabular text-xs bg-card px-1.5 py-0.5 rounded border border-border">
                VITE_GOOGLE_MAPS_API_KEY
              </code>{' '}
              is configured in environment variables.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border">
          {properties.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-border bg-card px-3 py-2.5 flex items-center justify-between gap-2 text-xs"
            >
              <div className="min-w-0">
                <div className="font-medium text-navy truncate">{p.name}</div>
                <div className="text-muted-foreground truncate">
                  {p.locality}, {p.city}
                </div>
              </div>
              <span className="font-tabular text-[11px] text-muted-foreground shrink-0">
                {p.coordinates.lat.toFixed(3)}°N, {p.coordinates.lng.toFixed(3)}°E
              </span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Maps locations provide geographic context only and are never proof of
          live room availability or pricing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={`w-full overflow-hidden rounded-xl border border-border bg-secondary/30 ${heightClassName}`}
      >
        <APIProvider
          apiKey={GOOGLE_MAPS_API_KEY}
          libraries={['marker']}
          language="en"
          region="IN"
        >
          <MapsInnerCanvas properties={properties} zoom={effectiveZoom} />
        </APIProvider>
      </div>
      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
        <ShieldAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Map pins indicate property geography for planning and orientation.
      </p>
    </div>
  );
}
