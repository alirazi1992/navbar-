import { useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { formatDateTime } from "@/utils";
import { useLocale } from "@/contexts/LocaleContext.jsx";
import { vesselStatusLabels } from "@/utils/labels.js";

// Configure default marker assets to avoid missing icon errors
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export default function QuickMap({ vessels = [], center = [25.274, 55.296], zoom = 6 }) {
  const { t, isRtl } = useLocale();
  const plottedVessels = useMemo(
    () => vessels.filter((vessel) => vessel.latitude && vessel.longitude),
    [vessels]
  );

  return (
    <Card className="overflow-hidden border-slate-800/80 bg-slate-900/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MapPin className="h-5 w-5 text-cyan-400" />
          {t({ en: "Live fleet positions", fa: "موقعیت لحظه‌ای ناوگان" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[320px] w-full">
          <MapContainer
            center={center}
            zoom={zoom}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {plottedVessels.map((vessel) => (
              <Marker key={vessel.id} position={[vessel.latitude, vessel.longitude]}>
                <Popup>
                  <div className={`space-y-1 text-sm ${isRtl ? "text-right" : ""}`} dir={isRtl ? "rtl" : "ltr"}>
                    <h4 className="text-base font-semibold text-slate-900">{vessel.name}</h4>
                    <p>
                      <span className="font-medium text-slate-700">
                        {t({ en: "Type:", fa: "نوع:" })}
                      </span>{" "}
                      {vessel.type}
                    </p>
                    <p>
                      <span className="font-medium text-slate-700">
                        {t({ en: "Status:", fa: "وضعیت:" })}
                      </span>{" "}
                      {t(vesselStatusLabels[vessel.status] ?? vessel.status)}
                    </p>
                    {vessel.destination && (
                      <p>
                        <span className="font-medium text-slate-700">
                          {t({ en: "Destination:", fa: "مقصد:" })}
                        </span>{" "}
                        {vessel.destination}
                      </p>
                    )}
                    {vessel.updated_date && (
                      <p className="text-xs text-slate-500">
                        {t({ en: "Updated", fa: "به‌روزرسانی" })} {formatDateTime(vessel.updated_date)}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
      <CardFooter className={`border-t border-slate-800/80 bg-slate-900/70 text-xs text-slate-400 ${isRtl ? "text-right" : ""}`}>
        {plottedVessels.length > 0
          ? t({
              en: `${plottedVessels.length} vessel${plottedVessels.length === 1 ? "" : "s"} plotted on the map.`,
              fa: `${plottedVessels.length} شناور روی نقشه نمایش داده شده است.`,
            })
          : t({ en: "No coordinates available for the current selection.", fa: "مختصات فعالی برای نمایش وجود ندارد." })}
      </CardFooter>
    </Card>
  );
}
