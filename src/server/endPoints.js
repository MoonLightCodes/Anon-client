export const baseUrl = 'http://localhost:8888'
const  paths={
    baseUrl,
    createRoom : baseUrl+'/api/createRoom',
    genRoom : baseUrl+'/api/genRoom',
    login: baseUrl+'/user/login',
    signUp: baseUrl+'/user/register',
    getChats: baseUrl+'/api/getChats',
    deleteChat:baseUrl+'/api/deleteChat',
    exitChat:baseUrl+'/api/exitChat',
}
export default paths;
