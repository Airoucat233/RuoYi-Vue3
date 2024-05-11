import JSEncrypt from 'jsencrypt/bin/jsencrypt.min'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = `MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALsh1IHU9F7jrvMhLTeZi1mvNt9xIU6e
vKGNzJnqty0G4I7LUWE8wyRKO7GJxhspzCXHVc0/ZH8wCXSMvASdPc8CAwEAAQ==`

const privateKey = `MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEAuyHUgdT0XuOu8yEt
N5mLWa8233EhTp68oY3Mmeq3LQbgjstRYTzDJEo7sYnGGynMJcdVzT9kfzAJdIy8
BJ09zwIDAQABAkEAjnONUpwqvoUyK9ConDedVdNEwUlcYn4B+DV6d/yuHm5az8cX
oEUhHYfP7F6CRWAaU6a4KWY4GkWfGyIeNuP+YQIhAPjNeg4Jf8b4H3JpMq84UaCV
EuYVl7AHkfGHciEBw7PRAiEAwIumEUdtQbMSYQhEdYulDtNZ4jlK6VK9WhoUVUp2
X58CICuqdFduV1ymQ26jA+A4tCrIvw5ej8a3LWgEa4Vbd+thAiAwnhJcopBv2mt1
nMTMeWpACBXWDWlg6MdvDM69ioPBOQIgCGptaywKnlKqMZuwhQRaJ/VO+/YQSj+H
HrYq397ZnKk=`

// 加密
export function encrypt(txt) {
    const encryptor = new JSEncrypt()
    encryptor.setPublicKey(publicKey) // 设置公钥
    return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt(txt) {
    const encryptor = new JSEncrypt()
    encryptor.setPrivateKey(privateKey) // 设置私钥
    return encryptor.decrypt(txt) // 对数据进行解密
}
