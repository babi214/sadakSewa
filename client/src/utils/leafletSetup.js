import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

export { L }

export function getReportCoordinates(report) {
  const coords = report?.location?.coordinates
  if (!coords || coords.length < 2) return null
  return { lng: coords[0], lat: coords[1] }
}

const CONSTRUCTION_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16.05 10.006a1 1 0 0 0 .9-1.648l-4.081-6.998a1 1 0 0 0-1.734 0l-4.081 6.998a1 1 0 0 0 .9 1.648h8.096z"/>
    <path d="M4.655 16.008a1 1 0 0 0 .895 1.648h12.9a1 1 0 0 0 .895-1.648l-1.943-3.316H6.598l-1.943 3.316z"/>
  </svg>
`

export function createReportMarkerIcon(isActive = false) {
  return L.divIcon({
    className: '',
    html: `
      <div class="report-map-marker ${isActive ? 'report-map-marker--active' : ''}">
        <div class="report-map-marker__pin">
          ${CONSTRUCTION_SVG}
        </div>
        <div class="report-map-marker__shadow"></div>
      </div>
    `,
    iconSize: [40, 48],
    iconAnchor: [20, 48],
    popupAnchor: [0, -44],
  })
}

export function createUserLocationIcon() {
  return L.divIcon({
    className: '',
    html: `
      <div class="user-map-marker">
        <div class="user-map-marker__dot"></div>
        <div class="user-map-marker__pulse"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}
