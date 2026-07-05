import api from '../api/axios'

export const locationService = {
  getProvinces: async () => {
    const { data } = await api.get('/locations/provinces')
    return data
  },

  getDistricts: async (provinceId) => {
    const params = provinceId ? { provinceId } : {}
    const { data } = await api.get('/locations/districts', { params })
    return data
  },

  getMunicipalities: async (districtId) => {
    const params = districtId ? { districtId } : {}
    const { data } = await api.get('/locations/municipalities', { params })
    return data
  },
}
