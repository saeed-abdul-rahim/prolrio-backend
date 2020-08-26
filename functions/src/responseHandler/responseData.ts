const timestamp = Date.now();
type ResponseData = {
    data?: any,
    message?: string,
    timestamp: number
}

export const getErrorResponse = (message: string) => {
    const responseData: ResponseData = { message, timestamp };
    return responseData
}

export const getSuccessResponse = (data: any) => {
    const responseData: ResponseData = { data, timestamp };
    return responseData
}
