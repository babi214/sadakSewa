const { provinces, districts, municipalities } = require("../data/nepal-locations");

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

module.exports = { getProvinces, getDistricts, getMunicipalities };
