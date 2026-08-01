const express = require("express");
const router = express.Router();
const { getProvinces, getDistricts, getMunicipalities, getReverseGeocode } = require("../controllers/locationController");

router.get("/provinces", getProvinces);
router.get("/districts", getDistricts);
router.get("/municipalities", getMunicipalities);
router.get("/reverse-geocode", getReverseGeocode);

module.exports = router;
