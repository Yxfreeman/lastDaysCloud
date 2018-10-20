// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'lastdays-d18b8c'
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    await db.collection('dateLists').doc(event.id).update({
      data: {
        isDelete: 1
      }
    });
    return await db.collection('jionUsers').where({
      openid: event.userInfo.openId,
      listID: event.id
    }).remove();
  } catch (e) {
    console.error(e)
  }
}