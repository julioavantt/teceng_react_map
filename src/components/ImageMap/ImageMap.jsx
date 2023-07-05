import { useEffect } from "react"
import L from "leaflet"

import "leaflet/dist/leaflet.css"
import { configData, markerConfigData, markersData } from "./data"

L.RasterCoords = require("leaflet-rastercoords")

export const ImageMap = () => {
	useEffect(() => {
		if (L.DomUtil.get("map") !== null) L.DomUtil.get("map")._leaflet_id = null

		const { img, minZoom, maxZoom } = configData
		const { iconBlue, iconRed, markerCommon } = markerConfigData

		var map = L.map("map", {
			crs: L.CRS.Simple,
			minZoom,
			maxZoom,
		})

		var rc = new L.RasterCoords(map, img)

		L.control.layers({}, { Info: layerGeo(map, rc) }).addTo(map)

		function layerGeo(map, rc) {
			var redMarker = L.icon({ ...markerCommon, iconUrl: iconRed })
			var blueMarker = L.icon({ ...markerCommon, iconUrl: iconBlue })
			var layerGeo = L.geoJson(markersData, {
				coordsToLatLng: function (coords) {
					return rc.unproject(coords)
				},
				onEachFeature: function (feature, layer) {
					if (feature.properties && feature.properties.name) {
						layer.bindPopup(
							"<p><b>" +
								feature.properties.name +
								"</b><br />" +
								feature.properties.detail +
								"</p>"
						)
					}
				},
				pointToLayer: function (feature, latlng) {
					return L.marker(latlng, {
						icon: feature?.properties?.status === 1 ? blueMarker : redMarker,
					})
				},
			})
			map.addLayer(layerGeo)
			return layerGeo
		}

		map.setView(rc.unproject([img[0], img[1]]), 2)

		L.tileLayer("img/tiles/{z}/{x}/{y}.png", {
			noWrap: true,
			bounds: rc.getMaxBounds(),
			maxNativeZoom: rc.zoomLevel(),
		}).addTo(map)
	}, [])

	return <div id="map" />
}
