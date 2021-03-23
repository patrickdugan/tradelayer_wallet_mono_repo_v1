import { axiosInstance } from '../api'

const ltcInstantTrade = async (buildOptions) => {
    const result = await axiosInstance.get('/txn/ltcInstantTrade', { params: buildOptions });
    return result.data;
}

const tokenTokenTrade = async (buildOptions) => {
    const result = await axiosInstance.get('/txn/tokenTokenTrade', { params: buildOptions });
    return result.data;
}

export const txnService = {
    ltcInstantTrade,
    tokenTokenTrade,
}
