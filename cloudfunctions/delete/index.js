// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: 'product-ff8906'
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 若是过期，并且是重复的，则只对dateLists表数据进行更新
    if (event.isLasted && event.isRepeat) {
      return await db.collection('dateLists').doc(event.id).update({
        data: {
          isDelete: 1
        }
      });
    } else { // 没有过期，并且是不重复的，则对分享人也进行删除
      await db.collection('dateLists').doc(event.id).update({
        data: {
          isDelete: 1
        }
      });
      return await db.collection('jionUsers').where({
        openid: event.userInfo.openId,
        listID: event.parentid ? event.parentid : event.id
      }).remove();
    }
  } catch (e) {
    console.error(e)
  }
}