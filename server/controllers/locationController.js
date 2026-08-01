const { provinces, districts, municipalities } = require("../data/nepal-locations");

const normalizeName = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

const NAME_ALIASES = {
  bagamati: "bagmati",
  bagamatiprovince: "bagmatiprovince",
  sudurpashchim: "sudurpaschim",
  sudurpashchimprovince: "sudurpaschimprovince",
  janakpur: "janakpurdham",
  pokharametropolitancity: "pokhara",
  kathmandumetropolitancity: "kathmandu",
  lalitpurmetropolitancity: "lalitpur",
  biratnagarmetropolitancity: "biratnagar",
  birgunjmetropolitancity: "birgunj",
  bharatpurmetropolitancity: "bharatpur",
  "nepalganj": "nepalganj",
};

const normalizeForMatch = (name) => {
  const norm = normalizeName(name);
  return NAME_ALIASES[norm] || norm;
};

const matchName = (list, name, key = "name") => {
  const target = normalizeForMatch(name);
  if (!target) return "";
  const exact = list.find((item) => normalizeForMatch(item[key]) === target);
  if (exact) return exact[key];
  const partial = list.find(
    (item) => normalizeForMatch(item[key]).includes(target) || target.includes(normalizeForMatch(item[key]))
  );
  return partial ? partial[key] : "";
};

const reverseGeocodeLocation = async (lat, lng) => {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=jsonv2&addressdetails=1&accept-language=en&zoom=10`;
  const response = await fetch(url, {
    headers: { "User-Agent": "sadaksewa-app/1.0 (dev)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Nominatim error: ${response.status}`);
  const data = await response.json();
  const addr = data.address || {};

  const provinceRaw = addr.state || "";
  const districtRaw = addr.county || addr.state_district || "";
  const municipalityRaw = addr.city || addr.town || addr.village || addr.municipality || "";

  return {
    province: provinceRaw ? matchName(provinces, provinceRaw) || provinceRaw : "",
    district: districtRaw ? matchName(districts, districtRaw) || districtRaw : "",
    municipality: municipalityRaw ? matchName(municipalities, municipalityRaw) || municipalityRaw : "",
  };
};

const getReverseGeocode = async (req, res) => {
  const { lat, lng } = req.query;
  if (!lat || !lng) {
    return res.status(400).json({ success: false, message: "lat and lng are required" });
  }

  try {
    const data = await reverseGeocodeLocation(lat, lng);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(502).json({ success: false, message: "Reverse geocoding failed" });
  }
};

const getProvinces = (req, res) => {
  res.json({ success: true, data: provinces });
};

const getDistricts = (req, res) => {
  const { provinceId } = req.query;
  let result = districts;
  if (provinceId) {
    result = districts.filter((d) => d.province_id === Number(provinceId));
  }
  res.json({ success: true, data: result });
};

const getMunicipalities = (req, res) => {
  const { districtId } = req.query;
  let result = municipalities;
  if (districtId) {
    result = municipalities.filter((m) => m.district_id === Number(districtId));
  }
  res.json({ success: true, data: result });
};

module.exports = { getProvinces, getDistricts, getMunicipalities, getReverseGeocode, reverseGeocodeLocation };
