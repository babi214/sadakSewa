const express = require("express");
const router = express.Router();
const { getProvinces, getDistricts, getMunicipalities } = require("../controllers/locationController");

router.get("/provinces", getProvinces);
router.get("/districts", getDistricts);
router.get("/municipalities", getMunicipalities);

module.exports = router;
