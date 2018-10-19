// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'lastdays-d18b8c'
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const dayRes = await db.collection('dateLists').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        openid: event.userInfo.openId,
        title: event.title,
        date: event.date,
        periodIndex: event.periodIndex,
        des: event.des,
        createNickname: event.createNickname,
        createAvatarUrl: event.createAvatarUrl,
        createTime: db.serverDate(),
        parentID: event.parentID ? event.parentID : ''
      }
    });
    return await db.collection('jionUsers').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        openid: event.userInfo.openId,
        listID: event.parentID ? event.parentID : dayRes._id,
        nickname: event.createNickname,
        avatarUrl: event.createAvatarUrl,
        createTime: db.serverDate()
      }
    })
  } catch (e) {
    console.error(e)
  }
}