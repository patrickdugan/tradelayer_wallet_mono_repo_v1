import {axiosInstance} from '../api'

const rpcCall = async (command, ...args) => {
    const params = {
        command,
        args: JSON.stringify(args),
    }
    const result = await axiosInstance.get('/txn/callRPC', { params })
    return result.data;

}

const asyncTL = async (command, ...args) => {
    const params = {
        command, 
        args: JSON.stringify(args),
    }
    const result = await axiosInstance.get('/txn/callAsyncRPC', { params});
    return result.data;
}
export const rpcApis = {
    rpcCall,
    asyncTL,
}